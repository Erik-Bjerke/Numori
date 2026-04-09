import { Capacitor } from '@capacitor/core'

/**
 * Wrapper around $fetch that prepends the API base URL.
 * On web (same-origin), apiBase is '' so paths stay relative.
 * On native Capacitor, apiBase is the server URL (e.g. https://app.numori.app).
 *
 * On native platforms, injects an X-Device-Info header so the server can
 * identify the device as "Android" / "iOS" + model instead of "Chrome" / "Safari".
 */
export const useApi = () => {
  const apiBase = useApiBase()

  // Build a static device info string once (platform never changes at runtime).
  let deviceInfoHeader = null
  if (import.meta.client && Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform() // 'android' | 'ios'

    // Try to extract device model from the UA string.
    // Android UA example: "... Linux; Android 14; Pixel 8 Pro Build/..."
    // iOS UA example:     "... iPhone OS 17_4 like Mac OS X..."
    let model = ''
    try {
      const ua = navigator.userAgent || ''
      if (platform === 'android') {
        // Match the model token between "Android <ver>; " and " Build/"
        const m = ua.match(/Android\s[\d.]+;\s*(.+?)\s*(?:Build\/|[;)])/)
        if (m) model = m[1].trim()
      } else if (platform === 'ios') {
        // iOS WebViews always report "iPhone" or "iPad" — grab it
        const m = ua.match(/(iPhone|iPad)/)
        if (m) model = m[1]
      }
    } catch { /* ignore */ }

    deviceInfoHeader = model ? `${platform}; ${model}` : platform
  }

  const apiFetch = (path, opts = {}) => {
    // Inject X-Device-Info for native apps
    if (deviceInfoHeader) {
      opts = {
        ...opts,
        headers: { 'X-Device-Info': deviceInfoHeader, ...opts.headers }
      }
    }
    return $fetch(`${apiBase}${path}`, opts)
  }

  /** Build a full URL (for EventSource, share links, etc.) */
  const apiUrl = (path) => {
    if (apiBase) return `${apiBase}${path}`
    // On web, use current origin
    return `${window.location.origin}${path}`
  }

  return { apiFetch, apiUrl }
}
