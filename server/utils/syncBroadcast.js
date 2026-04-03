/**
 * In-memory SSE broadcast for sync notifications.
 * Maps userId -> Set of response streams.
 */
const listeners = new Map()

export function addListener(userId, stream) {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set())
  }
  listeners.get(userId).add(stream)
}

export function removeListener(userId, stream) {
  const set = listeners.get(userId)
  if (set) {
    set.delete(stream)
    if (set.size === 0) listeners.delete(userId)
  }
}

/**
 * Notify all connected clients for a user that a sync occurred.
 * Optionally exclude the client that triggered the sync.
 */
export function notifySync(userId, excludeStream = null) {
  const set = listeners.get(userId)
  if (!set) return

  const data = `data: ${JSON.stringify({ type: 'sync', timestamp: new Date().toISOString() })}\n\n`
  for (const stream of set) {
    if (stream !== excludeStream) {
      try { stream.write(data) } catch { /* client disconnected */ }
    }
  }
}
