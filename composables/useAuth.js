/**
 * Composable for authentication state and API calls.
 * Stores JWT in localStorage. Completely optional — app works without auth.
 */
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

  const restore = async () => {
    if (!import.meta.client) return
    const stored = localStorage.getItem('auth_token')
    if (!stored) {
      console.debug('[auth] no stored token')
      return
    }

    token.value = stored
    try {
      user.value = await apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${stored}` }
      })
      console.debug('[auth] restored session, isLoggedIn=', isLoggedIn.value)
    } catch (err) {
      console.debug('[auth] restore failed:', err.message || err)
      token.value = null
      localStorage.removeItem('auth_token')
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
      token.value = data.token
      user.value = data.user
      localStorage.setItem('auth_token', data.token)
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
      token.value = data.token
      user.value = data.user
      localStorage.setItem('auth_token', data.token)
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('last_synced_at')
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
      if (type === 'account') logout()
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
