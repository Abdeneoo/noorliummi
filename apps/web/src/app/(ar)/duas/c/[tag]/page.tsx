import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QD, TAG } from '@/lib/duas';
import DuaList from '@/components/DuaList';
import DuaNav from '@/components/DuaNav';
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(TAG).map((tag) => ({ tag }));
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> { return { title: TAG[(await params).tag] ?? 'الأدعية' }; }
export default async function Page({ params }: { params: Promise<{ tag: string }> }) {
  const tag = (await params).tag; if (!TAG[tag]) notFound();
  const list = QD.duas.filter((d) => d.tags.includes(tag));
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>{TAG[tag]}</h1><p>{list.length.toLocaleString('ar-EG')} دعاءً وردت فيها هذه الكلمات.</p></header>
      <DuaNav />
      <ul className="chips even" style={{ marginBottom: 12 }}>{Object.entries(TAG).filter(([k]) => k !== tag).map(([k, v]) => <li key={k}><Link href={`/duas/c/${k}`}>{v}</Link></li>)}</ul>
      <p className="review-banner">النصوص من كتاب «الدعاء من الكتاب والسنة» للدكتور سعيد بن علي بن وهف القحطاني كما نشرته موسوعة المحتوى الإسلامي (IslamHouse)، مع تخريج المؤلف وحكمه تحت كل دعاء، ونص الآيات من المصحف (Tanzil). التصنيف حسب الموضوع آلي بالكلمات الواردة في نص الدعاء. لم يراجع المحتوى مراجعٌ شرعي في المنصة بعد.</p>
      <DuaList list={list} />
    </article>
  );
}
