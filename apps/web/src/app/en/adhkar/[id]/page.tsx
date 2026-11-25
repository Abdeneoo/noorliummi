import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DhikrList from '@/components/DhikrList';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';

export const dynamicParams = false;
export function generateStaticParams() { return ADHKAR.map((c) => ({ id: String(c.id) })); }
export const metadata: Metadata = { title: 'Adhkar' };
export default async function Cat({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); const c = ADHKAR.find((x) => x.id === id); if (!c) notFound();
  const data = await loadAdhkar(id);
  return (
    <article style={{ maxWidth: 760, margin: '24px auto' }}>
      <h1 lang="ar" dir="rtl">{c.title}</h1>
      <p className="review-banner">Trial version awaiting review by scholars.</p>
      <DhikrList catId={id} items={data.items} lang="en" />
      <nav className="pager"><Link className="btn ghost" href="/en/adhkar">All chapters</Link><Link className="btn ghost" href={`/adhkar/${id}`} lang="ar">العربية</Link></nav>
    </article>
  );
}
