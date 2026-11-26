import type { Metadata } from 'next';
import Link from 'next/link';
import HajjDays from '@/components/HajjDays';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { libBook } from '@/lib/library';
export const metadata: Metadata = { title: 'موسم الحج' };
const HISN = [116, 117, 118, 119, 120, 121, 122, 128];
const RIYAD = [234, 227, 228, 314];
export default async function Hajj() {
  const chapters = await Promise.all(HISN.map(async (id) => ({ id, title: ADHKAR.find((c) => c.id === id)!.title, items: (await loadAdhkar(id)).items })));
  const riyad = libBook('riyad');
  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المواسم</p><h1>موسم الحج</h1><p>العدّ إلى يوم عرفة وأيام الحج بتواريخها.</p></header>
      <HajjDays />
      <section className="card"><h2 style={{ marginTop: 0 }}>شرح المناسك</h2>
        <p>كتاب «التحقيق والإيضاح لكثير من مسائل الحج والعمرة والزيارة» للشيخ عبد العزيز بن باز، كاملًا بفصوله بالترتيب الأصلي، مع ترجمته الأردية والتركية والإندونيسية من الناشر.</p>
        <div className="row"><Link className="btn" href="/books/manasik">افتح الكتاب</Link><Link className="btn ghost" href="/books/dhul-hijjah">فضل عشر ذي الحجة</Link></div></section>
      <section className="card"><h2 style={{ marginTop: 0 }}>التصاريح والخدمات الرسمية</h2>
        <p>التصاريح والحجز وكل ما يخص أداء النسك يكون عبر منصة «نسك» الرسمية فقط. هذا الموقع لا يصدر تصاريح ولا يقدّم خدمات حج.</p>
        <div className="row"><a className="btn" href="https://www.nusuk.sa" target="_blank" rel="noopener">منصة نسك الرسمية ↗</a></div></section>
      <section className="card"><h2 style={{ marginTop: 0 }}>من الموقع</h2>
        <div className="row"><Link className="btn ghost" href="/quran/22">سورة الحج</Link><Link className="btn ghost" href="/tasbeeh">التكبير والتسبيح</Link><Link className="btn ghost" href="/times">مواقيت الصلاة</Link><Link className="btn ghost" href="/calendar">التقويم والمواسم</Link></div></section>
      <section className="section"><h2>أذكار الحج والعمرة — من «حصن المسلم»</h2>
        <p className="note">النصوص كما في الكتاب بتخريجها، بترتيب ورودها فيه.</p>
        {chapters.map((c) => (
          <div key={c.id} className="card" style={{ marginBottom: 12 }} id={`c${c.id}`}><h3 style={{ marginTop: 0 }} lang="ar">{c.title}</h3>
            {c.items.map((d) => <div key={d.n}><p className="dhikr-text" lang="ar">{d.t}</p>{d.r && <p className="dhikr-ref">{d.r}</p>}</div>)}
            <Link className="btn ghost small" href={`/adhkar/${c.id}`}>في الأذكار (مع العدّاد والاستماع إن وُجد)</Link></div>))}
      </section>
      {riyad && <section className="section"><h2>من «رياض الصالحين»</h2>
        <ul className="athar-dir">{RIYAD.map((i) => { const x = riyad.sections.find((q) => q.i === i); return x && <li key={i}><Link href={`/library/riyad/${i}`}><strong>{x.title}</strong></Link></li>; })}</ul></section>}
      <section className="card"><h2 style={{ marginTop: 0 }}>شرح المناسك من مصادره الرسمية</h2>
        <p>لا ننسخ كتب شرح المناسك هنا لأن حقوق نشرها لأصحابها؛ اقرأها من مواقعها الرسمية:</p>
        <ul><li><a href="https://binothaimeen.net" target="_blank" rel="noopener">موقع الشيخ ابن عثيمين ↗</a> (مناسك الحج والعمرة)</li><li><a href="https://binbaz.org.sa" target="_blank" rel="noopener">موقع الشيخ ابن باز ↗</a> (التحقيق والإيضاح لكثير من مسائل الحج والعمرة)</li><li><a href="https://www.haj.gov.sa" target="_blank" rel="noopener">وزارة الحج والعمرة ↗</a></li></ul>
        <p className="note">أحكام المناسك تُؤخذ من العلماء لا من هذا الموقع.</p></section>
    </article>
  );
}
