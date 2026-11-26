import type { PrayerSettings } from '@noor/prayer-engine';
import registry from '@/generated/adhan-registry.json';

export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_AR: Record<Prayer, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
export const PRAYER_LIST: Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface AdhanSound { id: string; title: string; by: string; license: string; licenseUrl: string; source: string; kind: 'fajr' | 'regular'; file: string; duration: number; note?: string; groups?: string[]; titleEn?: string; country?: { code: string; ar: string; en: string }; cat?: string }
export const SOUNDS = registry as AdhanSound[];
/** Built-in choices that need no audio file. */
export const BUILTIN = [{ id: 'chime', title: 'نغمة تنبيه هادئة' }, { id: 'silent', title: 'إشعار صامت فقط' }] as const;

export interface AdhanPrefs { enabled: boolean; sound: Record<Prayer, string>; volume: number; v?: number }
/** Default sound for every prayer: the first published adhan recording, or the chime if none is available. */
// The most famous voice is the main one: the adhan of Masjid al-Haram by Sheikh Ali Ahmed Mulla, and the Haram's Fajr adhan for Fajr.
const pick = (...ids: string[]) => ids.find((id) => SOUNDS.some((s) => s.id === id));
const DEFAULT_SOUND = pick('ia-makkah-isha-mulla') ?? SOUNDS.find((s) => s.kind === 'regular')?.id ?? 'chime';
const DEFAULT_FAJR = pick('ia-makkah-fajr-2009', 'iw-3f556c76c7') ?? DEFAULT_SOUND;
export const DEFAULT_PREFS: AdhanPrefs = { enabled: false, volume: 0.9, v: 3, sound: { fajr: DEFAULT_FAJR, dhuhr: DEFAULT_SOUND, asr: DEFAULT_SOUND, maghrib: DEFAULT_SOUND, isha: DEFAULT_SOUND } };
const KEY = 'noor.adhan.v1';
export function loadPrefs(): AdhanPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<AdhanPrefs>;
      let sound = { ...DEFAULT_PREFS.sound, ...(p.sound ?? {}) };
      // v1 saved the chime for every prayer only because it was the default then: move those to the adhan.
      if (!p.v && PRAYER_LIST.every((k) => sound[k] === 'chime')) sound = { ...DEFAULT_PREFS.sound };
      // Recordings withdrawn from the library (amateur takes, duplicate takes) fall back to the main voice.
      for (const k of PRAYER_LIST) {
        const id = sound[k];
        const known = id === 'chime' || id === 'silent' || id === LOCAL_ID || id.startsWith('local:') || id.startsWith('st:') || SOUNDS.some((s) => s.id === id);
        if (!known || (p.v ?? 0) < 3 && ['azan-andrewler', 'aishatu98-calling', 'adam-synagda'].includes(id)) sound[k] = DEFAULT_PREFS.sound[k];
      }
      return { ...DEFAULT_PREFS, ...p, v: 3, sound };
    }
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}
export function savePrefs(p: AdhanPrefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); window.dispatchEvent(new Event('noor:adhan-prefs')); } catch { /* ignore */ } }
export function loadPrayerSettings(): PrayerSettings | null {
  try { const raw = localStorage.getItem('noor.prayer.v1'); return raw ? (JSON.parse(raw).s as PrayerSettings) : null; } catch { return null; }
}
export const soundsFor = (p: Prayer) => SOUNDS.filter((s) => (p === 'fajr' ? true : s.kind === 'regular'));

/**
 * One shared <audio> element for every sound. Browsers (iOS especially) only allow programmatic playback on an
 * element that was started by a tap, so primeAudio() runs on the first tap of each visit and the adhan later
 * plays on that same element. An <audio> element also plays when an iPhone's silent switch is on (Web Audio does not).
 */
let player: HTMLAudioElement | null = null;
let primed = false;
const getPlayer = () => (player ??= new Audio());
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
export function primeAudio(): void {
  if (primed) return;
  const a = getPlayer();
  if (a.src && !a.paused) { primed = true; return; }
  a.src = SILENCE; a.muted = true;
  a.play().then(() => { a.pause(); a.muted = false; primed = true; }).catch(() => { a.muted = false; });
}

let chimeUrl: string | null = null;
/** A gentle three-note chime rendered once into a WAV file in the browser (no download). */
function chime(): string {
  if (chimeUrl) return chimeUrl;
  const rate = 22050, secs = 3, n = rate * secs;
  const buf = new ArrayBuffer(44 + n * 2); const v = new DataView(buf);
  const w = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  const notes = [523.25, 659.25, 783.99];
  for (let i = 0; i < n; i++) {
    const t = i / rate; let x = 0;
    notes.forEach((f, k) => { const s0 = k * 0.55; if (t >= s0) { const d = t - s0; x += Math.sin(2 * Math.PI * f * d) * Math.min(1, d / 0.04) * Math.exp(-d * 2.6) * 0.33; } });
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x)) * 32767, true);
  }
  chimeUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  return chimeUrl;
}

export function stopSound() { if (player) { player.pause(); } }
/** Plays the chosen sound on the shared element. Rejects with 'audio-blocked' when the browser refuses. */
export async function playSound(id: string, volume = 0.9): Promise<void> {
  try { window.dispatchEvent(new Event('noor:adhan')); } catch { /* ignore */ }
  stopSound();
  if (id === 'silent') return;
  const s = SOUNDS.find((x) => x.id === id);
  const local = id === LOCAL_ID ? await localAdhanUrl() : id.startsWith('local:') ? await libUrl(id) : id.startsWith('st:') ? await streamUrl(id) : null;
  const a = getPlayer();
  a.muted = false; a.volume = volume; a.src = local ?? (id === 'chime' || !s ? chime() : s.file); a.currentTime = 0;
  try { await a.play(); primed = true; } catch { throw new Error('audio-blocked'); }
}

/** Shows a notification through the service worker when possible (required on Android), else directly. */
export async function notify(title: string, tag: string, lang: 'ar' | 'en' = 'ar'): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { tag, lang, dir: lang === 'ar' ? 'rtl' : 'ltr', icon: '/icon.svg', badge: '/icon.svg' } as NotificationOptions;
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg) { await reg.showNotification(title, opts); return; } } catch { /* fall back */ }
  try { new Notification(title, opts); } catch { /* not supported */ }
}

// ---- The user's own adhan file: stored in IndexedDB on this device only, never uploaded. ----
const DB = 'noor-audio', STORE = 'files', LOCAL_KEY = 'local-adhan';
export const LOCAL_ID = 'local';
const idb = () => new Promise<IDBDatabase>((ok, no) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
export async function saveLocalAdhan(f: File): Promise<void> {
  if (!f.type.startsWith('audio/') && !/\.(mp3|m4a|aac|wav|ogg|opus|webm)$/i.test(f.name)) throw new Error('not-audio');
  if (f.size > 30 * 1024 * 1024) throw new Error('too-big');
  const db = await idb();
  await new Promise<void>((ok, no) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put({ name: f.name, type: f.type || 'audio/mpeg', blob: f }, LOCAL_KEY); tx.oncomplete = () => ok(); tx.onerror = () => no(tx.error); });
  localUrl = null;
}
export async function localAdhanInfo(): Promise<{ name: string } | null> {
  try { const db = await idb(); return await new Promise((ok) => { const r = db.transaction(STORE).objectStore(STORE).get(LOCAL_KEY); r.onsuccess = () => ok(r.result ? { name: r.result.name } : null); r.onerror = () => ok(null); }); } catch { return null; }
}
export async function removeLocalAdhan(): Promise<void> {
  const db = await idb(); await new Promise<void>((ok) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(LOCAL_KEY); tx.oncomplete = () => ok(); tx.onerror = () => ok(); });
  localUrl = null;
}
let localUrl: string | null = null;
async function localAdhanUrl(): Promise<string | null> {
  if (localUrl) return localUrl;
  try { const db = await idb(); const rec = await new Promise<{ blob: Blob } | undefined>((ok) => { const r = db.transaction(STORE).objectStore(STORE).get(LOCAL_KEY); r.onsuccess = () => ok(r.result); r.onerror = () => ok(undefined); }); if (!rec) return null; localUrl = URL.createObjectURL(rec.blob); return localUrl; } catch { return null; }
}


// ---- The user's own adhan library (many files): IndexedDB on this device only, never uploaded. ----
export interface LocalAdhan { id: string; name: string; title: string; size: number; duration: number | null; sha: string; match?: string }
export interface CatalogueItem { id: string; c: string; f: string; sha: string | null; d: number | null; t: { ar: string | null; en: string }; m: { ar: string | null; en: string } | null; p: { ar: string | null; en: string | null } | null; co: { code: string; ar: string; en: string } | null; g: string[]; s: 'pending' | 'rejected' | 'hosted' | 'stream'; r: string[]; fl: string[]; o: string | null; u?: string }
let catalogue: CatalogueItem[] | null = null;
export async function loadCatalogue(): Promise<CatalogueItem[]> { return (catalogue ??= (await import('@/generated/adhan-catalogue.json')).default as CatalogueItem[]); }
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const durationOf = (blob: Blob) => new Promise<number | null>((ok) => {
  const a = new Audio(); const u = URL.createObjectURL(blob); const done = (v: number | null) => { URL.revokeObjectURL(u); ok(v); };
  a.preload = 'metadata'; a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? Math.round(a.duration) : null); a.onerror = () => done(null); a.src = u;
  setTimeout(() => done(null), 8000);
});
const isAudio = (f: File) => f.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|oga|opus|webm|flac)$/i.test(f.name);
/** Adds files to the device library; recognises recordings of the public collections by their exact bytes (SHA-256). */
export async function addLocalFiles(files: File[], onProgress?: (done: number, total: number) => void): Promise<{ added: number; matched: number; skipped: number; quota: boolean }> {
  const cat = await loadCatalogue().catch(() => [] as CatalogueItem[]);
  const bySha = new Map(cat.filter((c) => c.sha).map((c) => [c.sha as string, c]));
  const db = await idb();
  let added = 0, matched = 0, skipped = 0, quota = false;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!isAudio(f) || f.size > 40 * 1024 * 1024) { skipped++; onProgress?.(i + 1, files.length); continue; }
    const sha = hex(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()));
    const id = 'local:' + sha.slice(0, 16);
    const duration = await durationOf(f);
    const hit = bySha.get(sha); const match = hit?.id;
    const title = hit ? (hit.t.ar ?? hit.t.en) : f.name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
    try {
      await new Promise<void>((ok, no) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put({ name: f.name, title, type: f.type || 'audio/mpeg', blob: f, size: f.size, sha, duration, match }, id); tx.oncomplete = () => ok(); tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error); });
      added++; if (match) matched++;
    } catch (e) { if ((e as DOMException)?.name === 'QuotaExceededError') { quota = true; break; } skipped++; }
    onProgress?.(i + 1, files.length);
  }
  return { added, matched, skipped, quota };
}
export async function listLocal(): Promise<LocalAdhan[]> {
  try {
    const db = await idb();
    return await new Promise((ok) => {
      const out: LocalAdhan[] = []; const r = db.transaction(STORE).objectStore(STORE).openCursor();
      r.onsuccess = () => { const c = r.result; if (!c) return ok(out); const k = String(c.key); const v = c.value; if (k.startsWith('local:')) out.push({ id: k, name: v.name, title: v.title ?? v.name, size: v.size, duration: v.duration ?? null, sha: v.sha, match: v.match }); c.continue(); };
      r.onerror = () => ok(out);
    });
  } catch { return []; }
}
export async function removeLocal(id: string): Promise<void> {
  const db = await idb(); await new Promise<void>((ok) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete = () => ok(); tx.onerror = () => ok(); });
  const u = libUrls.get(id); if (u) { URL.revokeObjectURL(u); libUrls.delete(id); }
}
const libUrls = new Map<string, string>();
async function libUrl(id: string): Promise<string | null> {
  const hit = libUrls.get(id); if (hit) return hit;
  try { const db = await idb(); const rec = await new Promise<{ blob: Blob } | undefined>((ok) => { const r = db.transaction(STORE).objectStore(STORE).get(id); r.onsuccess = () => ok(r.result); r.onerror = () => ok(undefined); }); if (!rec) return null; const u = URL.createObjectURL(rec.blob); libUrls.set(id, u); return u; } catch { return null; }
}

// ---- Favourites (device only) ----
const FAV = 'noor.adhan.fav';
export function loadFavs(): string[] { try { return JSON.parse(localStorage.getItem(FAV) || '[]'); } catch { return []; } }
export function toggleFav(id: string): string[] { const f = loadFavs(); const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]; try { localStorage.setItem(FAV, JSON.stringify(n)); } catch { /* ignore */ } return n; }

// ---- Offline copies of published recordings (Cache Storage; the service worker serves them) ----
export const AUDIO_CACHE = 'noor-adhan-audio';
export async function cacheOffline(file: string): Promise<boolean> { try { const c = await caches.open(AUDIO_CACHE); await c.add(file); return true; } catch { return false; } }
export async function isOffline(file: string): Promise<boolean> { try { const c = await caches.open(AUDIO_CACHE); return !!(await c.match(file)); } catch { return false; } }
export async function dropOffline(file: string): Promise<void> { try { const c = await caches.open(AUDIO_CACHE); await c.delete(file); } catch { /* ignore */ } }
export const fmtDur = (s: number | null | undefined) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);

/** Recordings played from their source (never copied to our server): id = 'st:' + catalogue id. */
export const STREAM_PREFIX = 'st:';
async function streamUrl(id: string): Promise<string | null> {
  const c = await loadCatalogue().catch(() => [] as CatalogueItem[]);
  return c.find((x) => x.id === id.slice(3) && x.s === 'stream')?.u ?? null;
}
