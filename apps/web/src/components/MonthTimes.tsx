'use client';
import { useEffect, useMemo, useState } from 'react';
import { formatTime, getMonthSchedule, qiblaDirection, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES, placeLabel } from '@/lib/cities';
import QiblaCompass from './QiblaCompass';

const COLS: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const L = {
  ar: { names: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' } as Record<PrayerName, string>, loading: 'جارٍ التحميل…', change: 'تُغيَّر المدينة وطريقة الحساب من الصفحة الرئيسية', qibla: 'اتجاه القبلة', prev: 'الشهر السابق', next: 'الشهر التالي', day: 'اليوم', note: 'المواقيت محسوبة فلكيًا على جهازك وقد تختلف دقائق عن الجدول الرسمي في بلدك.', fmt: 'ar-EG-u-nu-arab' },
  en: { names: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } as Record<PrayerName, string>, loading: 'Loading…', change: 'Change the city and method on the home page', qibla: 'Qibla direction', prev: 'Previous month', next: 'Next month', day: 'Day', note: 'Times are calculated astronomically on your device and may differ by a few minutes from your local official timetable.', fmt: 'en-GB' },
};
const KEY = 'noor.prayer.v1';
interface Saved { label: string; s: PrayerSettings; cid?: string; near?: boolean; src?: string }

export default function MonthTimes({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const t = L[lang];
  const [saved, setSaved] = useState<Saved | null>(null);
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);

  useEffect(() => {
    let init: Saved | null = null;
    try { const raw = localStorage.getItem(KEY); if (raw) init = JSON.parse(raw) as Saved; } catch { /* ignore */ }
    if (!init) { const c = CITIES.find((x) => x.tz === Intl.DateTimeFormat().resolvedOptions().timeZone) ?? CITIES[0]; init = { label: c.ar, cid: c.id, s: { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method } }; }
    setSaved(init);
    const d = new Date(); setYm({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }, []);

  const rows = useMemo(() => { try { return saved && ym ? getMonthSchedule(saved.s, ym.y, ym.m) : []; } catch { return []; } }, [saved, ym]);
  const qibla = saved ? qiblaDirection(saved.s.latitude, saved.s.longitude) : null;

  if (!saved || !ym || qibla == null) return <p aria-busy="true">{t.loading}</p>;
  const tz = saved.s.timezone;
  const title = new Intl.DateTimeFormat(t.fmt, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ym.y, ym.m - 1, 1)));
  const go = (n: number) => setYm((p) => { const k = p!.y * 12 + (p!.m - 1) + n; return { y: Math.floor(k / 12), m: (k % 12) + 1 }; });

  return (
    <div>
      <p className="meta"><span>{placeLabel(saved, lang)}</span><span>{t.change}</span></p>
      <section className="card" aria-label={t.qibla}>
        <h2 style={{ marginTop: 0 }}>{t.qibla}</h2>
        <QiblaCompass qibla={qibla} lang={lang} />
      </section>
      <div className="row" style={{ margin: '16px 0' }}>
        <button type="button" className="btn ghost" onClick={() => go(-1)}>{t.prev}</button>
        <strong>{title}</strong>
        <button type="button" className="btn ghost" onClick={() => go(1)}>{t.next}</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="month">
          <thead><tr><th>{t.day}</th>{COLS.map((k) => <th key={k}>{t.names[k]}</th>)}</tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.date}>
                <th scope="row">{Number(d.date.slice(8))}</th>
                {COLS.map((k) => <td key={k}>{formatTime(d.times[k], tz)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">{t.note}</p>
    </div>
  );
}
