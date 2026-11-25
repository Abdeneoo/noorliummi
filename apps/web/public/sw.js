// Offline cache for pages and static assets. Recitation audio (streamed from a third party) is never cached.
const V = 'noor-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(['/', '/times', '/adhkar', '/adhan', '/quran']).catch(() => undefined))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/audio/')) return;
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); } return res; }).catch(() => caches.match(r).then((m) => m || caches.match('/'))));
});
