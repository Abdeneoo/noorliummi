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
      <HadithSearch book={b.key} />
      <ol className="surah-list">
        {b.sections.map((s) => (
          <li key={s.s}><Link href={`/hadith/${b.key}/${s.s}`}><span>{sectionLabel(s)}</span> <small dir="ltr" lang="en">{s.s && s.en ? s.en : ''}</small> <small>· {ar(s.count)}</small></Link></li>
        ))}
      </ol>
    </article>
  );
}
