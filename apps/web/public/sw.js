// Offline support. Pages: network first, then the saved copy, then /offline. Build assets (/_next/static, fonts):
// cache first (their names change with every build). Recitation audio (third party) is never cached; adhan recordings
// only when the user taps «حفظ للاستخدام دون إنترنت». «تنزيل للأوفلاين» (lib/offline.ts) fills the PAGES cache.
const V = 'noor-v5', STATIC = 'noor-static-v1', AUDIO = 'noor-adhan-audio';
const SHELL = ['/', '/offline', '/wird', '/times', '/adhkar', '/adhan', '/quran', '/tasbeeh', '/en', '/en/quran', '/en/adhkar'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL).catch(() => undefined))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![V, STATIC, AUDIO].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/embed/')) return;
  // Adhan recordings the user saved: network first (Safari needs ranged responses), their saved copy when offline.
  if (u.pathname.startsWith('/audio/')) { if (u.pathname.startsWith('/audio/adhan/')) e.respondWith(fetch(r).catch(() => caches.open(AUDIO).then((c) => c.match(r.url)).then((m) => m || Response.error()))); return; }
  if (u.pathname.startsWith('/_next/static/') || u.pathname.startsWith('/brand/') || /\.(woff2?|png|svg|webp)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(r, copy)); } return res; })));
    return;
  }
  const rsc = u.searchParams.has('_rsc');
  e.respondWith(fetch(r).then((res) => { if (res.ok && !rsc) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); } return res; })
    // In-app navigations (RSC) fail offline on purpose: Next then loads the full page, which is served from the cache below.
    .catch(() => (rsc ? Response.error() : caches.match(r, { ignoreSearch: true }).then((m) => m || (r.mode === 'navigate' ? caches.match('/offline') : Response.error())))));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('/'))));
});
