import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Circle from '@/components/Circle';
import { isSlug } from '@/lib/athar';
export const metadata: Metadata = { title: 'حلقة', robots: { index: false, follow: false } };
export default async function CirclePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!isSlug(slug)) notFound(); return <article style={{ maxWidth: 860, margin: '0 auto' }}><Circle slug={slug} /></article>; }
