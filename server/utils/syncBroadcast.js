/**
 * In-memory SSE broadcast for sync notifications.
 * Maps userId -> Map of sessionId -> stream.
 */
const listeners = new Map()

export function addListener(userId, sessionId, stream) {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Map())
  }
  listeners.get(userId).set(sessionId, stream)
  console.log(`[sse] listener added: userId=${userId}, sessionId=${sessionId}, total=${listeners.get(userId).size}`)
}

export function removeListener(userId, sessionId) {
  const sessions = listeners.get(userId)
  if (sessions) {
    sessions.delete(sessionId)
    console.log(`[sse] listener removed: userId=${userId}, sessionId=${sessionId}, remaining=${sessions.size}`)
    if (sessions.size === 0) listeners.delete(userId)
  }
}

/**
 * Notify all connected clients for a user except the one that triggered the sync.
 */
export function notifySync(userId, excludeSessionId = null) {
  const sessions = listeners.get(userId)
  if (!sessions) {
    console.log(`[sse] notifySync: no listeners for userId=${userId}`)
    return
  }

  console.log(`[sse] notifySync: userId=${userId}, exclude=${excludeSessionId}, listeners=${[...sessions.keys()].join(',')}`)

  const data = `data: ${JSON.stringify({ type: 'sync', timestamp: new Date().toISOString() })}\n\n`
  for (const [sessionId, stream] of sessions) {
    if (sessionId !== excludeSessionId) {
      try {
        stream.write(data)
        console.log(`[sse] sent to sessionId=${sessionId}`)
      } catch (err) {
        console.log(`[sse] failed to send to sessionId=${sessionId}: ${err.message}`)
      }
    } else {
      console.log(`[sse] skipped sessionId=${sessionId} (sender)`)
    }
  }
}
