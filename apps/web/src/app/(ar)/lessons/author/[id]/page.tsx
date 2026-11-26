import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { author, authorItems } from '@/lib/islamhouse';
import { LessonList, Pager, SourceNote } from '@/components/LessonParts';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الدروس — المؤلف' };
export default async function Author({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ p?: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id)) notFound(); const page = Math.max(1, Math.min(500, Number((await searchParams).p) || 1));
  const [a, list] = await Promise.all([author(id), authorItems(id, page)]); if (!a && !list) notFound();
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/lessons">الدروس</Link></p><h1>{a?.title ?? 'مؤلف'}</h1>{a?.description && <p>{a.description}</p>}</header>
      <SourceNote />
      {list ? <><LessonList items={list.data} /><Pager base={`/lessons/author/${id}`} l={list.links} /></> : <p className="note">لا توجد مواد.</p>}
    </article>
  );
}
