import { purgeExpiredSessions } from '../utils/session.js'

/**
 * Nitro scheduled task — deletes all expired sessions from the database.
 * Runs nightly at 23:59 via nitro.scheduledTasks.
 */
export default defineTask({
  meta: { name: 'purge-sessions', description: 'Delete expired sessions' },
  async run() {
    const count = await purgeExpiredSessions()
    console.log(`[purge-sessions] Removed ${count} expired session(s)`)
    return { result: { purged: count } }
  }
})
