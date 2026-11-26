import type { Metadata } from 'next';
import Link from 'next/link';
import { bab, fiqhIndex } from '@/lib/fiqh';
export const metadata: Metadata = { title: 'مقدمة «الفقه الميسر» والتمهيد' };
export default function Intro() {
  const b = bab(0)!; const x = fiqhIndex();
  return (
    <article className="reader book fiqh" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/fiqh">فقه العبادات</Link></p><h1 style={{ fontSize: '1.5rem' }}>{b.title}</h1><p className="meta"><span>{x.title}</span><span>{x.publisher}</span></p></header>
      <div className="book-body">{b.blocks.map((blk, i) => <p key={i} className="ar">{blk.ar}</p>)}</div>
      <p className="note">المصدر: <a href={x.source} target="_blank" rel="noopener">IslamHouse ↗</a>. النص كما هو.</p>
      <nav className="pager"><span /><Link className="btn ghost" href="/fiqh">الفهرس</Link><Link className="btn ghost" href="/fiqh/taharah/1">كتاب الطهارة</Link></nav>
    </article>
  );
}
