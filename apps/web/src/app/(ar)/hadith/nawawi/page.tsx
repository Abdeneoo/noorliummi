import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import { arDigits } from '@/lib/quran';
import hadith from '@/generated/hadith/nawawi.json';
import HadithTranslation from '@/components/HadithTranslation';
export const metadata: Metadata = { title: 'الأربعون النووية', openGraph: og('/hadith/nawawi', 'ar', 'الأربعون النووية') };

export default function Nawawi() {
  const list = hadith as { n: number; t: string }[];
  return (
    <article className="reader">
      <h1>الأربعون النووية</h1>
      <p className="meta"><span>للإمام يحيى بن شرف النووي رحمه الله</span></p>
      <HadithTranslation book="nawawi" s={0} target="#hadith-list" />
      <ol id="hadith-list" className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>
        {list.map((h) => (
          <li key={h.n} id={`h${h.n}`} className="card tafsir-ayah">
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>الحديث {arDigits(h.n)}</h2>
            <p lang="ar" style={{ lineHeight: 2.1 }}>{h.t}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
