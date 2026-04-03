import { createHash } from 'node:crypto'
import { query } from '../../utils/db.js'
import { optionalAuth } from '../../utils/auth.js'

/**
 * GET /api/share/:hash — Retrieve a shared note by its hash.
 * No authentication required. Records a view if analytics are enabled.
 */
export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, 'hash')

  if (!hash || hash.length !== 32) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
  }

  const result = await query(`
    SELECT id, hash, title, description, tags, content, sharer_name, sharer_email,
           anonymous, expires_at, created_at, collect_analytics, deleted_at
    FROM shared_notes WHERE hash = $1
  `, [hash])

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shared note not found' })
  }

  const row = result.rows[0]

  if (row.deleted_at) {
    throw createError({ statusCode: 410, statusMessage: 'This shared note is no longer available' })
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    throw createError({ statusCode: 410, statusMessage: 'This shared note has expired' })
  }

  if (row.collect_analytics) {
    await recordEvent(event, row.id, 'view')
  }

  return {
    hash: row.hash,
    title: row.title,
    description: row.description,
    tags: row.tags,
    content: row.content,
    sharer: row.anonymous ? null : {
      name: row.sharer_name,
      email: row.sharer_email
    },
    createdAt: row.created_at,
    expiresAt: row.expires_at
  }
})

/**
 * Build a viewer fingerprint to identify the same person across repeat visits.
 * - Logged-in user with tracking allowed: "user:<id>"
 * - Logged-in user with privacy on: "private:<hash of userId + shared_note_id>"
 *   (unique per share so it can't be correlated across shares)
 * - Anonymous: "anon:<hash of ip + user_agent>"
 */
function buildFingerprint(auth, privacyOn, ipAddress, userAgent, sharedNoteId) {
  if (auth && !privacyOn) {
    return `user:${auth.userId}`
  }
  if (auth && privacyOn) {
    // Still fingerprint so we can count unique private viewers, but no PII leaks
    const raw = `private:${auth.userId}:${sharedNoteId}`
    return `private:${createHash('sha256').update(raw).digest('hex').slice(0, 16)}`
  }
  // Anonymous — fingerprint from IP + UA
  const raw = `anon:${ipAddress || 'no-ip'}:${userAgent || 'no-ua'}`
  return `anon:${createHash('sha256').update(raw).digest('hex').slice(0, 16)}`
}

/**
 * Record a view or import event for analytics.
 */
async function recordEvent(event, sharedNoteId, eventType) {
  const auth = await optionalAuth(event)
  const userAgent = getHeader(event, 'user-agent') || null
  const referrer = getHeader(event, 'referer') || null

  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIp = getHeader(event, 'x-real-ip')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : (realIp || null)

  let viewerUserId = null
  let viewerName = null
  let recordUserAgent = null
  let recordIp = null
  let privacyOn = false

  if (auth) {
    const privResult = await query(
      'SELECT privacy_no_tracking, name FROM users WHERE id = $1',
      [auth.userId]
    )
    const viewer = privResult.rows[0]
    privacyOn = !viewer || viewer.privacy_no_tracking
    if (viewer && !viewer.privacy_no_tracking) {
      viewerUserId = auth.userId
      viewerName = viewer.name || null
      recordUserAgent = userAgent
      recordIp = ipAddress
    }
  } else {
    recordUserAgent = userAgent
    recordIp = ipAddress
  }

  const fingerprint = buildFingerprint(auth, privacyOn, ipAddress, userAgent, sharedNoteId)

  query(`
    INSERT INTO share_views (shared_note_id, viewer_user_id, viewer_name, user_agent, ip_address, referrer, event_type, viewer_fingerprint)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [sharedNoteId, viewerUserId, viewerName, recordUserAgent, recordIp, referrer, eventType, fingerprint]).catch(() => {})
}

// Export for reuse by import endpoint
export { buildFingerprint }
