import { requireAuth } from '../../../utils/auth.js'
import { query } from '../../../utils/db.js'

/**
 * GET /api/share/:hash/analytics — Get view analytics for a shared note.
 * Only the owner can access. Works even after soft-delete (unshare).
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const hash = getRouterParam(event, 'hash')

  // Verify ownership (include soft-deleted)
  const noteResult = await query(
    'SELECT id, collect_analytics, deleted_at FROM shared_notes WHERE hash = $1 AND user_id = $2',
    [hash, auth.userId]
  )

  if (noteResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shared note not found or not owned by you' })
  }

  const sharedNote = noteResult.rows[0]

  if (!sharedNote.collect_analytics) {
    return { enabled: false, totalViews: 0, totalImports: 0, uniqueViewers: 0, views: [] }
  }

  // Aggregates
  const totalViewsRes = await query(
    "SELECT COUNT(*) as count FROM share_views WHERE shared_note_id = $1 AND event_type = 'view'",
    [sharedNote.id]
  )
  const totalImportsRes = await query(
    "SELECT COUNT(*) as count FROM share_views WHERE shared_note_id = $1 AND event_type = 'import'",
    [sharedNote.id]
  )
  const knownRes = await query(
    'SELECT COUNT(DISTINCT viewer_user_id) as count FROM share_views WHERE shared_note_id = $1 AND viewer_user_id IS NOT NULL',
    [sharedNote.id]
  )
  const anonRes = await query(
    'SELECT COUNT(*) as count FROM share_views WHERE shared_note_id = $1 AND viewer_user_id IS NULL',
    [sharedNote.id]
  )

  // All events (last 100)
  const viewsResult = await query(`
    SELECT id, viewer_name, user_agent, ip_address, referrer, event_type, viewed_at
    FROM share_views
    WHERE shared_note_id = $1
    ORDER BY viewed_at DESC
    LIMIT 100
  `, [sharedNote.id])

  const views = viewsResult.rows.map(v => ({
    id: v.id,
    viewerName: v.viewer_name || null,
    eventType: v.event_type,
    raw: {
      userAgent: v.user_agent || null,
      ip: v.ip_address || null,
      referrer: v.referrer || null
    },
    parsed: parseUserAgent(v.user_agent),
    viewedAt: v.viewed_at
  }))

  return {
    enabled: true,
    isActive: !sharedNote.deleted_at,
    totalViews: parseInt(totalViewsRes.rows[0].count),
    totalImports: parseInt(totalImportsRes.rows[0].count),
    knownViewers: parseInt(knownRes.rows[0].count),
    anonymousViews: parseInt(anonRes.rows[0].count),
    views
  }
})

function parseUserAgent(ua) {
  if (!ua) return null

  let os = 'Unknown OS'
  let osVersion = ''
  let browser = 'Unknown browser'
  let browserVersion = ''
  let deviceType = 'Desktop'

  // OS detection
  const winMatch = ua.match(/Windows NT ([\d.]+)/)
  const macMatch = ua.match(/Mac OS X ([\d_.]+)/)
  const iosMatch = ua.match(/(?:iPhone|iPad|iPod).*?OS ([\d_]+)/)
  const androidMatch = ua.match(/Android ([\d.]+)/)
  const linuxMatch = /Linux/.test(ua) && !ua.includes('Android')
  const chromeoMatch = /CrOS/.test(ua)

  if (iosMatch) {
    os = ua.includes('iPad') ? 'iPadOS' : 'iOS'
    osVersion = iosMatch[1].replace(/_/g, '.')
    deviceType = ua.includes('iPad') ? 'Tablet' : 'Mobile'
  } else if (androidMatch) {
    os = 'Android'
    osVersion = androidMatch[1]
    deviceType = /Mobile/.test(ua) ? 'Mobile' : 'Tablet'
  } else if (winMatch) {
    os = 'Windows'
    const winVersions = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' }
    osVersion = winVersions[winMatch[1]] || winMatch[1]
  } else if (macMatch) {
    os = 'macOS'
    osVersion = macMatch[1].replace(/_/g, '.')
  } else if (chromeoMatch) {
    os = 'Chrome OS'
  } else if (linuxMatch) {
    os = 'Linux'
  }

  // Browser detection (order matters)
  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/)
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/)
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/)
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/)
  const operaMatch = ua.match(/OPR\/([\d.]+)/)
  const samsungMatch = ua.match(/SamsungBrowser\/([\d.]+)/)

  if (samsungMatch) { browser = 'Samsung Internet'; browserVersion = samsungMatch[1] }
  else if (operaMatch) { browser = 'Opera'; browserVersion = operaMatch[1] }
  else if (edgeMatch) { browser = 'Edge'; browserVersion = edgeMatch[1] }
  else if (firefoxMatch) { browser = 'Firefox'; browserVersion = firefoxMatch[1] }
  else if (chromeMatch && !ua.includes('Edg')) { browser = 'Chrome'; browserVersion = chromeMatch[1] }
  else if (safariMatch) { browser = 'Safari'; browserVersion = safariMatch[1] }

  // Bot detection
  if (/bot|crawl|spider|slurp|Googlebot|Bingbot/i.test(ua)) {
    deviceType = 'Bot'
  }

  const summary = `${browser} ${browserVersion.split('.')[0]} on ${os}${osVersion ? ' ' + osVersion.split('.').slice(0, 2).join('.') : ''}`

  return { os, osVersion, browser, browserVersion, deviceType, summary }
}
