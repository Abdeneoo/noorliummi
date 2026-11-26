'use client';
import { hshift } from '@/lib/hijri-adj';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PRAYERS, formatCountdown, formatTime, getPrayerStatus, getScheduleForInstant, type PrayerName, type PrayerSettings } from '@noor/prayer-engine';
const AR = (x: string) => x.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
const NAMES: Record<PrayerName, string> = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
/** «وضع العرض»: a full-screen board for a mosque or home screen — clock, today's times and the countdown to the next prayer. Uses the city saved on this device. */
export default function Board() {
  const [s, setS] = useState<{ label: string; s: PrayerSettings } | null | undefined>(undefined); const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    try { const raw = localStorage.getItem('noor.prayer.v1'); setS(raw ? JSON.parse(raw) : null); } catch { setS(null); }
    const t = setInterval(() => setNow(new Date()), 1000);
    let lock: { release?: () => void } | null = null; (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => void }> } }).wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => undefined);
    return () => { clearInterval(t); lock?.release?.(); };
  }, []);
  if (s === undefined) return null;
  if (!s) return <section className="card"><p>اختر مدينتك أولًا من صفحة المواقيت، ثم ارجع إلى وضع العرض.</p><Link className="btn" href="/times">المواقيت</Link></section>;
  const tz = s.s.timezone; const day = getScheduleForInstant(s.s, now); const st = getPrayerStatus(s.s, now);
  const friday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(now) === 'Fri';
  return (
    <div className="board">
      <div className="board-top"><span>{s.label}</span><span>{new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(hshift(now))}</span><Link href="/times" className="board-x">خروج ✕</Link></div>
      <div style={{ alignSelf: 'center' }}>
        <div className="board-clock" dir="ltr"><bdo dir="ltr">{AR(formatTime(now, tz))}<small style={{ fontSize: '.35em', opacity: .7 }}>:{AR(String(now.getSeconds()).padStart(2, '0'))}</small></bdo></div>
        <p className="board-next">{friday && st.next.name === 'dhuhr' ? 'الجمعة' : NAMES[st.next.name]} بعد <bdo dir="ltr">{AR(formatCountdown(st.remainingMs))}</bdo></p>
      </div>
      <ul className="board-times">{PRAYERS.map((p) => <li key={p} className={p === st.next.name ? 'next' : ''}><strong>{friday && p === 'dhuhr' ? 'الجمعة' : NAMES[p]}</strong><span><bdo dir="ltr">{AR(formatTime(day.times[p], tz))}</bdo></span></li>)}</ul>
    </div>
  );
}
