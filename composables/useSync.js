/**
 * Composable for cloud sync. Pushes local notes to server and pulls remote changes.
 * Supports manual sync, auto-sync on interval, and debounced sync on note changes.
 */
export const useSync = (auth, notes, saveNotes) => {
  const syncing = ref(false)
  const lastSyncedAt = ref(null)
  const syncError = ref(null)

  let intervalId = null
  let debounceTimer = null
  const AUTO_SYNC_INTERVAL = 2 * 60 * 1000 // 2 minutes
  const DEBOUNCE_DELAY = 5000 // 5 seconds after last change

  // Restore last sync timestamp
  onMounted(() => {
    if (process.client) {
      lastSyncedAt.value = localStorage.getItem('last_synced_at') || null
    }
  })

  const sync = async () => {
    if (!auth.isLoggedIn.value || syncing.value) return
    syncing.value = true
    syncError.value = null

    try {
      const clientNotes = notes.value.map(n => ({
        clientId: n.id,
        title: n.title,
        description: n.description,
        tags: n.tags || [],
        content: n.content,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      }))

      const data = await $fetch('/api/notes/sync', {
        method: 'POST',
        headers: auth.authHeaders.value,
        body: { notes: clientNotes, lastSyncedAt: lastSyncedAt.value }
      })

      // Merge pulled notes into local state
      for (const remote of data.pulled) {
        const existing = notes.value.find(n => n.id === remote.clientId)
        if (existing) {
          if (new Date(remote.updatedAt) > new Date(existing.updatedAt)) {
            existing.title = remote.title
            existing.description = remote.description
            existing.tags = remote.tags
            existing.content = remote.content
            existing.updatedAt = remote.updatedAt
          }
        } else {
          notes.value.push({
            id: remote.clientId || remote.id.toString(),
            title: remote.title,
            description: remote.description,
            tags: remote.tags || [],
            content: remote.content,
            createdAt: remote.createdAt,
            updatedAt: remote.updatedAt
          })
        }
      }

      lastSyncedAt.value = data.syncedAt
      localStorage.setItem('last_synced_at', data.syncedAt)
      saveNotes()
    } catch (err) {
      syncError.value = err.data?.statusMessage || err.message || 'Sync failed'
    } finally {
      syncing.value = false
    }
  }

  /** Debounced sync — called when notes change */
  const debouncedSync = () => {
    if (!auth.isLoggedIn.value) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => sync(), DEBOUNCE_DELAY)
  }

  // Start/stop auto-sync based on auth state
  const startAutoSync = () => {
    stopAutoSync()
    // Initial sync on login
    sync()
    intervalId = setInterval(() => sync(), AUTO_SYNC_INTERVAL)
  }

  const stopAutoSync = () => {
    clearInterval(intervalId)
    clearTimeout(debounceTimer)
    intervalId = null
  }

  // Watch auth state to start/stop auto-sync
  watch(() => auth.isLoggedIn.value, (loggedIn) => {
    if (loggedIn) {
      startAutoSync()
    } else {
      stopAutoSync()
    }
  }, { immediate: true })

  // Watch notes for changes and trigger debounced sync
  watch(notes, () => {
    debouncedSync()
  }, { deep: true })

  onBeforeUnmount(() => {
    stopAutoSync()
  })

  return { syncing, lastSyncedAt, syncError, sync }
}
