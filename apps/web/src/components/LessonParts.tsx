import Link from 'next/link';
import { TYPES, type IhItem, type IhList } from '@/lib/islamhouse';
const d = (t: number) => new Date(t * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
export function LessonList({ items }: { items: IhItem[] }) {
  if (!items.length) return <p className="note">لا توجد مواد في هذا القسم.</p>;
  return (
    <ul className="lesson-list">{items.map((x) => (
      <li key={x.id} className="card"><Link href={`/lessons/${x.id}`}><strong>{x.title}</strong></Link>
        <p className="meta" style={{ justifyContent: 'flex-start' }}><span>{TYPES[x.type as keyof typeof TYPES] ?? x.type}</span>{x.prepared_by?.slice(0, 2).map((p) => <Link key={p.id} href={`/lessons/author/${p.id}`}>{p.title}</Link>)}<span>{d(x.add_date)}</span></p>
        {x.description && <p className="note" style={{ margin: 0 }}>{x.description.length > 220 ? `${x.description.slice(0, 220)}…` : x.description}</p>}</li>))}
    </ul>
  );
}
export function Pager({ base, l, extra = '' }: { base: string; l: IhList['links']; extra?: string }) {
  if (l.pages_number <= 1) return null;
  return <nav className="pager">{l.current_page > 1 ? <Link className="btn ghost" href={`${base}?p=${l.current_page - 1}${extra}`}>السابق</Link> : <span />}<span className="note">صفحة {l.current_page.toLocaleString('ar-EG')} من {l.pages_number.toLocaleString('ar-EG')}</span>{l.current_page < l.pages_number ? <Link className="btn ghost" href={`${base}?p=${l.current_page + 1}${extra}`}>التالي</Link> : <span />}</nav>;
}
export const SourceNote = () => <p className="review-banner">المواد من موقع <a href="https://islamhouse.com/ar/" target="_blank" rel="noopener">دار الإسلام IslamHouse.com ↗</a> كما هي دون تعديل، وتُبث ملفاتها من خوادمه. الآراء لأصحابها، ولم يراجع هذه المواد مراجعٌ من منصة نور لأمي.</p>;
