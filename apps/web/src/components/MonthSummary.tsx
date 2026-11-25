'use client';
import { useEffect, useState } from 'react';
import { monthSummary } from '@/lib/daylog';
import { arCount, arDigitsN } from '@/lib/arnum';
const DAY: [string, string, string, string] = ['يوم', 'يومان', 'أيام', 'يومًا'];
/** A quiet monthly note only the user sees (computed from this device). No comparison, no reward figures. */
export default function MonthSummary() {
  const [s, setS] = useState<ReturnType<typeof monthSummary> | null>(null);
  useEffect(() => { setS(monthSummary()); }, []);
  if (!s || !s.activeDays) return null;
  const month = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(new Date());
  return (
    <section className="card month-summary">
      <p className="eyebrow">خلال شهر {month}</p>
      <ul>
        {s.quranDays > 0 && <li>فتحت المصحف في {arCount(s.quranDays, DAY, 'واحد')}</li>}
        {s.adhkarDays > 0 && <li>أتممت بابًا من الأذكار في {arCount(s.adhkarDays, DAY, 'واحد')}</li>}
        {s.tasbeeh > 0 && <li>سبّحت {arDigitsN(s.tasbeeh)} تسبيحة على العدّاد</li>}
      </ul>
      <p className="note">تراه أنت وحدك؛ محسوب من جهازك ولا يُرسل إلى أي مكان.</p>
    </section>
  );
}
