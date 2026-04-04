/**
 * Authentication state and API calls.
 * Stores JWT in Dexie (appState table). Completely optional — app works without auth.
 */
import db from '~/db.js'

export const useAuth = () => {
  const { apiFetch } = useApi()

  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const authHeaders = computed(() => {
    if (!token.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  })

  /** Persist token to IndexedDB */
  const _saveToken = async (t) => {
    token.value = t
    if (t) {
      await db.appState.put({ key: 'auth_token', value: t })
    } else {
      await db.appState.delete('auth_token')
    }
  }

  const restore = async () => {
    if (!import.meta.client) return
    const row = await db.appState.get('auth_token')
    if (!row?.value) return

    token.value = row.value
    try {
      user.value = await apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${row.value}` }
      })
    } catch {
      token.value = null
      await db.appState.delete('auth_token')
    }
  }

  const register = async (email, password, name = '') => {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })
      await _saveToken(data.token)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      await _saveToken(data.token)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    await db.appState.bulkDelete(['auth_token', 'last_synced_at'])
  }

  const updateProfile = async ({ name, email, avatarUrl }) => {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders.value,
        body: { name, email, avatarUrl }
      })
      user.value = { ...user.value, ...data }
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    loading.value = true
    error.value = null
    try {
      await apiFetch('/api/auth/password', {
        method: 'PUT',
        headers: authHeaders.value,
        body: { currentPassword, newPassword }
      })
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Password change failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const requestDeletion = async (type, password) => {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/auth/delete', {
        method: 'POST',
        headers: authHeaders.value,
        body: { type, password }
      })
      if (type === 'account') await logout()
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Deletion request failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshUser = async () => {
    if (!token.value) return
    try {
      user.value = await apiFetch('/api/auth/me', { headers: authHeaders.value })
    } catch { /* ignore */ }
  }

  onMounted(() => restore())

  return {
    user, token, loading, error, isLoggedIn, authHeaders,
    register, login, logout, restore,
    updateProfile, changePassword, requestDeletion, refreshUser
  }
}
