import { requireAuth } from '../../utils/auth.js'
import { query } from '../../utils/db.js'

/**
 * PUT /api/auth/profile — Update user profile (name, email, avatar_url).
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { name, email, avatarUrl } = body || {}

  // If changing email, check uniqueness
  if (email) {
    const emailNorm = email.toLowerCase().trim()
    const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [emailNorm, auth.userId])
    if (existing.rows.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'This email is already in use' })
    }
  }

  const result = await query(`
    UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      avatar_url = COALESCE($3, avatar_url),
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, email, name, avatar_url, created_at
  `, [
    name ?? null,
    email ? email.toLowerCase().trim() : null,
    avatarUrl ?? null,
    auth.userId
  ])

  const user = result.rows[0]
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url, createdAt: user.created_at }
})
