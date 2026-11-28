import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
export const metadata: Metadata = { title: 'وضع الاستماع', openGraph: og('/listen', 'ar', 'وضع الاستماع') };
/** «وضع الطريق»: very large buttons for listening while walking or driving (each opens the continuous player). */
const ITEMS: [string, string, string][] = [
  ['/sakina?adhkar=morning', 'أذكار الصباح', 'تشغيل متواصل لما له تسجيل'],
  ['/sakina?adhkar=evening', 'أذكار المساء', 'تشغيل متواصل لما له تسجيل'],
  ['/sakina?s=18', 'سورة الكهف', 'آية بآية'],
  ['/sakina?s=36', 'سورة يس', 'آية بآية'],
  ['/sakina?s=67', 'سورة الملك', 'آية بآية'],
  ['/sakina?adhkar=sleep', 'أذكار النوم', 'مع مؤقت نوم'],
];
export default function Listen() {
  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">الأدوات</p><h1>وضع الاستماع</h1><p>أزرار كبيرة للاستماع أثناء المشي أو في الطريق، دون الحاجة إلى قراءة الشاشة. لا تنشغل بالهاتف أثناء القيادة.</p></header>
      <ul className="listen-grid">{ITEMS.map(([h, t, d]) => <li key={h}><Link href={h}><strong>{t}</strong><small>{d}</small></Link></li>)}</ul>
    </article>
  );
}
