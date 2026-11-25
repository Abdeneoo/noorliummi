'use client';
import { useEffect, useState } from 'react';
import { daysUntil, hijri } from '@/lib/hijri';
import { arCount } from '@/lib/arnum';
const NAMES: Record<number, string> = { 8: 'يوم التروية', 9: 'يوم عرفة', 10: 'يوم النحر (عيد الأضحى)', 11: 'أول أيام التشريق', 12: 'ثاني أيام التشريق', 13: 'ثالث أيام التشريق' };
const DAY_W: [string, string, string, string] = ['يوم', 'يومان', 'أيام', 'يومًا'];
const g = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export default function HajjDays() {
  const [days, setDays] = useState<{ d: number; date: Date }[]>([]); const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const n = new Date(); setNow(n); const out: { d: number; date: Date }[] = [];
    for (let i = 0; i < 400 && out.length < 6; i++) { const dt = new Date(n.getFullYear(), n.getMonth(), n.getDate() + i, 12); const h = hijri(dt); if (h.m === 12 && h.d >= 8 && h.d <= 13) out.push({ d: h.d, date: dt }); }
    setDays(out);
  }, []);
  if (!now) return null;
  const arafah = days.find((x) => x.d === 9); const left = arafah ? daysUntil(now, arafah.date) : null;
  return (
    <>
      {arafah && <section className="card season" style={{ marginTop: 0 }}><p className="eyebrow">العدّ إلى يوم عرفة</p><h2>{left === 0 ? 'اليوم' : `بعد ${arCount(left!, DAY_W)}`}</h2><p className="note">{g.format(arafah.date)} بحساب تقويم أم القرى؛ والمعتمد ما تعلنه الجهات الرسمية برؤية الهلال.</p></section>}
      <section className="section"><h2>أيام الحج</h2><ul className="occ-list">{days.map((x) => <li key={x.d} className="card"><strong>{x.d.toLocaleString('ar-EG')} ذو الحجة — {NAMES[x.d]}</strong><span>{g.format(x.date)}</span></li>)}</ul></section>
    </>
  );
}
