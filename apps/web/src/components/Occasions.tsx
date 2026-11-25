'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
const RIYAD: [number, string][] = [[218, 'وجوب صوم رمضان وبيان فضل الصيام'], [214, 'استحباب قيام رمضان'], [215, 'فضل قيام ليلة القدر'], [219, 'الجود والإكثار من الخير في رمضان والعشر الأواخر'], [222, 'فضل السحور وتأخيره'], [223, 'فضل تعجيل الفطر وما يقوله بعد الإفطار'], [226, 'فضل صوم المحرم وشعبان والأشهر الحرم'], [227, 'فضل الصوم وغيره في العشر الأول من ذي الحجة'], [228, 'فضل صوم يوم عرفة وعاشوراء وتاسوعاء'], [229, 'استحباب صوم ستة أيام من شوال'], [230, 'استحباب صوم الإثنين والخميس'], [231, 'استحباب صوم ثلاثة أيام من كل شهر'], [211, 'فضل يوم الجمعة'], [234, 'وجوب الحج وفضله']];
import { daysUntil, upcoming, type Occasion } from '@/lib/hijri';
import { arCount } from '@/lib/arnum';
import { downloadIcs } from '@/lib/ics';
const DAY_W: [string, string, string, string] = ['يوم', 'يومان', 'أيام', 'يومًا'];
const gfmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const hfmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' });
function ics(list: Occasion[]) {
  const p = (n: number) => String(n).padStart(2, '0'); const ymd = (d: Date) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ev = list.map((o, i) => { const end = new Date(o.date); end.setDate(end.getDate() + 1); return ['BEGIN:VEVENT', `UID:occ-${ymd(o.date)}-${i}@noorliummi`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(o.date)}`, `DTEND;VALUE=DATE:${ymd(end)}`, `SUMMARY:${o.title} (تقويم أم القرى)`, 'END:VEVENT'].join('\r\n'); });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor Li Ummi//Occasions//AR', ...ev, 'END:VCALENDAR', ''].join('\r\n');
}
/** Upcoming occasions with a countdown, and optional calendar reminders the user picks (no notifications are sent by the site). */
export default function Occasions() {
  const [list, setList] = useState<Occasion[]>([]); const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const n = new Date(); setNow(n); setList(upcoming(n)); }, []);
  if (!now) return <p className="note" role="status">جارٍ الحساب…</p>;
  const ramadan = list.find((o) => o.title === 'أول رمضان');
  const seasons = list.filter((o) => o.kind === 'season' || o.title !== 'الأيام البيض (١٣ و١٤ و١٥)'); const white = list.filter((o) => o.title.startsWith('الأيام البيض'));
  const left = (o: Occasion) => { const n = daysUntil(now, o.date); return n === 0 ? 'اليوم' : n === 1 ? 'غدًا' : `بعد ${arCount(n, DAY_W)}`; };
  return (
    <>
      {ramadan && <section className="card season" style={{ marginTop: 0 }}><p className="eyebrow">العدّ إلى رمضان</p><h2>{left(ramadan)}</h2><p className="note">{gfmt.format(ramadan.date)} بحساب تقويم أم القرى؛ والبداية الفعلية برؤية الهلال في بلدك.</p></section>}
      <section className="section"><h2>المناسبات القادمة</h2>
        <ul className="occ-list">{seasons.map((o, i) => <li key={i} className="card"><strong>{o.title}</strong><span>{gfmt.format(o.date)} · {hfmt.format(o.date)}</span><small>{left(o)}</small></li>)}</ul>
        <div className="row"><button type="button" className="btn ghost" onClick={() => downloadIcs(ics(seasons), 'occasions.ics')}>أضف هذه المناسبات إلى تقويمي</button></div>
      </section>
      <section className="section"><h2>الأيام البيض القادمة</h2>
        <ul className="occ-list">{white.slice(0, 4).map((o, i) => <li key={i} className="card"><strong>١٣–١٥ {new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { month: 'long' }).format(o.date)}</strong><span>تبدأ {gfmt.format(o.date)}</span><small>{left(o)}</small></li>)}</ul>
        <div className="row"><button type="button" className="btn ghost" onClick={() => downloadIcs(ics(white), 'white-days.ics')}>أضف تذكير الأيام البيض إلى تقويمي</button></div>
      </section>
      <p className="note">التواريخ محسوبة فلكيًا بتقويم أم القرى وقد تختلف يومًا حسب رؤية الهلال. التذكير اختياري ويُضاف إلى تقويم هاتفك أنت؛ الموقع لا يرسل إشعارات. فضائل هذه الأيام وأحكامها تُؤخذ من أهل العلم.</p>
      <section className="section"><h2>أحاديث الباب من «رياض الصالحين»</h2>
        <ul className="athar-dir">{RIYAD.map(([i, t]) => <li key={i}><Link href={`/library/riyad/${i}`}><strong>{t}</strong></Link></li>)}</ul>
        <p className="note">نص الكتاب كما هو بطبعته (نسخة تجريبية لم تُراجع بعد). ومن «حصن المسلم»: <Link href="/adhkar/68">دعاء رؤية الهلال</Link> · <Link href="/adhkar/69">الدعاء عند إفطار الصائم</Link> · <Link href="/adhkar/120">الدعاء يوم عرفة</Link></p></section>
    </>
  );
}
