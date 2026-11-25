'use client';
import { useEffect, useMemo, useState } from 'react';
import { formatTime, getMonthSchedule, qiblaDirection, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
import { CITIES } from '@/lib/cities';
import QiblaCompass from './QiblaCompass';

const COLS: [PrayerName, string][] = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];
const KEY = 'noor.prayer.v1';
interface Saved { label: string; s: PrayerSettings }

export default function MonthTimes() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);

  useEffect(() => {
    let init: Saved | null = null;
    try { const raw = localStorage.getItem(KEY); if (raw) init = JSON.parse(raw) as Saved; } catch { /* ignore */ }
    if (!init) { const c = CITIES.find((x) => x.tz === Intl.DateTimeFormat().resolvedOptions().timeZone) ?? CITIES[0]; init = { label: c.ar, s: { latitude: c.lat, longitude: c.lng, timezone: c.tz, method: c.method } }; }
    setSaved(init);
    const d = new Date(); setYm({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }, []);

  const rows = useMemo(() => { try { return saved && ym ? getMonthSchedule(saved.s, ym.y, ym.m) : []; } catch { return []; } }, [saved, ym]);
  const qibla = saved ? qiblaDirection(saved.s.latitude, saved.s.longitude) : null;

  if (!saved || !ym || qibla == null) return <p aria-busy="true">جارٍ التحميل…</p>;
  const tz = saved.s.timezone;
  const title = new Intl.DateTimeFormat('ar-EG-u-nu-arab', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ym.y, ym.m - 1, 1)));
  const go = (n: number) => setYm((p) => { const t = p!.y * 12 + (p!.m - 1) + n; return { y: Math.floor(t / 12), m: (t % 12) + 1 }; });

  return (
    <div>
      <p className="meta"><span>{saved.label}</span><span>تُغيَّر المدينة وطريقة الحساب من الصفحة الرئيسية</span></p>
      <section className="card" aria-label="اتجاه القبلة">
        <h2 style={{ marginTop: 0 }}>اتجاه القبلة</h2>
        <QiblaCompass qibla={qibla} />
      </section>
      <div className="row" style={{ margin: '16px 0' }}>
        <button type="button" className="btn ghost" onClick={() => go(-1)}>الشهر السابق</button>
        <strong>{title}</strong>
        <button type="button" className="btn ghost" onClick={() => go(1)}>الشهر التالي</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="month">
          <thead><tr><th>اليوم</th>{COLS.map(([, n]) => <th key={n}>{n}</th>)}</tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.date}>
                <th scope="row">{Number(d.date.slice(8))}</th>
                {COLS.map(([k]) => <td key={k}>{formatTime(d.times[k], tz)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">المواقيت محسوبة فلكيًا على جهازك وقد تختلف دقائق عن الجدول الرسمي في بلدك.</p>
    </div>
  );
}
