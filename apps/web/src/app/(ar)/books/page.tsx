import type { Metadata } from 'next';
import Link from 'next/link';
import { BOOK_LANGS, bookList } from '@/lib/books';
export const metadata: Metadata = { title: 'كتب مختارة' };
export default function Books() {
  const list = bookList();
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/knowledge">المعرفة</Link></p><h1>كتب مختارة</h1><p>كتب اختارها صاحب المنصة، منقولة بنصها الكامل كما نشرتها دار الإسلام IslamHouse، مع ترجماتها المنشورة.</p></header>
      <ul className="athar-dir">{list.map((b) => <li key={b.slug}><Link href={`/books/${b.slug}`}><strong>{b.title}</strong><small>{b.author} · {b.chapters.toLocaleString('ar-EG')} فصلًا{b.langs.length ? ` · ${b.langs.map((l) => BOOK_LANGS[l].name).join('، ')}` : ''}</small></Link></li>)}</ul>
    </article>
  );
}
