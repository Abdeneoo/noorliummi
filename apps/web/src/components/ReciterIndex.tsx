'use client';
import Link from 'next/link';
import { useState } from 'react';
export type RRow = { slug: string; ar: string; en: string; dua: number; clips: number; ih: number; quran: boolean; star: boolean };
const n = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
export default function ReciterIndex({ rows, lang = 'ar' }: { rows: RRow[]; lang?: 'ar' | 'en' }) {
  const en = lang === 'en';
  const [q, setQ] = useState(''); const [f, setF] = useState<'all' | 'dua' | 'quran' | 'direct'>('all');
  const w = n(q.trim());
  const list = rows.filter((r) => (!w || n(`${r.ar} ${r.en}`).includes(w)) && (f === 'all' || (f === 'dua' && r.dua) || (f === 'quran' && r.quran) || (f === 'direct' && r.ih)));
  return (
    <div>
      <div className="row" role="search" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={en ? 'Search by name (Arabic or English)' : 'ابحث بالاسم (عربي أو إنجليزي)'} aria-label={en ? 'Find a reciter' : 'بحث عن قارئ'} style={{ flex: '1 1 220px' }} />
        <select value={f} onChange={(e) => setF(e.target.value as typeof f)} aria-label={en ? 'Filter' : 'تصفية'}><option value="all">{en ? 'All' : 'الكل'}</option><option value="dua">{en ? 'With duas, adhkar or ruqyah' : 'لهم أدعية أو أذكار أو رقية'}</option><option value="quran">{en ? 'With Quran recitations' : 'لهم تلاوات للقرآن'}</option><option value="direct">{en ? 'Background play and offline' : 'يعمل في الخلفية ويُحفظ دون إنترنت'}</option></select>
      </div>
      <p className="note">{en ? `${list.length} reciters and scholars` : `${list.length.toLocaleString('ar-EG')} قارئًا وشيخًا`}</p>
      <ul className="athar-dir">{list.map((r) => (
        <li key={r.slug}><Link href={`${en ? '/en' : ''}/reciters/${r.slug}`}><strong>{r.star ? '★ ' : ''}{en ? r.en || r.ar : r.ar}</strong><small dir={en ? 'rtl' : 'ltr'} lang={en ? 'ar' : 'en'}>{en ? r.ar : r.en}</small>
          <small>{(en ? [r.quran && 'Quran recitations', r.dua && `${r.dua} duas/adhkar/ruqyah`, r.clips && `${r.clips} recitation clips`, r.ih && `${r.ih} direct audio items`] : [r.quran && 'تلاوات القرآن', r.dua && `${r.dua.toLocaleString('ar-EG')} دعاء/ذكر/رقية`, r.clips && `${r.clips.toLocaleString('ar-EG')} مقطع تلاوة`, r.ih && `${r.ih.toLocaleString('ar-EG')} مادة صوتية مباشرة`]).filter(Boolean).join(' · ')}</small></Link></li>
      ))}</ul>
    </div>
  );
}
