import { requireAuth } from '../../utils/auth.js'
import { revokeOtherSessions } from '../../utils/session.js'
import { notifySessionRevoked } from '../../utils/syncBroadcast.js'

/**
 * DELETE /api/auth/sessions
 * Revokes all sessions except the current one.
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  await revokeOtherSessions(auth.userId, auth.tokenHash)
  // Notify all connected SSE clients — revoked ones will validate and log out
  notifySessionRevoked(auth.userId)
  return { ok: true }
})
