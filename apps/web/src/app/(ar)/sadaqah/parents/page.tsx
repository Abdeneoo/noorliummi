import type { Metadata } from 'next';
import Link from 'next/link';
import { hadithRef, BOOK_AR } from '@/lib/hadith-ref';
import { loadSurah, SURAHS, arDigits } from '@/lib/quran';
export const metadata: Metadata = { title: 'كيف أبرّ والديّ بعد وفاتهما؟', description: 'نصوص من القرآن والسنة الصحيحة في البر بالوالدين بعد وفاتهما، مع أدوات المنصة: الدعاء، صفحة الأثر، الختمة، الصدقة.' };
/** Texts only from the site's sources (Tanzil, the hadith collections); each tied to a tool on the site. Nothing composed. */
export default async function Parents() {
  const ayah = (await loadSurah(17)).ayat[23].t;
  const H = await Promise.all([hadithRef('muslim', 25, 4223), hadithRef('bukhari', 23, 1388), hadithRef('bukhari', 28, 1852)]);
  const tools: [string, string, string][][] = [
    [['/duas#q0', 'أدعية للوالدين من القرآن', ''], ['/duas#g0', 'الدعاء للمتوفى', ''], ['/athar', 'صفحة أثر باسمه أو باسمها', '']],
    [['/sadaqah', 'الصدقة الجارية', ''], ['/athar', 'صفحة أثر يشاركها الأهل', ''], ['/khatma', 'ختمة أو ذكر يُهدى باسمه', '']],
    [['/sadaqah', 'الصدقة الجارية', ''], ['/books/manasik', 'أحكام الحج والعمرة', '']],
    [['/fiqh/hajj', 'فقه الحج', ''], ['/books/manasik', 'التحقيق والإيضاح — ابن باز', '']],
  ];
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/sadaqah">الصدقة الجارية</Link></p><h1>كيف أبرّ والديّ بعد وفاتهما؟</h1>
        <p>نصوص من القرآن الكريم والسنة الصحيحة كما في مصادرها، وتحت كل نص أدوات في المنصة تعينك على العمل به.</p></header>
      <section className="card section"><h2 style={{ marginTop: 0 }}>من القرآن الكريم</h2>
        <p className="dhikr-text" style={{ fontFamily: 'var(--font-quran)' }}>{ayah} ﴿{arDigits(24)}﴾</p>
        <p className="dhikr-ref">سورة {SURAHS[16].name}، الآية {arDigits(24)} — <Link href="/quran/17#a24">في المصحف</Link></p>
        <div className="row">{tools[0].map(([h, t]) => <Link key={h + t} className="btn ghost small" href={h}>{t}</Link>)}</div>
      </section>
      {H.map((h, i) => (
        <section key={h.n} className="card section">
          <p className="dhikr-text">{h.t}</p>
          <p className="dhikr-ref">{BOOK_AR[h.book]}، رقم {arDigits(h.n)} — <Link href={h.href}>في كتاب الحديث</Link></p>
          <div className="row">{tools[i + 1].map(([href, t]) => <Link key={href + t} className="btn ghost small" href={href}>{t}</Link>)}</div>
        </section>
      ))}
    </article>
  );
}
