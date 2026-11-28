import KidBlocked from '@/components/KidBlocked';
import LessonPlayer from '@/components/LessonPlayer';
import { allows } from '@/lib/family-rules';
import { item } from '@/lib/islamhouse';
import { kidHere } from '@/lib/kid-page';
export default async function KidLesson({ params }: { params: Promise<{ id: string }> }) {
  const k = await kidHere(); if (k?.timeUp) return null; const id = Number((await params).id);
  if (!k || !Number.isInteger(id) || !allows(k.allowed, 'lessons', id)) return <KidBlocked />;
  const x = await item(id); if (!x) return <KidBlocked />;
  return <article><h1>{x.title}</h1>{x.prepared_by?.length ? <p className="note">{x.prepared_by.map((p) => p.title).join('، ')}</p> : null}{x.description && <p>{x.description}</p>}<LessonPlayer id={x.id} title={x.title} attachments={x.attachments ?? []} /></article>;
}
