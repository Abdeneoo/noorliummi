import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TYPES, categories, categoryItems, findCat, type IhType } from '@/lib/islamhouse';
import { LessonList, Pager, SourceNote } from '@/components/LessonParts';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الدروس' };
export default async function Cat({ params, searchParams }: { params: Promise<{ cat: string }>; searchParams: Promise<{ p?: string; t?: string }> }) {
  const id = Number((await params).cat); const sp = await searchParams; if (!Number.isInteger(id)) notFound();
  const type = (sp.t && sp.t in TYPES ? sp.t : 'showall') as IhType; const page = Math.max(1, Math.min(500, Number(sp.p) || 1));
  const [tree, list] = await Promise.all([categories(), categoryItems(id, type, page)]); const cat = findCat(tree, id);
  if (!cat && !list) notFound();
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/lessons">الدروس</Link></p><h1>{cat?.title ?? 'تصنيف'}</h1>{cat?.description && <p>{cat.description}</p>}</header>
      <SourceNote />
      {cat?.sub_categories?.length ? <ul className="chips" style={{ marginBottom: 14 }}>{cat.sub_categories.map((s) => <li key={s.id}><Link href={`/lessons/c/${s.id}`}>{s.title}</Link></li>)}</ul> : null}
      <ul className="chips lib-groups" style={{ marginBottom: 14 }}><li><Link className={type === 'showall' ? 'on' : ''} href={`/lessons/c/${id}`}>الكل</Link></li>{(Object.keys(TYPES) as (keyof typeof TYPES)[]).map((t) => <li key={t}><Link className={type === t ? 'on' : ''} href={`/lessons/c/${id}?t=${t}`}>{TYPES[t]}</Link></li>)}</ul>
      {list ? <><p className="note">{list.links.total_items.toLocaleString('ar-EG')} مادة</p><LessonList items={list.data} /><Pager base={`/lessons/c/${id}`} l={list.links} extra={type === 'showall' ? '' : `&t=${type}`} /></> : <p className="note">لا توجد مواد من هذا النوع في هذا القسم.</p>}
    </article>
  );
}
