import type { Metadata } from 'next';
import Sakina from '@/components/Sakina';
import { loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'وضع السكينة' };
export default async function SakinaPage({ searchParams }: { searchParams: Promise<{ s?: string; adhkar?: string }> }) {
  const sp = await searchParams;
  if (sp.adhkar === 'sleep') { const d = await loadAdhkar(29); return <Sakina adhkar={d.items.map((x) => ({ t: x.t, c: x.c, a: x.a }))} />; }
  const s = Number(sp.s); return <Sakina surah={Number.isInteger(s) && s >= 1 && s <= 114 ? s : 67} />;
}
