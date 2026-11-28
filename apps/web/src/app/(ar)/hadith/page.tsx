import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { arCount, BOOK } from '@/lib/arnum';
import HadithSearch from '@/components/HadithSearch';
import { sortedBooks } from '@/lib/hadith';
export const metadata: Metadata = { title: 'الحديث الشريف', openGraph: og('/hadith', 'ar', 'الحديث الشريف') };
const ar = (n: number) => n.toLocaleString('ar-EG');
export default function HadithIndex() {
  const books = sortedBooks(); const total = books.reduce((t, b) => t + b.count, 0);
  return (
    <article style={{ maxWidth: 860, margin: '24px auto' }}>
      <h1>الحديث الشريف</h1>
      <p className="meta"><span>{arCount(books.length + 1, BOOK)}</span><span>{ar(total + 42)} حديثًا</span></p>
      <HadithSearch />
      <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
        <li className="card"><h2 style={{ marginTop: 0, fontSize: '1.1rem' }}><Link href="/hadeeth">أحاديث مترجمة مع الشرح</Link></h2></li>
        <li className="card"><h2 style={{ marginTop: 0, fontSize: '1.1rem' }}><Link href="/hadith/nawawi">الأربعون النووية</Link></h2><p className="note">٤٢ حديثًا</p></li>
        {books.map((b) => (
          <li key={b.key} className="card">
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}><Link href={`/hadith/${b.key}`}>{b.doc.ar}</Link></h2>
            <p className="note">{b.doc.author}{b.doc.author ? ' · ' : ''}{ar(b.count)} حديثًا</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
