// Offline support (v6: saved Quran audio). Pages: network first, then the saved copy, then /offline. Build assets (/_next/static, fonts):
// cache first (their names change with every build). Recitation audio (third party) is never cached; adhan recordings
// only when the user taps «حفظ للاستخدام دون إنترنت». «تنزيل للأوفلاين» (lib/offline.ts) fills the PAGES cache.
const V = 'noor-v5', STATIC = 'noor-static-v1', AUDIO = 'noor-adhan-audio', QURAN = 'noor-quran-audio';
// Surahs the listener saved on this device («احفظ السورة على جهازي»): served from the device, with byte ranges for seeking.
const AUDIO_HOSTS = /(^|\.)mp3quran\.net$|^cdn\.islamic\.network$/;
async function savedAudio(r) {
  const m = await (await caches.open(QURAN)).match(r.url); if (!m) return fetch(r);
  const range = r.headers.get('range'); if (!range || m.type === 'opaque') return m;
  const buf = await m.arrayBuffer(); const mt = /bytes=(\d*)-(\d*)/.exec(range); if (!mt) return new Response(buf, { headers: m.headers });
  const start = mt[1] ? Number(mt[1]) : Math.max(0, buf.byteLength - Number(mt[2])); const end = mt[1] && mt[2] ? Math.min(Number(mt[2]), buf.byteLength - 1) : buf.byteLength - 1;
  if (start > end) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${buf.byteLength}` } });
  return new Response(buf.slice(start, end + 1), { status: 206, headers: { 'content-type': m.headers.get('content-type') || 'audio/mpeg', 'content-range': `bytes ${start}-${end}/${buf.byteLength}`, 'content-length': String(end - start + 1), 'accept-ranges': 'bytes' } });
}
const SHELL = ['/', '/offline', '/wird', '/times', '/adhkar', '/adhan', '/quran', '/tasbeeh', '/en', '/en/quran', '/en/adhkar'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL).catch(() => undefined))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![V, STATIC, AUDIO, QURAN].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method === 'GET' && u.origin !== location.origin && AUDIO_HOSTS.test(u.hostname)) { e.respondWith(savedAudio(r).catch(() => fetch(r))); return; }
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
