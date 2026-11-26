// Bundled into lib/engine.js by build.mjs: the site's own prayer engine (Adhan JS, MIT) and city list, so the extension
// computes the same times as noorliummi.io, offline, with correct time zones and daylight saving.
import { getDaySchedule, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES } from '../../web/src/lib/cities';
export { CITIES };
export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export const NAMES: Record<string, { ar: string; en: string }> = { fajr: { ar: 'الفجر', en: 'Fajr' }, sunrise: { ar: 'الشروق', en: 'Sunrise' }, dhuhr: { ar: 'الظهر', en: 'Dhuhr' }, asr: { ar: 'العصر', en: 'Asr' }, maghrib: { ar: 'المغرب', en: 'Maghrib' }, isha: { ar: 'العشاء', en: 'Isha' } };
const ymd = (d: Date, tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
/** Prayer instants (epoch ms) for the city's local date containing `at` (default now). */
export function timesFor(cityId: string, at = new Date(), offsetDays = 0): Record<string, number> {
  const c = CITIES.find((x) => x.id === cityId) ?? CITIES[0];
  const day = ymd(new Date(at.getTime() + offsetDays * 86400000), c.tz);
  const s: PrayerSettings = { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method };
  const t = getDaySchedule(s, day).times as unknown as Record<string, Date>;
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.getTime()]));
}
export const clock = (ms: number, tz: string) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date(ms));
/** Umm al-Qura Hijri date (as the site uses); local moon-sighting may differ by a day. */
export function hijri(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d);
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return { day: g('day'), month: g('month'), year: g('year'), label: new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d) };
}
/**
 * Voluntary fasts the extension reminds of: Mondays, Thursdays, and the 13th–15th of each Hijri month — never on days when
 * fasting is not done (the two Eids, the days of Tashreeq 11–13 Dhul-Hijjah) and not in Ramadan (already obligatory).
 */
export function fastReason(d: Date): 'mon' | 'thu' | 'white' | null {
  const h = hijri(d);
  if (h.month === 9 || (h.month === 10 && h.day === 1) || (h.month === 12 && h.day >= 10 && h.day <= 13)) return null;
  if (h.day >= 13 && h.day <= 15) return 'white';
  const w = d.getDay(); return w === 1 ? 'mon' : w === 4 ? 'thu' : null;
}
