import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { og } from '@/lib/og-page';
import { bab } from '@/lib/fiqh';
export const metadata: Metadata = { title: 'Ghusl (the full ritual bath)', description: 'How to perform ghusl, what requires it and its rulings — the Arabic text of al-Fiqh al-Muyassar.', openGraph: og('/en/ghusl', 'en', 'Ghusl (the full ritual bath)') };
const EN: [RegExp, string][] = [[/صفة الغسل/, 'How ghusl is performed'], [/معنى الغسل/, 'Meaning, ruling and what requires it'], [/المستحبة/, 'Recommended baths'], [/الأحكام المترتبة/, 'Rulings for one who must bathe']];
type B = { tag: string; ar: string };
export default function GhuslEn() {
  const c = bab(7); if (!c) notFound();
  const parts: { title: string; blocks: B[] }[] = [];
  for (const b of c.blocks as B[]) { if (b.tag === 'h2' || b.tag === 'ref') continue; if (b.tag === 'h3') { parts.push({ title: b.ar.replace(/^المسألة [^:]+:\s*/, '').replace(/:$/, ''), blocks: [] }); continue; } parts[parts.length - 1]?.blocks.push(b); }
  const order = [...parts].sort((a, b) => Number(/صفة الغسل/.test(b.title)) - Number(/صفة الغسل/.test(a.title)));
  return (
    <article className="um" lang="en">
      <header className="um-hero gh-hero"><div className="um-hero-in"><p className="um-kicker"><Link href="/ghusl" lang="ar">العربية</Link></p><h1>Ghusl</h1>
        <p className="um-lead">The full ritual bath: how it is performed, what requires it, and its rulings. The text is the Arabic of «al-Fiqh al-Muyassar», shown as published; no English translation of this book is available to us yet.</p></div></header>
      {order.map((p, i) => <details key={i} className={`um-read${i === 0 ? ' gh-main' : ''}`} open={i === 0}><summary><span>{EN.find(([r]) => r.test(p.title))?.[1] ?? p.title} <small lang="ar" dir="rtl">{p.title}</small></span></summary>
        <div className="um-read-body" lang="ar" dir="rtl">{p.blocks.map((b, k) => b.tag === 'lead' ? <p key={k} className="gh-lead"><strong>{b.ar}</strong></p> : <p key={k}>{b.ar}</p>)}</div></details>)}
    </article>
  );
}
