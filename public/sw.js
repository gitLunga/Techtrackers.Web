/**
 * public/sw.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Two things need a service worker: installability (PWA) and browser push
 *   (notifications need somewhere to run when no tab is open). Both ride on
 *   this one file rather than two, since a page can only have one active
 *   service worker registration.
 *
 * WHAT IT ACHIEVES
 *   - `push`: shows a system notification for whatever payload the backend's
 *     push.service.js sent (see src/config/push.js for how it's registered).
 *   - `notificationclick`: focuses an already-open tab if there is one,
 *     otherwise opens a new one at the ticket the notification was about.
 *   No offline caching is attempted — this is an internal tool behind auth,
 *   not a content site, so "works offline" isn't a real requirement; adding
 *   it later is an addition to this file, not a rewrite.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Techtrackers', body: event.data.text() };
  }

  const { title = 'Techtrackers', body, url = '/' } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
