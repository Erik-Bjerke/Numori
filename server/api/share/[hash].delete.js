import { requireAuth } from '../../utils/auth.js'
import { query } from '../../utils/db.js'

/**
 * DELETE /api/share/:hash — Soft-delete a shared note (stop sharing).
 * Analytics data is preserved. Only the owner can do this.
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const hash = getRouterParam(event, 'hash')

  const result = await query(
    'UPDATE shared_notes SET deleted_at = NOW() WHERE hash = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
    [hash, auth.userId]
  )

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shared note not found or not owned by you' })
  }

  return { deleted: true }
})
