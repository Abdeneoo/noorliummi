'use client';
import Link from 'next/link';
import { useState } from 'react';
import { stripMarks, type AdhkarCat } from '@/lib/adhkar';
import { arCount, DHIKR } from '@/lib/arnum';

export default function AdhkarIndex({ cats }: { cats: AdhkarCat[] }) {
  const [q, setQ] = useState('');
  const k = stripMarks(q.trim());
  const list = k ? cats.filter((c) => stripMarks(c.title).includes(k)) : cats;
  return (
    <>
      <label htmlFor="aq" className="skip">ابحث في الأذكار</label>
      <input id="aq" className="search" type="search" placeholder="ابحث: الصباح، النوم، السفر…" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? <p className="note" role="status">لا يوجد باب بهذا الاسم.</p> : (
        <ul className="surah-list">
          {list.map((c) => (
            <li key={c.id}><Link href={`/adhkar/${c.id}`}><span className="num">{c.id}</span><span><span className="nm">{c.title}</span><span className="sub">{arCount(c.count, DHIKR)}</span></span></Link></li>
          ))}
        </ul>
      )}
    </>
  );
}
