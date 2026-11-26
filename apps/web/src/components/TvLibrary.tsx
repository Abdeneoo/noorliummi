'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import TvEmbed from './TvEmbed';
export type TvRow = { id: number; title: string; by: string; slug?: string; cat: number; plays: number };
const n = (s: string) => s.replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
/** Searchable list of TVQuran recordings; each plays in the persistent official player. */
export default function TvLibrary({ rows, cats, initialCat = 0 }: { rows: TvRow[]; cats: { id: number; title: string }[]; initialCat?: number }) {
  const [q, setQ] = useState(''); const [c, setC] = useState(initialCat); const [sort, setSort] = useState<'plays' | 'name'>('plays'); const [lim, setLim] = useState(60);
  const list = useMemo(() => {
    const w = n(q.trim());
    const r = rows.filter((x) => (!c || x.cat === c) && (!w || n(`${x.title} ${x.by}`).includes(w)));
    return sort === 'plays' ? r : [...r].sort((a, b) => a.by.localeCompare(b.by, 'ar') || a.title.localeCompare(b.title, 'ar'));
  }, [rows, q, c, sort]);
  return (
    <div>
      <div className="row" role="search" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLim(60); }} placeholder="ابحث باسم القارئ أو العنوان" aria-label="بحث في التسجيلات" style={{ flex: '1 1 220px' }} />
        <select value={c} onChange={(e) => { setC(Number(e.target.value)); setLim(60); }} aria-label="التصنيف"><option value={0}>كل التصنيفات</option>{cats.map((k) => <option key={k.id} value={k.id}>{k.title}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'plays' | 'name')} aria-label="الترتيب"><option value="plays">الأكثر استماعًا</option><option value="name">حسب القارئ</option></select>
      </div>
      <p className="note">{list.length.toLocaleString('ar-EG')} تسجيلًا</p>
      <ul className="athar-items">{list.slice(0, lim).map((x) => (
        <li key={x.id}><TvEmbed id={x.id} title={x.title} by={x.by} /> <span>{x.title}</span> — {x.slug ? <Link href={`/reciters/${x.slug}`}>{x.by}</Link> : <span>{x.by || 'غير مسمّى'}</span>} <small className="note">· {cats.find((k) => k.id === x.cat)?.title}</small></li>
      ))}</ul>
      {list.length > lim && <button type="button" className="btn ghost" onClick={() => setLim(lim + 120)}>اعرض المزيد</button>}
    </div>
  );
}
