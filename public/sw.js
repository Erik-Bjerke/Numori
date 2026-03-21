// Minimal service worker for PWA installability.
// Capacitor apps don't use service workers, so this only activates in the browser.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
