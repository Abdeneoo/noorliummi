'use client';
/** Save recordings on this device for offline listening (Cache API; the service worker serves them). Only sources that allow it. */
export const OFFLINE_CACHE = 'noor-quran-audio';
const ALLOWED = /^\/audio\/adhkar\/|^https:\/\/(d1\.islamhouse\.com|cdn\.islamic\.network)\//;
export const canSave = (src: string) => ALLOWED.test(src);
export async function savedCount(srcs: string[]) { if (!('caches' in window)) return 0; const c = await caches.open(OFFLINE_CACHE); let n = 0; for (const s of srcs) if (await c.match(new URL(s, location.href).href)) n++; return n; }
export async function saveAll(srcs: string[], onStep?: (done: number) => void) {
  const c = await caches.open(OFFLINE_CACHE); let done = 0;
  for (const s of srcs.filter(canSave)) {
    const url = new URL(s, location.href).href;
    if (!(await c.match(url))) { let res = await fetch(url, { mode: 'cors' }).catch(() => null); if (!res || !res.ok) res = await fetch(url, { mode: 'no-cors' }); if (res.ok || res.type === 'opaque') await c.put(url, res); }
    onStep?.(++done);
  }
  await navigator.storage?.persist?.();
}
export async function removeAll(srcs: string[]) { const c = await caches.open(OFFLINE_CACHE); for (const s of srcs) await c.delete(new URL(s, location.href).href); }
export async function usage() { const e = await navigator.storage?.estimate?.(); return e ? { used: e.usage ?? 0, quota: e.quota ?? 0 } : null; }
