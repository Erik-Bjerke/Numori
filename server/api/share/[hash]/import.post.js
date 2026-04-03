import { createHash } from 'node:crypto'
import { query } from '../../../utils/db.js'
import { optionalAuth } from '../../../utils/auth.js'

/**
 * POST /api/share/:hash/import — Record that someone imported this shared note.
 */
export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, 'hash')

  const result = await query(
    'SELECT id, collect_analytics FROM shared_notes WHERE hash = $1 AND deleted_at IS NULL',
    [hash]
  )

  if (result.rows.length === 0) return { ok: true }

  const row = result.rows[0]
  if (!row.collect_analytics) return { ok: true }

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

  // Build fingerprint
  let fingerprint
  if (auth && !privacyOn) {
    fingerprint = `user:${auth.userId}`
  } else if (auth && privacyOn) {
    const raw = `private:${auth.userId}:${row.id}`
    fingerprint = `private:${createHash('sha256').update(raw).digest('hex').slice(0, 16)}`
  } else {
    const raw = `anon:${ipAddress || 'no-ip'}:${userAgent || 'no-ua'}`
    fingerprint = `anon:${createHash('sha256').update(raw).digest('hex').slice(0, 16)}`
  }

  await query(`
    INSERT INTO share_views (shared_note_id, viewer_user_id, viewer_name, user_agent, ip_address, referrer, event_type, viewer_fingerprint)
    VALUES ($1, $2, $3, $4, $5, $6, 'import', $7)
  `, [row.id, viewerUserId, viewerName, recordUserAgent, recordIp, referrer, fingerprint])

  return { ok: true }
})
