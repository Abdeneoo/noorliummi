import type { Metadata } from 'next';
import Link from 'next/link';
import HadithSearch from '@/components/HadithSearch';
import { sortedBooks } from '@/lib/hadith';
export const metadata: Metadata = { title: 'الحديث الشريف' };
const ar = (n: number) => n.toLocaleString('ar-EG');
export default function HadithIndex() {
  const books = sortedBooks(); const total = books.reduce((t, b) => t + b.count, 0);
  return (
    <article style={{ maxWidth: 860, margin: '24px auto' }}>
      <h1>الحديث الشريف</h1>
      <p className="review-banner">نسخة تجريبية بانتظار مراجعة أهل العلم. النص منقول حرفيًا من مصدر مفتوح، ولا نعرض درجات الأحاديث ولا حواشي المحققين حتى تتوفر من مصدر يأذن بها.</p>
      <p className="meta"><span>{ar(books.length + 1)} كتب</span><span>{ar(total + 42)} حديثًا</span></p>
      <HadithSearch />
      <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
        <li className="card"><h2 style={{ marginTop: 0, fontSize: '1.1rem' }}><Link href="/hadith/nawawi">الأربعون النووية</Link></h2><p className="note">٤٢ حديثًا</p></li>
        {books.map((b) => (
          <li key={b.key} className="card">
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}><Link href={`/hadith/${b.key}`}>{b.doc.ar}</Link></h2>
            <p className="note">{b.doc.author}{b.doc.author ? ' · ' : ''}{ar(b.count)} حديثًا</p>
          </li>
        ))}
      </ul>
      <p className="note">النصوص من <a href="https://github.com/fawazahmed0/hadith-api" rel="noopener">fawazahmed0/hadith-api</a> (مجال عام). هذا المصدر لا يذكر الطبعة التي نُقل عنها، فنذكر في صفحة كل كتاب الطبعةَ التي قوبل بها النص نفسه آليًا ونسبة التطابق، من تقارير <a href="https://github.com/samt-qa/open-hadith-data" rel="noopener">open-hadith-data</a> (samt-qa، CC BY 4.0).</p>
    </article>
  );
}
