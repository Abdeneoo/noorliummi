import type { Metadata } from 'next';
import Link from 'next/link';
import { QD } from '@/lib/duas';
import DuaList from '@/components/DuaList';
import DuaNav from '@/components/DuaNav';
export const revalidate = 300;
export const metadata: Metadata = { title: 'أدعية القرآن الكريم', description: 'أدعية من القرآن الكريم مع الآية كاملة وتلاوتها بصوت قراء مختلفين.' };
export default function Page() {
  const list = QD.duas.filter((d) => d.kind === 'quran');
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>أدعية القرآن الكريم</h1><p>{list.length.toLocaleString('ar-EG')} دعاءً من القرآن الكريم كما جمعها المؤلف، مع الآية كاملة، وتلاوتها كاملة دون قطع بصوت القارئ الذي تختاره.</p></header>
      <DuaNav />
      <p className="review-banner">النصوص من كتاب «الدعاء من الكتاب والسنة» للدكتور سعيد بن علي بن وهف القحطاني كما نشرته موسوعة المحتوى الإسلامي (IslamHouse)، مع تخريج المؤلف وحكمه تحت كل دعاء، ونص الآيات من المصحف (Tanzil). التصنيف حسب الموضوع آلي بالكلمات الواردة في نص الدعاء. لم يراجع المحتوى مراجعٌ شرعي في المنصة بعد.</p>
      <DuaList list={list} />
    </article>
  );
}
