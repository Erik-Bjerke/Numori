import { purgeExpiredSessions } from '../utils/session.js'
import { query } from '../utils/db.js'

/**
 * Nitro plugin: schedule nightly purge of expired sessions.
 *
 * Strategy:
 *   1. Try pg_cron (runs inside PostgreSQL — zero app overhead).
 *   2. Fall back to an in-process setTimeout chain aligned to 23:59.
 */
export default defineNitroPlugin(async () => {
  // Attempt pg_cron
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS pg_cron`)
    await query(`
      SELECT cron.schedule(
        'purge-expired-sessions',
        '59 23 * * *',
        $$DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at < NOW()$$
      )
    `)
    console.log('[purge-sessions] Using pg_cron (database-level scheduler)')
    return
  } catch {
    // pg_cron not available — fall through to in-process scheduler
  }

  // Fallback: in-process setTimeout chain
  const scheduleNext = () => {
    const now = new Date()
    const target = new Date(now)
    target.setHours(23, 59, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)

    setTimeout(async () => {
      try {
        const count = await purgeExpiredSessions()
        console.log(`[purge-sessions] Removed ${count} expired session(s)`)
      } catch (err) {
        console.error('[purge-sessions] Failed:', err.message)
      }
      scheduleNext()
    }, target - now)
  }

  scheduleNext()
  console.log('[purge-sessions] Using in-process scheduler (nightly at 23:59)')
})
