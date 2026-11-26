'use client';
import Link from 'next/link';
import { useState } from 'react';
type Row = { id: number; title: string; who: string; n: number; h: boolean };
const nm = (s: string) => s.replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
export default function AlbumIndex({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState(''); const w = nm(q.trim()); const list = rows.filter((r) => !w || nm(`${r.title} ${r.who}`).includes(w));
  return (<div><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم القارئ أو الرواية أو السنة" aria-label="بحث في المصاحف" style={{ width: '100%' }} />
    <p className="note">{list.length.toLocaleString('ar-EG')} مصحفًا</p>
    <ul className="athar-dir">{list.map((r) => <li key={r.id}><Link href={`/mushafs/${r.id}`}><strong>{r.h ? '🕋 ' : ''}{r.title}</strong><small>{r.who}{r.n < 114 ? ` · ${r.n.toLocaleString('ar-EG')} سورة` : ''}</small></Link></li>)}</ul></div>);
}
