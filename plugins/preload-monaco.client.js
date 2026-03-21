/**
 * Preload Monaco editor on app startup so it's ready when the user opens a note.
 * Calls useMonaco() directly to trigger the full initialisation (worker setup + import)
 * rather than just warming the module cache.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    useMonaco().catch(() => {
      // Silently ignore – Monaco will load on demand when the editor mounts
    })
  }
})
