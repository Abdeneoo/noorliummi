import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LIBRARY, libBook } from '@/lib/library';
import { arDigits } from '@/lib/quran';
export const dynamicParams = false;
export function generateStaticParams() { return LIBRARY.map((b) => ({ book: b.key })); }
export async function generateMetadata({ params }: { params: Promise<{ book: string }> }): Promise<Metadata> { const b = libBook((await params).book); return { title: b?.ar ?? 'المكتبة' }; }
export default async function BookIndex({ params }: { params: Promise<{ book: string }> }) {
  const b = libBook((await params).book); if (!b) notFound();
  const groups: { g: string; items: typeof b.sections }[] = [];
  for (const s of b.sections) { const g = s.group ?? ''; if (!groups.length || groups[groups.length - 1].g !== g) groups.push({ g, items: [] }); groups[groups.length - 1].items.push(s); }
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المكتبة</p><h1>{b.ar}</h1><p>{b.title_full && b.title_full !== b.ar ? `${b.title_full} — ` : ''}{b.author}</p></header>
      {b.key === 'bidaya' && <p className="note">العناوين بين معقوفين من وضع محقق الطبعة، أُبقيت للتنقل. يعرض الكتاب أقوال المذاهب وأدلتها وأسباب اختلافها؛ ولا يُعدّ ما فيه فتوى من المنصة.</p>}
      {groups.map((gr, k) => (
        <section key={k} className="section">{gr.g && <h2>{gr.g}</h2>}
          <ul className="surah-list">{gr.items.map((s) => <li key={s.i}><Link href={`/library/${b.key}/${s.i}`}><span className="num">{arDigits(s.i)}</span><span><span className="nm">{b.key === 'adhkar-nawawi' ? `الصفحات ${s.title.split('–').map((x) => arDigits(Number(x))).join(' إلى ')}` : s.title}</span>{s.n > 0 && <span className="sub">{arDigits(s.n)} حديثًا</span>}</span></Link></li>)}</ul>
        </section>
      ))}
    </article>
  );
}
