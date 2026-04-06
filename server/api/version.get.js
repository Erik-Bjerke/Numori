/**
 * GET /api/version — returns the current deployed app version.
 * Used by native Capacitor apps to detect when a new version is available.
 * Goes through the /api/ route so CORS headers are applied automatically.
 */
export default defineEventHandler(() => {
  return { version: process.env.npm_package_version || '0.0.0' }
})
