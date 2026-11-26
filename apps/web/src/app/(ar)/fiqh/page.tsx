import type { Metadata } from 'next';
import Link from 'next/link';
import { fiqhIndex, IBADAT } from '@/lib/fiqh';
import { bookMeta } from '@/lib/books';
import { arDigits } from '@/lib/quran';
import FiqhNotice from '@/components/FiqhNotice';
import FiqhSearchBox from '@/components/FiqhSearchBox';
export const metadata: Metadata = { title: 'فقه العبادات', description: 'فقه الطهارة والصلاة والزكاة والصيام والحج بالدليل، من «الفقه الميسر» نصًا كاملًا، مع «كيفية صلاة النبي ﷺ» لابن باز وكتب ابن عثيمين.' };
const EXTERNAL: { title: string; by: string; url: string; why: string }[] = [
  { title: 'الملخص الفقهي', by: 'الشيخ صالح الفوزان', url: 'https://islamhouse.com/ar/books/2089', why: 'صفحة عنوان طبعة دار ابن الجوزي تمنع إعادة النشر، فنكتفي بالرابط.' },
  { title: 'مجالس شهر رمضان', by: 'الشيخ محمد بن صالح العثيمين', url: 'https://binothaimeen.net/', why: 'غير موجود نصًا مرتبًا على IslamHouse؛ يُضاف لاحقًا مع «وضع رمضان» بعد التحقق من نسخته.' },
  { title: 'تلخيص صفة صلاة النبي ﷺ', by: 'الشيخ الألباني', url: 'https://shamela.ws/', why: 'لم نجد إذن نشر؛ ومحتواه العملي مغطى بكتاب ابن باز.' },
];
export default function Fiqh() {
  const x = fiqhIndex(); const how = bookMeta('how-to-pray');
  const ib = x.kitabs.filter((k) => IBADAT.includes(k.slug)); const rest = x.kitabs.filter((k) => !IBADAT.includes(k.slug));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المعرفة</p><h1>فقه العبادات</h1><p>أحكام الطهارة والصلاة والزكاة والصيام والحج، كل حكم بدليله من الكتاب والسنة، من كتاب «{x.title}» بنصه الكامل، ومعه كتب مختارة لابن باز وابن عثيمين.</p></header>
      <FiqhSearchBox />
      {how && <Link className="card home-promo" href="/books/how-to-pray" style={{ marginBottom: 16 }}><strong>كيف تصلي؟ — {how.title}</strong><span>{how.author}: صفة الصلاة خطوة بخطوة من الوضوء إلى التسليم، مع ترجماتها الأردية والتركية والإندونيسية.</span></Link>}
      <FiqhNotice />
      <ul className="tiles" style={{ marginTop: 16 }}>
        {ib.map((k) => <li key={k.slug}><Link href={`/fiqh/${k.slug}`}><strong>{k.title}</strong><small>{arDigits(k.abwab.length)} أبواب، {arDigits(k.abwab.reduce((t, b) => t + b.masail.length, 0))} مسألة</small></Link></li>)}
      </ul>
      <section className="section"><h2>أبواب يكثر السؤال عنها</h2><ul className="chips even"><li><Link href="/fiqh/taharah/5">فقه الوضوء</Link></li><li><Link href="/fiqh/taharah/8">التيمم</Link></li><li><Link href="/fiqh/salah/14">شروط الصلاة وأركانها</Link></li><li><Link href="/fiqh/salah/16">سجود السهو</Link></li><li><Link href="/fiqh/salah/19">صلاة أهل الأعذار</Link></li><li><Link href="/fiqh/salah/25">الجنائز</Link></li><li><Link href="/fiqh/zakat/30">زكاة الفطر</Link></li><li><Link href="/fiqh/siyam/33">المفطرات</Link></li><li><Link href="/fiqh/hajj/40">صفة الحج والعمرة</Link></li><li><Link href="/library/bidaya">أقوال المذاهب (بداية المجتهد)</Link></li></ul></section>
      <section className="section"><h2>بقية أبواب الفقه من الكتاب نفسه</h2>
        <ul className="chips even">{rest.map((k) => <li key={k.slug}><Link href={`/fiqh/${k.slug}`}>{k.title}</Link></li>)}</ul>
        <p className="note"><Link href="/fiqh/muqaddimah">مقدمة الكتاب ومنهجه والتمهيد</Link></p>
      </section>
      <section className="section"><h2>كتب مساندة بنصها الكامل</h2>
        <ul className="athar-dir">{['how-to-pray', 'ahkam-fiqhiyya', 'fusul-siyam', 'ahkam-siyam', 'fasting-fatawa'].map((s) => bookMeta(s)).filter(Boolean).map((b) => <li key={b!.slug}><Link href={`/books/${b!.slug}`}><strong>{b!.title}</strong><small>{b!.author}</small></Link></li>)}</ul>
      </section>
      <section className="section"><h2>للاستزادة (روابط خارجية فقط)</h2>
        <ul className="athar-dir">{EXTERNAL.map((e) => <li key={e.title}><a href={e.url} target="_blank" rel="noopener"><strong>{e.title} ↗</strong><small>{e.by} — {e.why}</small></a></li>)}</ul>
      </section>
    </article>
  );
}
