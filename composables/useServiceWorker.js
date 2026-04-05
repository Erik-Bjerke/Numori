/**
 * Composable for update detection and online/offline status.
 *
 * Web: listens for SW update events AND polls /version.json (bypassing SW cache).
 * Native (Capacitor): polls /version.json and compares against the binary version.
 *
 * Polling runs on startup (after a short delay), on visibility change (tab/app
 * comes back to foreground), and every 10 minutes as a safety net.
 */
export const useServiceWorker = () => {
  const updateAvailable = ref(false)
  const isOnline = useOnlineStatus()

  let swRegistration = null

  const { platform } = usePlatform()
  const config = useRuntimeConfig()

  const storeUrl = computed(() => {
    if (platform === 'android') return config.public.storeAndroid || ''
    if (platform === 'ios') return config.public.storeIos || ''
    return ''
  })

  const isNative = platform === 'android' || platform === 'ios'

  // The version baked into this JS bundle at compile time
  const buildVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'

  /** Apply the update — reload for web, open store for native */
  const applyUpdate = () => {
    if (isNative && storeUrl.value) {
      window.open(storeUrl.value, '_blank')
      return
    }
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }

  const dismissUpdate = () => {
    updateAvailable.value = false
  }

  /**
   * Fetch /version.json directly from the server, bypassing the service worker
   * cache entirely. We append a cache-busting query param AND set cache: 'no-store'
   * so neither the SW nor the browser HTTP cache can return a stale copy.
   */
  async function fetchLatestVersion() {
    const origin = config.public.apiBase || window.location.origin
    const url = `${origin}/version.json?_=${Date.now()}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  }

  /** Web: compare the running bundle version against the server's latest */
  async function checkWebUpdate() {
    if (updateAvailable.value) return
    try {
      const data = await fetchLatestVersion()
      if (data?.version && data.version !== buildVersion) {
        updateAvailable.value = true
        // Also nudge the SW to check for an update so it's ready when user clicks Reload
        const reg = await navigator.serviceWorker?.getRegistration()
        reg?.update()
      }
    } catch { /* offline or server down — ignore */ }
  }

  /** Native: compare the installed binary version against the server's latest */
  async function checkNativeUpdate() {
    if (updateAvailable.value) return
    try {
      const { App } = await import('@capacitor/app')
      const info = await App.getInfo()
      const currentVersion = info.version

      const data = await fetchLatestVersion()
      if (data?.version && data.version !== currentVersion) {
        updateAvailable.value = true
      }
    } catch { /* offline or unavailable — ignore */ }
  }

  const check = isNative ? checkNativeUpdate : checkWebUpdate

  if (import.meta.client) {
    // SW update event (web only) — immediate notification
    window.addEventListener('sw-update-available', (e) => {
      swRegistration = e.detail?.registration || null
      updateAvailable.value = true
    })

    // Poll on startup after a short delay
    setTimeout(check, 3000)

    // Poll every 10 minutes
    setInterval(check, 10 * 60 * 1000)

    // Poll when the app comes back to the foreground (tab switch, phone unlock)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
  }

  return { updateAvailable, isOnline, isNative, storeUrl, applyUpdate, dismissUpdate }
}
