import KidBlocked from '@/components/KidBlocked';
import { allows } from '@/lib/family-rules';
import { kidHere } from '@/lib/kid-page';
import { bookMeta, chapter } from '@/lib/books';
/** A section of «ما لا يسع أطفال المسلمين جهله», verbatim — only when the parent allowed it. */
export default async function KidBook({ params }: { params: Promise<{ n: string }> }) {
  const k = await kidHere(); if (k?.timeUp) return null; const n = Number((await params).n);
  if (!k || !Number.isInteger(n) || !allows(k.allowed, 'book', n)) return <KidBlocked />;
  const c = chapter('children', n); const b = bookMeta('children'); if (!c || !b) return <KidBlocked />;
  return (
    <article><h1>{c.title}</h1>
      {c.blocks.map((x, i) => x.tag === 'h2' || x.tag === 'h3' ? <h2 key={i} style={{ fontSize: '1.2rem', marginTop: 22 }}>{x.ar}</h2> : <p key={i} style={{ lineHeight: 2, whiteSpace: 'pre-line' }}>{x.ar}</p>)}
      <p className="note">من كتاب «{b.title}» — {b.author}، IslamHouse.</p>
    </article>
  );
}
