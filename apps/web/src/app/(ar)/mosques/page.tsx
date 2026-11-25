import type { Metadata } from 'next';
import MosqueFinder from '@/components/MosqueFinder';
export const metadata: Metadata = { title: 'المساجد القريبة' };
export default function Mosques() { return <article style={{ maxWidth: 760, margin: '24px auto' }}><h1>المساجد القريبة</h1><MosqueFinder /></article>; }
