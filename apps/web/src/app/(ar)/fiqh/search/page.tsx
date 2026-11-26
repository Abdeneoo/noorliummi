import type { Metadata } from 'next';
import Link from 'next/link';
import { normAr, searchFiqh } from '@/lib/fiqh';
import { arDigits } from '@/lib/quran';
import FiqhSearchBox from '@/components/FiqhSearchBox';
export const metadata: Metadata = { title: 'البحث في الفقه', robots: { index: false, follow: true } };
export const dynamic = 'force-dynamic';
function snip(t: string, q: string) { if (t.length <= 220) return t; const w = normAr(q).split(' ')[0]; const at = Math.max(0, normAr(t).indexOf(w) - 80); return `${at > 0 ? '…' : ''}${t.slice(at, at + 220)}…`; }
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = String((await searchParams).q ?? '').slice(0, 80).trim(); const hits = q ? searchFiqh(q) : [];
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/fiqh">فقه العبادات</Link></p><h1>البحث في الفقه</h1><p>يبحث في نص «الفقه الميسر» كاملًا، دون اعتبار للتشكيل.</p></header>
      <FiqhSearchBox q={q} />
      {q && <p className="note" role="status">{hits.length ? `${arDigits(hits[0].total)} نتيجة${hits[0].total > hits.length ? `، تُعرض أول ${arDigits(hits.length)}` : ''}.` : 'لا نتائج. جرّب كلمة أخرى.'}</p>}
      <ul className="athar-dir">{hits.map((h, i) => <li key={i}><Link href={`/fiqh/${h.kitab}/${h.n}#p${h.i}`}><strong>{h.title}</strong><small>{snip(h.t, q)}</small></Link></li>)}</ul>
    </article>
  );
}
