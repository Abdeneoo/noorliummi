import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TYPES, item, sourceUrl } from '@/lib/islamhouse';
import { SourceNote } from '@/components/LessonParts';
import LessonPlayer from '@/components/LessonPlayer';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const x = await item(Number((await params).id)); return { title: x?.title ?? 'درس', description: x?.description?.slice(0, 160) ?? undefined }; }
export default async function Lesson({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const x = await item(id); if (!x) notFound();
  const att = x.attachments ?? [];
  return (
    <article className="reader" style={{ maxWidth: 820 }}>
      <header><p className="eyebrow"><Link href="/lessons">الدروس</Link> · {TYPES[x.type as keyof typeof TYPES] ?? x.type}</p><h1 style={{ fontSize: '1.6rem' }}>{x.title}</h1>
        <div className="meta">{x.prepared_by?.map((p) => <Link key={p.id} href={`/lessons/author/${p.id}`}>{p.title}{p.kind && p.kind !== 'author' ? ` (${p.kind})` : ''}</Link>)}<span>{new Date(x.add_date * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div></header>
      <SourceNote />
      {x.description && <p style={{ lineHeight: 2 }}>{x.description}</p>}
      {x.full_description && <p style={{ lineHeight: 2, whiteSpace: 'pre-line' }}>{x.full_description.replace(/<[^>]+>/g, ' ')}</p>}
      <LessonPlayer id={x.id} title={x.title} attachments={att} />
      <p className="note">المصدر: <a href={sourceUrl(x)} target="_blank" rel="noopener">صفحة المادة في IslamHouse.com ↗</a>{x.update_date ? ` · آخر تحديث في المصدر ${new Date(x.update_date * 1000).toLocaleDateString('ar-EG')}` : ''}. حالة المراجعة في منصتنا: موثّق المصدر، لم يراجعه مراجع المنصة.</p>
    </article>
  );
}
