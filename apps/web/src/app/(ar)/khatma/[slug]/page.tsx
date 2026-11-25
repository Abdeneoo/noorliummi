import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KhatmaBoard from '@/components/KhatmaBoard';
import { isSlug } from '@/lib/athar';
import { loadAdhkar } from '@/lib/adhkar';
import { feminine } from '@/lib/dua';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ختمة جماعية', robots: { index: false, follow: false } };
export default async function KhatmaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug)) notFound();
  const d = (await loadAdhkar(56)).items[0];
  return <article style={{ maxWidth: 860, margin: '24px auto' }}><KhatmaBoard slug={slug} dua={{ masc: d.t, fem: feminine(d.t), ref: `رواه مسلم (${d.r}) — من حصن المسلم` }} /></article>;
}
