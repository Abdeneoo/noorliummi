// Offline cache for pages and static assets. Recitation audio (streamed from a third party) is never cached;
// adhan recordings are cached only when the user taps «حفظ للاستخدام دون إنترنت».
const V = 'noor-v4';
const AUDIO = 'noor-adhan-audio';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(['/', '/times', '/adhkar', '/adhan', '/quran', '/en', '/en/quran', '/en/adhkar']).catch(() => undefined))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== AUDIO).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // Adhan recordings the user saved for offline use: network first (Safari needs ranged responses), their saved copy when offline; never auto-cached.
  if (u.pathname.startsWith('/audio/')) { if (u.pathname.startsWith('/audio/adhan/')) e.respondWith(fetch(r).catch(() => caches.open(AUDIO).then((c) => c.match(r.url)).then((m) => m || Response.error()))); return; }
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); } return res; }).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('/'))));
});
