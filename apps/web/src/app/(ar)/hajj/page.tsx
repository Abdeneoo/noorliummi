import type { Metadata } from 'next';
import Link from 'next/link';
import HajjDays from '@/components/HajjDays';
export const metadata: Metadata = { title: 'موسم الحج' };
export default function Hajj() {
  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المواسم</p><h1>موسم الحج</h1><p>العدّ إلى يوم عرفة وأيام الحج بتواريخها.</p></header>
      <HajjDays />
      <section className="card"><h2 style={{ marginTop: 0 }}>التصاريح والخدمات الرسمية</h2>
        <p>التصاريح والحجز وكل ما يخص أداء النسك يكون عبر منصة «نسك» الرسمية فقط. هذا الموقع لا يصدر تصاريح ولا يقدّم خدمات حج.</p>
        <div className="row"><a className="btn" href="https://www.nusuk.sa" target="_blank" rel="noopener">منصة نسك الرسمية ↗</a></div></section>
      <section className="card"><h2 style={{ marginTop: 0 }}>من الموقع</h2>
        <div className="row"><Link className="btn ghost" href="/quran/22">سورة الحج</Link><Link className="btn ghost" href="/tasbeeh">التكبير والتسبيح</Link><Link className="btn ghost" href="/times">مواقيت الصلاة</Link><Link className="btn ghost" href="/calendar">التقويم والمواسم</Link></div></section>
      <p className="note">شرح المناسك يومًا بيوم وأدعية عرفة لم تُضف بعد: ستُنشر بنصوصها ومصادرها بعد مراجعة أهل العلم. وأحكام المناسك تُؤخذ من العلماء لا من هذا الموقع.</p>
    </article>
  );
}
