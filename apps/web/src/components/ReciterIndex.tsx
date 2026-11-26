'use client';
import Link from 'next/link';
import { useState } from 'react';
export type RRow = { slug: string; ar: string; en: string; dua: number; clips: number; ih: number; quran: boolean; star: boolean };
const n = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
export default function ReciterIndex({ rows }: { rows: RRow[] }) {
  const [q, setQ] = useState(''); const [f, setF] = useState<'all' | 'dua' | 'quran' | 'direct'>('all');
  const w = n(q.trim());
  const list = rows.filter((r) => (!w || n(`${r.ar} ${r.en}`).includes(w)) && (f === 'all' || (f === 'dua' && r.dua) || (f === 'quran' && r.quran) || (f === 'direct' && r.ih)));
  return (
    <div>
      <div className="row" role="search" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم (عربي أو إنجليزي)" aria-label="بحث عن قارئ" style={{ flex: '1 1 220px' }} />
        <select value={f} onChange={(e) => setF(e.target.value as typeof f)} aria-label="تصفية"><option value="all">الكل</option><option value="dua">لهم أدعية أو أذكار أو رقية</option><option value="quran">لهم مصحف كامل</option><option value="direct">يعمل في الخلفية ويُحفظ دون إنترنت</option></select>
      </div>
      <p className="note">{list.length.toLocaleString('ar-EG')} قارئًا وشيخًا</p>
      <ul className="athar-dir">{list.map((r) => (
        <li key={r.slug}><Link href={`/reciters/${r.slug}`}><strong>{r.star ? '★ ' : ''}{r.ar}</strong><small dir="ltr" lang="en">{r.en}</small>
          <small>{[r.quran && 'المصحف كاملًا', r.dua && `${r.dua.toLocaleString('ar-EG')} دعاء/ذكر/رقية`, r.clips && `${r.clips.toLocaleString('ar-EG')} مقطع تلاوة`, r.ih && `${r.ih.toLocaleString('ar-EG')} مادة صوتية مباشرة`].filter(Boolean).join(' · ')}</small></Link></li>
      ))}</ul>
    </div>
  );
}
