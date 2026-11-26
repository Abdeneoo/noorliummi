import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BOOK_LANGS, bookList, bookMeta } from '@/lib/books';
export const dynamicParams = false;
export const generateStaticParams = () => bookList().map((b) => ({ slug: b.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return { title: bookMeta((await params).slug)?.title ?? 'كتاب' }; }
export default async function Book({ params }: { params: Promise<{ slug: string }> }) {
  const b = bookMeta((await params).slug); if (!b) notFound();
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/books">كتب مختارة</Link></p><h1>{b.title}</h1><p>{b.author}</p></header>
      <p className="review-banner">النص منقول كما هو من <a href={b.source} target="_blank" rel="noopener">{b.source.includes('binbaz') ? 'الموقع الرسمي للشيخ ابن باز' : 'دار الإسلام — IslamHouse'} ↗</a> دون اختصار أو تعديل، والترجمات ({b.langs.map((l) => BOOK_LANGS[l].name).join('، ') || 'لا يوجد'}) من الناشر نفسه. لم يراجعه مراجع المنصة بعد؛ وما فيه من مسائل خلافية يُعرض على رأي مؤلفه.</p>
      <ol className="surah-list book-toc">{b.chapters.map((c) => <li key={c.n}><Link href={`/books/${b.slug}/${c.n}`}><span><span className="nm">{c.title}</span></span></Link></li>)}</ol>
    </article>
  );
}
