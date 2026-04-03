/**
 * Composable for authentication state and API calls.
 * Stores JWT in localStorage. Completely optional — app works without auth.
 */
export const useAuth = () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  /** Helper: get auth headers for API calls */
  const authHeaders = computed(() => {
    if (!token.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  })

  // Restore session from localStorage
  const restore = async () => {
    if (!process.client) return
    const stored = localStorage.getItem('auth_token')
    if (!stored) return

    token.value = stored
    try {
      const data = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${stored}` }
      })
      user.value = data
    } catch {
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  const register = async (email, password, name = '') => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/auth/register', {
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
      const data = await $fetch('/api/auth/login', {
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
      const data = await $fetch('/api/auth/profile', {
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
      await $fetch('/api/auth/password', {
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
      const data = await $fetch('/api/auth/delete', {
        method: 'POST',
        headers: authHeaders.value,
        body: { type, password }
      })
      if (type === 'account') {
        logout()
      }
      return data
    } catch (err) {
      error.value = err.data?.statusMessage || err.message || 'Deletion request failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Refresh user data from server (stats, etc.) */
  const refreshUser = async () => {
    if (!token.value) return
    try {
      const data = await $fetch('/api/auth/me', {
        headers: authHeaders.value
      })
      user.value = data
    } catch { /* ignore */ }
  }

  onMounted(() => {
    restore()
  })

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    authHeaders,
    register,
    login,
    logout,
    restore,
    updateProfile,
    changePassword,
    requestDeletion,
    refreshUser
  }
}
