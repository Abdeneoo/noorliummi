import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import MosqueFinder from '@/components/MosqueFinder';
export const metadata: Metadata = { title: 'المساجد القريبة', openGraph: og('/mosques', 'ar', 'المساجد القريبة') };
export default function Mosques() { return <article style={{ maxWidth: 760, margin: '24px auto' }}><h1>المساجد القريبة</h1><MosqueFinder /></article>; }
