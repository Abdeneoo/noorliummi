'use client';
import { useEffect, useState } from 'react';
import { hijriAdj } from '@/lib/hijri-adj';
import { SKEY, ramadanDay, ramadanStart } from '@/lib/ramadan';
import PlayTrack from './PlayTrack';
import type { Track } from '@/lib/audio-store';
/** Highlights the lesson for today's date in Ramadan (on the visitor's device). */
export default function TodayMajlis({ days }: { days: { n: number; title: string; track: Track }[] }) {
  const [d, setD] = useState(0); const [until, setUntil] = useState(0);
  useEffect(() => { const now = new Date(); let m: string | null = null; try { m = localStorage.getItem(SKEY); } catch { /* ignore */ } const s = ramadanStart(now, hijriAdj(), m); const n = ramadanDay(now, s); setD(n); if (!n) setUntil(Math.ceil((s.getTime() - now.getTime()) / 86400000)); }, []);
  const today = days.find((x) => x.n === d);
  return (
    <div className="card ramadan-hero">
      {today ? <><p className="eyebrow">مجلس اليوم — {d.toLocaleString('ar-EG')} رمضان</p><h2 style={{ margin: '4px 0' }}>{today.title}</h2><PlayTrack tracks={[today.track]} label="▶ استمع إلى مجلس اليوم" className="btn" /></>
        : <><p className="eyebrow">مجلس كل يوم من رمضان</p><p style={{ margin: 0 }}>{until > 0 ? `يبدأ مع أول رمضان (بعد نحو ${until.toLocaleString('ar-EG')} يومًا). ` : ''}يظهر هنا درس اليوم تلقائيًا حسب تاريخ رمضان عندك، ويمكنك الاستماع لأي مجلس من القائمة الآن.</p></>}
    </div>
  );
}
