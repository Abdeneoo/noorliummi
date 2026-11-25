import type { Metadata } from 'next';
import Link from 'next/link';
import { cleanQuery } from '@/lib/athar';
import { listPages } from '@/lib/athar-store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Athar pages — ongoing charity', robots: { index: false, follow: false } };

export default async function AtharEn({ searchParams }: { searchParams: Promise<{ q?: string; p?: string }> }) {
  const sp = await searchParams;
  const q = cleanQuery(sp.q ?? '');
  const page = Math.max(0, Math.min(100, Number(sp.p) || 0));
  let list: Awaited<ReturnType<typeof listPages>> = { rows: [], more: false };
  let dbErr = false;
  try { list = await listPages(q, page); } catch { dbErr = true; }
  return (
    <article className="athar-home">
      <header className="page-head">
        <p className="eyebrow">Ongoing charity</p>
        <h1>Athar pages</h1>
        <p>Pages dedicated by their creators to people they love: surahs, adhkar and a dua. Visit, read, and pray for them.</p>
      </header>
      <div className="athar-actions">
        <Link className="btn" href="/athar#new" lang="ar">اصنع صفحة لمن تحب</Link>
        <span className="note" style={{ margin: 0 }}>The creation form is in Arabic for now.</span>
      </div>
      <section className="card" aria-labelledby="dir-title">
        <h2 id="dir-title">Directory</h2>
        <form className="row" role="search" action="/en/athar" style={{ marginTop: 0 }}>
          <input type="search" name="q" defaultValue={q} placeholder="Search by name" aria-label="Search by name" style={{ flex: '1 1 220px' }} />
          <button className="btn ghost">Search</button>
          {q && <Link className="btn ghost" href="/en/athar">All</Link>}
        </form>
        {dbErr ? <p className="note">The directory could not be loaded right now.</p> : list.rows.length === 0 ? (
          <p className="note">{q ? 'No listed page with this name.' : 'No pages in the directory yet. Pages appear here only if their creators choose so.'}</p>
        ) : (
          <ul className="athar-dir">
            {list.rows.map((r) => (
              <li key={r.slug}><Link href={`/en/athar/${r.slug}`}><strong dir="auto">{r.display_name}</strong>{r.dedication && <small dir="auto">{r.dedication}</small>}</Link></li>
            ))}
          </ul>
        )}
        {(page > 0 || list.more) && (
          <div className="pager">
            {page > 0 ? <Link className="btn ghost" href={`/en/athar?${new URLSearchParams({ ...(q ? { q } : {}), p: String(page - 1) })}`}>Previous</Link> : <span />}
            <span className="note">Page {page + 1}</span>
            {list.more ? <Link className="btn ghost" href={`/en/athar?${new URLSearchParams({ ...(q ? { q } : {}), p: String(page + 1) })}`}>Next</Link> : <span />}
          </div>
        )}
      </section>
    </article>
  );
}
