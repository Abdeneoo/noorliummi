import type { Metadata } from 'next';
import Hifz from '@/components/Hifz';
export const metadata: Metadata = { title: 'Memorise and review' };
export default function HifzPage() {
  return (
    <article style={{ maxWidth: 760, margin: '24px auto' }}>
      <h1>Memorise and review</h1>
      <p>Choose the ayat you are memorising. Each ayah comes back when it is due: recite it from memory, reveal it, and rate how well you remembered — it returns sooner if you forgot and later if it is firm.</p>
      <Hifz lang="en" />
    </article>
  );
}
