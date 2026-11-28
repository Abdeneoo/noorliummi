import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bab } from '@/lib/fiqh';

export const metadata: Metadata = { title: 'الغسل من الجنابة', description: 'معنى الغسل وموجباته، وصفة الغسل وكيفيته، والأغسال المستحبة، وأحكام من وجب عليه الغسل — من «الفقه الميسر».' };
type B = { tag: string; ar: string };

export default function Ghusl() {
  const c = bab(7); if (!c) notFound();
  const parts: { title: string; blocks: B[] }[] = [];
  for (const b of c.blocks as B[]) {
    if (b.tag === 'h2') continue;
    if (b.tag === 'h3') { parts.push({ title: b.ar.replace(/^المسألة [^:]+:\s*/, '').replace(/:$/, ''), blocks: [] }); continue; }
    if (b.tag === 'ref') continue;
    parts[parts.length - 1]?.blocks.push(b);
  }
  const main = parts.findIndex((p) => /صفة الغسل/.test(p.title));
  const order = main > 0 ? [parts[main], ...parts.filter((_, i) => i !== main)] : parts;
  return (
    <article className="um">
      <header className="um-hero gh-hero">
        <div className="um-hero-in">
          <p className="um-kicker"><Link href="/fiqh/taharah">كتاب الطهارة</Link></p>
          <h1>الغسل من الجنابة</h1>
          <p className="um-lead">صفة الغسل وموجباته وأحكامه، من «الفقه الميسر في ضوء الكتاب والسنة».</p>
        </div>
      </header>
      <nav className="um-tabs" aria-label="أقسام الصفحة">{order.map((p, i) => <a key={i} href={`#g${i}`}>{p.title.split('،')[0].replace(/^في /, '')}</a>)}</nav>
      {order.map((p, i) => (
        <details key={i} id={`g${i}`} className={`um-read${i === 0 ? ' gh-main' : ''}`} open={i === 0}>
          <summary><span>{p.title}</span></summary>
          <div className="um-read-body">{p.blocks.map((b, k) => b.tag === 'lead' ? <p key={k} className="gh-lead" lang="ar"><strong>{b.ar}</strong></p> : <p key={k} lang="ar">{b.ar}</p>)}</div>
        </details>
      ))}
      <section className="um-section"><div className="um-section-head"><h2>من كتاب الطهارة</h2></div>
        <div className="um-grid">
          <Link className="um-tile" href="/fiqh/taharah/5"><strong>الوضوء</strong><span>فروضه وسننه ونواقضه</span></Link>
          <Link className="um-tile" href="/fiqh/taharah/8"><strong>التيمم</strong><span>عند فقد الماء أو العجز عنه</span></Link>
          <Link className="um-tile" href="/fiqh/taharah/10"><strong>الحيض والنفاس</strong></Link>
          <Link className="um-tile" href="/fiqh/taharah"><strong>كتاب الطهارة كاملًا</strong></Link>
        </div>
      </section>
    </article>
  );
}
