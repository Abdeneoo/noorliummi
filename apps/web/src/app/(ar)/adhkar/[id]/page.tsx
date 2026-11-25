import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DhikrList from '@/components/DhikrList';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';

export const dynamicParams = false;
export function generateStaticParams() { return ADHKAR.map((c) => ({ id: String(c.id) })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = ADHKAR.find((x) => x.id === Number(id));
  return { title: c?.title ?? 'الأذكار' };
}
export default async function AdhkarCat({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!ADHKAR.some((c) => c.id === id)) notFound();
  const cat = await loadAdhkar(id);
  return (
    <article className="reader">
      <header><h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '1.6rem', fontWeight: 700 }}>{cat.title}</h1></header>
      <p className="review-banner" role="note">نسخة تجريبية: النصوص والأعداد والتخريج كما وردت في المصدر، ولم تكتمل مراجعتها بعد.</p>
      {id === 29 && <p style={{ textAlign: 'center' }}><Link className="btn ghost" href="/sakina?adhkar=sleep">وضع السكينة: ذكر واحد بخط كبير ومؤقت نوم</Link></p>}
      <DhikrList catId={id} items={cat.items} />
      <p className="note">المصدر: «حصن المسلم» — سعيد بن علي بن وهف القحطاني.</p>
      <nav className="pager"><Link className="btn ghost" href="/adhkar">كل الأبواب</Link></nav>
    </article>
  );
}
