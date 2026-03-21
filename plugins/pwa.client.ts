export default defineNuxtPlugin(() => {
  // Only register the service worker in a real browser, not inside Capacitor's webview
  if ('serviceWorker' in navigator && !(window as any).Capacitor) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  }
})
