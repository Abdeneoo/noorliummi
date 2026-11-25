import type { Metadata } from 'next';
import MosqueFinder from '@/components/MosqueFinder';
export const metadata: Metadata = { title: 'Nearby mosques' };
export default function Mosques() { return <article style={{ maxWidth: 760, margin: '24px auto' }}><h1>Nearby mosques</h1><MosqueFinder lang="en" /></article>; }
