import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { QD } from '@/lib/duas';
import DuaList from '@/components/DuaList';
import DuaNav from '@/components/DuaNav';
export const revalidate = 300;
export const metadata: Metadata = { title: 'أدعية من السنة النبوية', description: 'أدعية من السنة مع تخريجها وحكم المحدثين كما ذكره المؤلف.', openGraph: og('/duas/sunnah', 'ar', 'أدعية من السنة النبوية', 'أدعية من السنة مع تخريجها وحكم المحدثين كما ذكره المؤلف.') };
export default function Page() {
  const list = QD.duas.filter((d) => d.kind === 'sunnah');
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>أدعية من السنة النبوية</h1><p>{list.length.toLocaleString('ar-EG')} دعاءً، وتحت كل دعاء تخريجه ودرجته كما ذكرها المؤلف (ومنها ما رُوي موقوفًا على صحابي، والمؤلف يبيّن ذلك في تخريجه).</p></header>
      <DuaNav />
      <DuaList list={list} />
    </article>
  );
}
