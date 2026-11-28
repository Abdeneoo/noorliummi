import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'Adhkar' };
export default function Adhkar() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 20 }}><h1>Adhkar — Hisn al-Muslim</h1><p>By Sa&apos;id ibn Ali ibn Wahf al-Qahtani. Chapter titles are shown in Arabic as in the source.</p></div>
      <ul className="surah-list">
        {ADHKAR.map((c) => <li key={c.id}><Link href={`/en/adhkar/${c.id}`}><span className="num">{c.id}</span> <span lang="ar" dir="rtl">{c.title}</span> <small>{c.count}</small></Link></li>)}
      </ul>
    </>
  );
}
