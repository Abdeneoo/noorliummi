import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import HadithSearch from '@/components/HadithSearch';
import { BOOKS, bookOf, sectionLabel } from '@/lib/hadith';

export const dynamicParams = false;
export function generateStaticParams() { return BOOKS.map((b) => ({ book: b.key })); }
export async function generateMetadata({ params }: { params: Promise<{ book: string }> }): Promise<Metadata> { return { title: bookOf((await params).book)?.doc.ar ?? 'الحديث' }; }
const ar = (n: number) => n.toLocaleString('ar-EG');

export default async function Book({ params }: { params: Promise<{ book: string }> }) {
  const b = bookOf((await params).book); if (!b) notFound();
  return (
    <article style={{ maxWidth: 860, margin: '24px auto' }}>
      <h1>{b.doc.ar}</h1>
      {b.doc.author && <p className="meta"><span>{b.doc.author}</span><span>{ar(b.count)} حديثًا</span></p>}
      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>مصدر النص وطبعته</h2>
        <ul>
          <li>النص: fawazahmed0/hadith-api (مجال عام)، ثابت ببصمة SHA-256. المصدر لا يذكر الطبعة التي نُقل عنها.</li>
          <li>الترقيم: {b.doc.numbering}.</li>
          {b.doc.collated ? <li>قوبل هذا الملف نفسه آليًا بطبعة: {b.doc.collated}. النتيجة: {b.doc.agreement}. <a href={b.doc.report!} rel="noopener">تقرير المقابلة</a> (samt-qa، CC BY 4.0).</li> : <li>لم نجد مقابلة منشورة لهذا الكتاب بطبعة مطبوعة.</li>}
          {b.empty > 0 && <li>{ar(b.empty)} سجلًا فارغ النص في المصدر لا تُعرض.</li>}
          <li>لا تُعرض درجات الأحاديث ولا الحواشي.</li>
        </ul>
      </section>
      <HadithSearch book={b.key} />
      <ol className="surah-list">
        {b.sections.map((s) => (
          <li key={s.s}><Link href={`/hadith/${b.key}/${s.s}`}><span>{sectionLabel(s)}</span> <small dir="ltr" lang="en">{s.s ? s.en : ''}</small> <small>· {ar(s.count)}</small></Link></li>
        ))}
      </ol>
      <p className="note">أسماء الكتب في المصدر بالإنجليزية فقط، فنعرضها كما هي حتى نجد عناوينها العربية من مصدر موثوق.</p>
    </article>
  );
}
