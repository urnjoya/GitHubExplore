self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(
      clients.openWindow("/")
    );
  }
});
// ------------------ Service Worker for PWA ------------------
const APP_VERSION = "1.0.3";
const CACHE_NAME = `oneweb-${APP_VERSION}`;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});
