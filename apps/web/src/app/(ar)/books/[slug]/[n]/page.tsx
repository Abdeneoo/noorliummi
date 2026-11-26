import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookLangSwitch from '@/components/BookLangSwitch';
import { BOOK_LANGS, bookList, bookMeta, chapter } from '@/lib/books';
export const dynamicParams = false;
export const generateStaticParams = () => bookList().flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ slug: b.slug, n: String(i + 1) })));
export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> { const p = await params; const c = chapter(p.slug, Number(p.n)); const b = bookMeta(p.slug); return { title: c && b ? `${c.title} — ${b.title}` : 'كتاب' }; }
export default async function Chap({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const p = await params; const n = Number(p.n); const b = bookMeta(p.slug); const c = chapter(p.slug, n); if (!b || !c) notFound();
  const last = b.chapters.length;
  return (
    <article className="reader book" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href={`/books/${b.slug}`}>{b.title}</Link></p><h1 style={{ fontSize: '1.5rem' }}>{c.title}</h1>
        <p className="meta"><span>{b.author}</span><span>الفصل {n.toLocaleString('ar-EG')} من {last.toLocaleString('ar-EG')}</span></p></header>
      {b.langs.length > 0 && <BookLangSwitch langs={b.langs} />}
      <div className="book-body">{c.blocks.map((x, i) => {
        const T = x.tag === 'h2' ? 'h2' : x.tag === 'h3' ? 'h3' : 'p';
        return <div key={i} className={`blk blk-${T}`}><T lang="ar" className="ar">{x.ar}</T>{(Object.keys(x.tr) as (keyof typeof BOOK_LANGS)[]).map((l) => <div key={l} className="he-tr bk-tr" data-l={l} lang={l} dir={BOOK_LANGS[l].dir} hidden>{x.tr[l]}</div>)}</div>;
      })}</div>
      <p className="note">المصدر: «{b.title}» — {b.author}، الفصل {n.toLocaleString('ar-EG')}، <a href={b.source} target="_blank" rel="noopener">IslamHouse ↗</a>. النص كما هو دون تعديل. حالة المراجعة في منصتنا: موثّق المصدر، لم يراجعه مراجع المنصة. <Link href={`/report?p=${encodeURIComponent(`/books/${b.slug}/${n}`)}`}>بلّغ عن خطأ في هذه الصفحة</Link></p>
      <nav className="pager">{n > 1 ? <Link className="btn ghost" href={`/books/${b.slug}/${n - 1}`}>الفصل السابق</Link> : <span />}<Link className="btn ghost" href={`/books/${b.slug}`}>الفهرس</Link>{n < last ? <Link className="btn ghost" href={`/books/${b.slug}/${n + 1}`}>الفصل التالي</Link> : <span />}</nav>
    </article>
  );
}
