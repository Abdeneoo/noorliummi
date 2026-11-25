import type { PrayerSettings } from '@noor/prayer-engine';
import registry from '@/generated/adhan-registry.json';

export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_AR: Record<Prayer, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
export const PRAYER_LIST: Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface AdhanSound { id: string; title: string; by: string; license: string; licenseUrl: string; source: string; kind: 'fajr' | 'regular'; file: string; duration: number; note?: string }
export const SOUNDS = registry as AdhanSound[];
/** Built-in choices that need no audio file. */
export const BUILTIN = [{ id: 'chime', title: 'نغمة تنبيه هادئة' }, { id: 'silent', title: 'إشعار صامت فقط' }] as const;

export interface AdhanPrefs { enabled: boolean; sound: Record<Prayer, string>; volume: number }
export const DEFAULT_PREFS: AdhanPrefs = { enabled: false, volume: 0.9, sound: { fajr: 'chime', dhuhr: 'chime', asr: 'chime', maghrib: 'chime', isha: 'chime' } };
const KEY = 'noor.adhan.v1';
export function loadPrefs(): AdhanPrefs {
  try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); return { ...DEFAULT_PREFS, ...p, sound: { ...DEFAULT_PREFS.sound, ...(p.sound ?? {}) } }; } } catch { /* ignore */ }
  return DEFAULT_PREFS;
}
export function savePrefs(p: AdhanPrefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); window.dispatchEvent(new Event('noor:adhan-prefs')); } catch { /* ignore */ } }
export function loadPrayerSettings(): PrayerSettings | null {
  try { const raw = localStorage.getItem('noor.prayer.v1'); return raw ? (JSON.parse(raw).s as PrayerSettings) : null; } catch { return null; }
}
export const soundsFor = (p: Prayer) => SOUNDS.filter((s) => (p === 'fajr' ? true : s.kind === 'regular'));

/** A short, gentle three-note chime synthesised in the browser (no audio file). */
export async function playChime(volume = 0.8): Promise<void> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();
  if (ctx.state !== 'running') { await ctx.close(); throw new Error('audio-blocked'); }
  const t0 = ctx.currentTime + 0.05;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    const t = t0 + i * 0.55;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35 * volume, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 1.7);
  });
  setTimeout(() => void ctx.close(), 3500);
}

let current: HTMLAudioElement | null = null;
export function stopSound() { if (current) { current.pause(); current = null; } }
/** Plays the chosen sound. Rejects with 'audio-blocked' when the browser refuses autoplay. */
export async function playSound(id: string, volume = 0.9): Promise<void> {
  stopSound();
  if (id === 'silent') return;
  if (id === 'chime') return playChime(volume);
  const s = SOUNDS.find((x) => x.id === id);
  if (!s) return playChime(volume);
  const a = new Audio(s.file); a.volume = volume; current = a;
  try { await a.play(); } catch { current = null; throw new Error('audio-blocked'); }
}
