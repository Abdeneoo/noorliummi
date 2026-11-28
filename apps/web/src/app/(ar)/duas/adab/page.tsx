import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { QD, note } from '@/lib/duas';
import DuaNav from '@/components/DuaNav';
export const metadata: Metadata = { title: 'فضل الدعاء وآدابه وأوقات الإجابة', openGraph: og('/duas/adab', 'ar', 'فضل الدعاء وآدابه وأوقات الإجابة') };
export default function Page() {
  return (
    <article className="reader book" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1 style={{ fontSize: '1.5rem' }}>فضل الدعاء وآدابه وأوقات الإجابة</h1><p className="meta"><span>{QD.title}</span><span>{QD.author}</span></p></header>
      <DuaNav />
      <div className="book-body">{QD.sections.map((s, i) => (
        <section key={i}><h2>{s.title}</h2>{s.blocks.map((b, k) => b.tag === 'note' ? <p key={k} className="fiqh-ref">{note(b.ar)}</p> : <p key={k} className="ar">{b.ar}</p>)}</section>
      ))}</div>
    </article>
  );
}
