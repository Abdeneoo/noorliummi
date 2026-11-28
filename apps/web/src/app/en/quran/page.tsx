import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { SURAHS } from '@/lib/quran';
export const metadata: Metadata = { title: 'The Holy Quran', openGraph: og('/en/quran', 'en', 'The Holy Quran') };
export default function QuranIndex() {
  return (
    <>
      <div className="hero" style={{ paddingBottom: 20 }}><h1>The Holy Quran</h1></div>
      <ul className="surah-list">
        {SURAHS.map((s) => (
          <li key={s.index}><Link href={`/en/quran/${s.index}`}><span className="num">{s.index}</span> <span>{s.tname}</span> <small>{s.ename} · {s.ayas} ayat</small> <span lang="ar" dir="rtl" style={{ marginInlineStart: 'auto' }}>{s.name}</span></Link></li>
        ))}
      </ul>
    </>
  );
}
