import type { Metadata } from 'next';
import Sakina from '@/components/Sakina';
import { loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'وضع السكينة' };
export default async function SakinaPage({ searchParams }: { searchParams: Promise<{ s?: string; adhkar?: string }> }) {
  const sp = await searchParams;
  const cat = ({ sleep: 29, morning: 27, evening: 28 } as Record<string, number>)[sp.adhkar ?? ''];
  if (cat) { const d = await loadAdhkar(cat); return <Sakina adhkar={d.items.map((x) => ({ t: x.t, c: x.c, a: x.a }))} back={`/adhkar/${cat}`} />; }
  const s = Number(sp.s); return <Sakina surah={Number.isInteger(s) && s >= 1 && s <= 114 ? s : 67} />;
}
