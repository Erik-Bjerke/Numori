/**
 * Composable for cloud sync. Pushes local notes to server and pulls remote changes.
 * Requires authentication (useAuth).
 */
export const useSync = (auth, notes, saveNotes) => {
  const syncing = ref(false)
  const lastSyncedAt = ref(null)
  const syncError = ref(null)

  // Restore last sync timestamp
  onMounted(() => {
    if (process.client) {
      lastSyncedAt.value = localStorage.getItem('last_synced_at') || null
    }
  })

  const sync = async () => {
    if (!auth.isLoggedIn.value) return
    syncing.value = true
    syncError.value = null

    try {
      // Map local notes to sync format
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
          // Update if remote is newer
          if (new Date(remote.updatedAt) > new Date(existing.updatedAt)) {
            existing.title = remote.title
            existing.description = remote.description
            existing.tags = remote.tags
            existing.content = remote.content
            existing.updatedAt = remote.updatedAt
          }
        } else {
          // New note from server — add locally
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

  return { syncing, lastSyncedAt, syncError, sync }
}
