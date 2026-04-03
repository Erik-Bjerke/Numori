/**
 * Wrapper around $fetch that prepends the API base URL.
 * On web (same-origin), apiBase is '' so paths stay relative.
 * On native Capacitor, apiBase is the server URL (e.g. https://calcnotes.example.com).
 */
export const useApi = () => {
  const apiBase = useApiBase()

  const apiFetch = (path, opts = {}) => {
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
