'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
/**
 * A small card on the home page for the current occasion (Friday, Ramadan, the ten days of Dhul-Hijjah, Arafah,
 * Ashura), by the Umm al-Qura calendar on this device. Links only — no virtue claims written here.
 */
type Card = { eyebrow: string; title: string; links: [string, string][] };
export function seasonFor(d: Date): Card | null {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric' }).formatToParts(d);
  const hm = Number(parts.find((p) => p.type === 'month')?.value); const hd = Number(parts.find((p) => p.type === 'day')?.value);
  if (hm === 12 && hd === 9) return { eyebrow: 'اليوم التاسع من ذي الحجة', title: 'يوم عرفة', links: [['/adhkar', 'الأذكار والأدعية'], ['/duas', 'أدعية موثّقة']] };
  if (hm === 12 && hd <= 10) return { eyebrow: 'ذو الحجة', title: 'العشر الأوائل من ذي الحجة', links: [['/adhkar', 'الأذكار'], ['/tasbeeh', 'التسبيح والتكبير']] };
  if (hm === 1 && (hd === 9 || hd === 10)) return { eyebrow: 'المحرّم', title: hd === 10 ? 'يوم عاشوراء' : 'تاسوعاء — اليوم التاسع من المحرّم', links: [['/adhkar', 'الأذكار']] };
  if (hm === 9) return { eyebrow: `رمضان — اليوم ${hd.toLocaleString('ar-EG')}`, title: 'ختمة رمضان', links: [['/wird', 'خطة ختمة رمضان'], ['/khatma', 'ختمة جماعية'], ['/adhkar/75', 'دعاء الصائم']] };
  if (d.getDay() === 5) return { eyebrow: 'يوم الجمعة', title: 'سورة الكهف', links: [['/quran/18', 'اقرأ واستمع'], ['/sakina?s=18', 'وضع السكينة'], ['/tools', 'تذكير الجمعة']] };
  return null;
}
export default function SeasonCard() {
  const [c, setC] = useState<Card | null>(null);
  useEffect(() => { setC(seasonFor(new Date())); }, []);
  if (!c) return null;
  return (
    <section className="card season" aria-label={c.title}>
      <p className="eyebrow">{c.eyebrow}</p><h2>{c.title}</h2>
      <div className="row">{c.links.map(([h, l], i) => <Link key={h} className={i ? 'btn ghost small' : 'btn small'} href={h}>{l}</Link>)}</div>
    </section>
  );
}
