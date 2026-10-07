// No-op Service Worker to eliminate dev server 404 logs
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
