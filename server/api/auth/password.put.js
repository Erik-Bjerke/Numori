import bcrypt from 'bcryptjs'
import { requireAuth } from '../../utils/auth.js'
import { query } from '../../utils/db.js'

/**
 * PUT /api/auth/password — Change password. Requires current password.
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { currentPassword, newPassword } = body || {}

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Current and new password are required' })
  }

  if (newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'New password must be at least 8 characters' })
  }

  const result = await query('SELECT password_hash FROM users WHERE id = $1', [auth.userId])
  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, auth.userId])

  return { updated: true }
})
