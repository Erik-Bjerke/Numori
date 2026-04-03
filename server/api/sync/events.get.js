import { verifyJwt } from '../../utils/auth.js'
import { addListener, removeListener } from '../../utils/syncBroadcast.js'

/**
 * GET /api/sync/events?token=JWT — SSE endpoint.
 * Uses query param for token since EventSource can't set headers.
 */
export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token required' })
  }

  const secret = process.env.JWT_SECRET
  let payload
  try {
    payload = await verifyJwt(token, secret)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const stream = event.node.res
  addListener(payload.userId, stream)

  // Confirm connection
  stream.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

  // Keep-alive ping every 30s
  const keepAlive = setInterval(() => {
    try { stream.write(': ping\n\n') } catch { clearInterval(keepAlive) }
  }, 30000)

  event.node.req.on('close', () => {
    clearInterval(keepAlive)
    removeListener(payload.userId, stream)
  })

  event._handled = true
})
