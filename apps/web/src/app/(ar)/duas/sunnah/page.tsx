import type { Metadata } from 'next';
import Link from 'next/link';
import { QD } from '@/lib/duas';
import DuaList from '@/components/DuaList';
import DuaNav from '@/components/DuaNav';
export const revalidate = 300;
export const metadata: Metadata = { title: 'أدعية من السنة النبوية', description: 'أدعية من السنة مع تخريجها وحكم المحدثين كما ذكره المؤلف.' };
export default function Page() {
  const list = QD.duas.filter((d) => d.kind === 'sunnah');
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>أدعية من السنة النبوية</h1><p>{list.length.toLocaleString('ar-EG')} دعاءً، وتحت كل دعاء تخريجه ودرجته كما ذكرها المؤلف (ومنها ما رُوي موقوفًا على صحابي، والمؤلف يبيّن ذلك في تخريجه).</p></header>
      <DuaNav />
      <p className="review-banner">النصوص من كتاب «الدعاء من الكتاب والسنة» للدكتور سعيد بن علي بن وهف القحطاني كما نشرته موسوعة المحتوى الإسلامي (IslamHouse)، مع تخريج المؤلف وحكمه تحت كل دعاء، ونص الآيات من المصحف (Tanzil). التصنيف حسب الموضوع آلي بالكلمات الواردة في نص الدعاء. لم يراجع المحتوى مراجعٌ شرعي في المنصة بعد.</p>
      <DuaList list={list} />
    </article>
  );
}
