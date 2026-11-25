import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageFilter from '@/components/PageFilter';
import { LIBRARY, libBook, loadLibSection } from '@/lib/library';
import { arDigits } from '@/lib/quran';
export const dynamicParams = false;
export function generateStaticParams() { return LIBRARY.flatMap((b) => b.sections.map((s) => ({ book: b.key, s: String(s.i) }))); }
export async function generateMetadata({ params }: { params: Promise<{ book: string; s: string }> }): Promise<Metadata> { const p = await params; const b = libBook(p.book); return { title: b ? `${b.ar} — ${arDigits(Number(p.s))}` : 'المكتبة' }; }
export default async function BookSection({ params }: { params: Promise<{ book: string; s: string }> }) {
  const p = await params; const b = libBook(p.book); const i = Number(p.s); const meta = b?.sections.find((x) => x.i === i); if (!b || !meta) notFound();
  const sec = await loadLibSection(b.key, i);
  const title = b.key === 'adhkar-nawawi' ? `الصفحات ${meta.title.split('–').map((x) => arDigits(Number(x))).join(' إلى ')}` : meta.title;
  // Group blocks into cards: a hadith number starts a new card.
  const cards: { n?: string; blocks: typeof sec.blocks }[] = [{ blocks: [] }];
  for (const bl of sec.blocks) { if ('n' in bl) cards.push({ n: bl.n, blocks: [] }); else cards[cards.length - 1].blocks.push(bl); }
  return (
    <article className="reader">
      <header><p className="eyebrow"><Link href={`/library/${b.key}`}>{b.ar}</Link>{meta.group ? ` · ${meta.group}` : ''}</p><h1 style={{ fontSize: '1.5rem' }}>{title}</h1></header>
      <p className="review-banner">نص الطبعة كما هو (قد يتضمن أخطاء طباعية من النسخة الرقمية). نسخة تجريبية بانتظار المراجعة. <Link href={`/library/${b.key}`}>بيانات الطبعة</Link></p>
      <PageFilter target="#lib-list" />
      <ol id="lib-list" className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {cards.filter((c) => c.blocks.length).map((c, k) => (
          <li key={k} id={c.n ? `h${c.n}` : `p${k}`} className="card">
            {c.n && <p className="meta"><span>الحديث {arDigits(Number(c.n))}</span></p>}
            {c.blocks.map((bl, j) => 'pg' in bl ? <p key={j} className="lib-pg" aria-label={`نهاية الصفحة ${bl.pg} من الطبعة`}>— ص {arDigits(Number(bl.pg))} —</p>
              : 'h' in bl ? <h2 key={j} style={{ fontSize: '1.05rem', color: 'var(--accent-strong)' }}>{bl.h}</h2>
              : 'v' in bl ? <p key={j} lang="ar" style={{ textAlign: 'center', lineHeight: 2.1 }}>{bl.v}</p>
              : 'p' in bl ? <p key={j} lang="ar" style={{ lineHeight: 2.1 }}>{bl.p}</p> : null)}
          </li>
        ))}
      </ol>
      <nav className="pager">
        {i > 1 ? <Link className="btn ghost" href={`/library/${b.key}/${i - 1}`}>السابق</Link> : <span />}
        <Link className="btn ghost" href={`/library/${b.key}`}>الفهرس</Link>
        {i < b.sections.length ? <Link className="btn ghost" href={`/library/${b.key}/${i + 1}`}>التالي</Link> : <span />}
      </nav>
    </article>
  );
}
