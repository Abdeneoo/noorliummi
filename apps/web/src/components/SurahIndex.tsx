'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { SurahMeta } from '@/lib/quran';

const strip = (s: string) => s.replace(/[ً-ٰٟ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();

export default function SurahIndex({ surahs }: { surahs: SurahMeta[] }) {
  const [q, setQ] = useState('');
  const k = strip(q.trim());
  const list = k ? surahs.filter((s) => strip(s.name).includes(k) || s.tname.toLowerCase().includes(k) || String(s.index) === k) : surahs;
  return (
    <>
      <label htmlFor="sq" className="skip">ابحث عن سورة</label>
      <input id="sq" className="search" type="search" placeholder="ابحث باسم السورة أو رقمها" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? <p className="note" role="status">لا توجد سورة بهذا الاسم.</p> : (
        <ul className="surah-list">
          {list.map((s) => (
            <li key={s.index}>
              <Link href={`/quran/${s.index}`}>
                <span className="num">{s.index}</span>
                <span><span className="nm">سورة {s.name}</span><span className="sub">{s.type === 'Meccan' ? 'مكية' : 'مدنية'} · {s.ayas} آية</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
