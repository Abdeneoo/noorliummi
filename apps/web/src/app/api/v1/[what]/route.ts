import { NextResponse } from 'next/server';
import { getDaySchedule, type PrayerSettings } from '@noor/prayer-engine';
import nawawi from '@/generated/hadith/nawawi.json';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { CITIES } from '@/lib/cities';
import { ayahOfDay } from '@/lib/daily';
import { rateLimited } from '@/lib/db';
/**
 * Public read-only API (no key): ayah of the day, hadith of the day (an-Nawawi's forty-two, in order), a Hisn al-Muslim
 * chapter, and prayer times for a listed city. Same data and sources as the site; see /developers.
 */
export const dynamic = 'force-dynamic';
const site = () => (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'access-control-allow-origin': '*', 'cache-control': status === 200 ? 'public, max-age=600' : 'no-store' } });
const today = (tz = 'Asia/Riyadh') => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
export async function GET(req: Request, { params }: { params: Promise<{ what: string }> }) {
  if (rateLimited(req, 'v1', 120, 3600_000)) return json({ error: 'rate limit: 120 requests per hour' }, 429);
  const { what } = await params; const q = new URL(req.url).searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') ?? '') ? q.get('date')! : today();
  switch (what) {
    case 'ayah-of-day': { const a = await ayahOfDay(date); return json({ date, surah: a.s, surah_name: a.name, ayah: a.a, text: a.t, url: `${site()}/quran/${a.s}#a${a.a}`, source: 'Tanzil Project (Uthmani text), CC BY 3.0' }); }
    case 'hadith-of-day': { const d = new Date(`${date}T00:00:00Z`); const i = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) % 42; const h = (nawawi as { n: number; t: string }[])[i]; return json({ date, book: 'الأربعون النووية', number: h.n, text: h.t, url: `${site()}/hadith/nawawi#h${h.n}`, note: 'Trial data, not yet reviewed by scholars.' }); }
    case 'adhkar': { const id = Number(q.get('chapter') ?? 27); const c = ADHKAR.find((x) => x.id === id); if (!c) return json({ error: 'unknown chapter; morning=27, evening=28, sleep=29', chapters: ADHKAR.length }, 404);
      return json({ chapter: id, title: c.title, items: (await loadAdhkar(id)).items.map((d) => ({ n: d.n, text: d.t, repeat: d.c, reference: d.r })), url: `${site()}/adhkar/${id}`, source: 'Hisn al-Muslim (Sa‘id al-Qahtani)', note: 'Trial data, not yet reviewed by scholars.' }); }
    case 'times': { const c = CITIES.find((x) => x.id === q.get('city')); if (!c) return json({ error: 'unknown city', cities: CITIES.map((x) => x.id) }, 404);
      const s: PrayerSettings = { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method as PrayerSettings['method'] }; const d = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') ?? '') ? q.get('date')! : today(c.tz); const day = getDaySchedule(s, d);
      const t = (x: Date) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: c.tz }).format(x);
      return json({ city: c.id, name: c.ar, date: d, timezone: c.tz, method: c.method, times: Object.fromEntries(Object.entries(day.times).map(([k, v]) => [k, t(v)])), note: 'Calculated; local official tables may differ by a minute or two.' }); }
    default: return json({ error: 'unknown endpoint', endpoints: ['ayah-of-day', 'hadith-of-day', 'adhkar?chapter=27', 'times?city=makkah'] }, 404);
  }
}
