import KidBlocked from '@/components/KidBlocked';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { allows } from '@/lib/family-rules';
import { kidHere } from '@/lib/kid-page';
export default async function KidAdhkar({ params }: { params: Promise<{ id: string }> }) {
  const k = await kidHere(); if (k?.timeUp) return null; const id = Number((await params).id);
  if (!k || !ADHKAR.some((c) => c.id === id) || !allows(k.allowed, 'adhkar', id)) return <KidBlocked />;
  const d = await loadAdhkar(id);
  return <article><h1 className="kid-center">{d.title}</h1>{d.items.map((x: { n: number; t: string; c: number; r: string }) => <section key={x.n} className="card"><p className="kid-dhikr">{x.t}</p><p className="note">{x.c > 1 ? `${x.c.toLocaleString('ar-EG')} مرات · ` : ''}{x.r}</p></section>)}</article>;
}
