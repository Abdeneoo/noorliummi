'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import TvEmbed from './TvEmbed';
export type TvRow = { id: number; title: string; by: string; by_en?: string; slug?: string; cat: number; plays: number };
const CAT_EN: Record<number, string> = { 4: 'Selected duas', 5: 'Moving recitations', 6: 'Ruqyah', 7: 'Children reciting', 8: 'Daily adhkar', 9: 'Adhan and takbir', 10: 'Wondrous Quran', 13: 'Visitors’ recitations', 22: 'Rare recitations' };
const n = (s: string) => s.replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
/** Searchable list of TVQuran recordings; each plays in the persistent official player. */
export default function TvLibrary({ rows, cats, initialCat = 0, lang = 'ar' }: { rows: TvRow[]; cats: { id: number; title: string }[]; initialCat?: number; lang?: 'ar' | 'en' }) {
  const en = lang === 'en'; const base = en ? '/en/reciters' : '/reciters'; const cn = (c: { id: number; title: string }) => (en ? CAT_EN[c.id] ?? c.title : c.title);
  const [q, setQ] = useState(''); const [c, setC] = useState(initialCat); const [sort, setSort] = useState<'plays' | 'name'>('plays'); const [lim, setLim] = useState(60);
  const list = useMemo(() => {
    const w = n(q.trim());
    const r = rows.filter((x) => (!c || x.cat === c) && (!w || n(`${x.title} ${x.by}`).includes(w)));
    return sort === 'plays' ? r : [...r].sort((a, b) => a.by.localeCompare(b.by, 'ar') || a.title.localeCompare(b.title, 'ar'));
  }, [rows, q, c, sort]);
  return (
    <div>
      <div className="row" role="search" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLim(60); }} placeholder={en ? 'Search by reciter or title' : 'ابحث باسم القارئ أو العنوان'} aria-label={en ? 'Search recordings' : 'بحث في التسجيلات'} style={{ flex: '1 1 220px' }} />
        <select value={c} onChange={(e) => { setC(Number(e.target.value)); setLim(60); }} aria-label={en ? 'Category' : 'التصنيف'}><option value={0}>{en ? 'All categories' : 'كل التصنيفات'}</option>{cats.map((k) => <option key={k.id} value={k.id}>{cn(k)}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'plays' | 'name')} aria-label={en ? 'Sort' : 'الترتيب'}><option value="plays">{en ? 'Most listened' : 'الأكثر استماعًا'}</option><option value="name">{en ? 'By reciter' : 'حسب القارئ'}</option></select>
      </div>
      <p className="note">{en ? `${list.length} recordings` : `${list.length.toLocaleString('ar-EG')} تسجيلًا`}</p>
      <ul className="athar-items">{list.slice(0, lim).map((x) => (
        <li key={x.id}><TvEmbed id={x.id} title={x.title} by={x.by} lang={lang} /> <span lang="ar">{x.title}</span> — {x.slug ? <Link href={`${base}/${x.slug}`}>{en ? x.by_en || x.by : x.by}</Link> : <span>{x.by || (en ? 'Unnamed' : 'غير مسمّى')}</span>} <small className="note">· {(() => { const c = cats.find((k) => k.id === x.cat); return c ? cn(c) : ''; })()}</small></li>
      ))}</ul>
      {list.length > lim && <button type="button" className="btn ghost" onClick={() => setLim(lim + 120)}>{en ? 'Show more' : 'اعرض المزيد'}</button>}
    </div>
  );
}
