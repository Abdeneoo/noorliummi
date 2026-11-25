import type { PrayerSettings } from '@noor/prayer-engine';
import registry from '@/generated/adhan-registry.json';

export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_AR: Record<Prayer, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
export const PRAYER_LIST: Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface AdhanSound { id: string; title: string; by: string; license: string; licenseUrl: string; source: string; kind: 'fajr' | 'regular'; file: string; duration: number; note?: string }
export const SOUNDS = registry as AdhanSound[];
/** Built-in choices that need no audio file. */
export const BUILTIN = [{ id: 'chime', title: 'نغمة تنبيه هادئة' }, { id: 'silent', title: 'إشعار صامت فقط' }] as const;

export interface AdhanPrefs { enabled: boolean; sound: Record<Prayer, string>; volume: number; v?: number }
/** Default sound for every prayer: the first published adhan recording, or the chime if none is available. */
const DEFAULT_SOUND = SOUNDS.find((s) => s.kind === 'regular')?.id ?? 'chime';
export const DEFAULT_PREFS: AdhanPrefs = { enabled: false, volume: 0.9, v: 2, sound: { fajr: DEFAULT_SOUND, dhuhr: DEFAULT_SOUND, asr: DEFAULT_SOUND, maghrib: DEFAULT_SOUND, isha: DEFAULT_SOUND } };
const KEY = 'noor.adhan.v1';
export function loadPrefs(): AdhanPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<AdhanPrefs>;
      let sound = { ...DEFAULT_PREFS.sound, ...(p.sound ?? {}) };
      // v1 saved the chime for every prayer only because it was the default then: move those to the adhan.
      if (!p.v && PRAYER_LIST.every((k) => sound[k] === 'chime')) sound = { ...DEFAULT_PREFS.sound };
      return { ...DEFAULT_PREFS, ...p, v: 2, sound };
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
  stopSound();
  if (id === 'silent') return;
  const s = SOUNDS.find((x) => x.id === id);
  const a = getPlayer();
  a.muted = false; a.volume = volume; a.src = id === 'chime' || !s ? chime() : s.file; a.currentTime = 0;
  try { await a.play(); primed = true; } catch { throw new Error('audio-blocked'); }
}

/** Shows a notification through the service worker when possible (required on Android), else directly. */
export async function notify(title: string, tag: string, lang: 'ar' | 'en' = 'ar'): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { tag, lang, dir: lang === 'ar' ? 'rtl' : 'ltr', icon: '/icon.svg', badge: '/icon.svg' } as NotificationOptions;
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg) { await reg.showNotification(title, opts); return; } } catch { /* fall back */ }
  try { new Notification(title, opts); } catch { /* not supported */ }
}
