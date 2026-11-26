import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { heCategories, heList, isHeLang } from '@/lib/hadeethenc';
export const metadata: Metadata = { title: 'أحاديث مترجمة مع الشرح' };
export default async function HeCat({ params, searchParams }: { params: Promise<{ cat: string }>; searchParams: Promise<{ p?: string; lang?: string }> }) {
  const id = Number((await params).cat); if (!Number.isInteger(id) || id < 1) notFound();
  const sp = await searchParams; const page = Math.max(1, Math.min(1000, Number(sp.p) || 1)); const q = isHeLang(sp.lang) ? `lang=${sp.lang}` : '';
  const [cats, list] = await Promise.all([heCategories(), heList(id, page)]); const cat = cats?.find((c) => Number(c.id) === id);
  if (!cat && !list) notFound();
  const subs = (cats ?? []).filter((c) => Number(c.parent_id) === id); const last = list?.meta.last_page ?? 1;
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/hadeeth">أحاديث مترجمة مع الشرح</Link></p><h1>{cat?.title ?? 'تصنيف'}</h1></header>
      {subs.length > 0 && <ul className="chips" style={{ marginBottom: 14 }}>{subs.map((s) => <li key={s.id}><Link href={`/hadeeth/c/${s.id}${q ? `?${q}` : ''}`}>{s.title}</Link></li>)}</ul>}
      {list?.data.length ? <ul className="lesson-list">{list.data.map((h) => <li key={h.id} className="card"><Link href={`/hadeeth/${h.id}${q && h.translations.includes(sp.lang as string) ? `?${q}` : ''}`}><strong>{h.title}</strong></Link>
        <p className="note" style={{ margin: 0 }}>{(['ur', 'tr', 'id'] as const).filter((l) => h.translations.includes(l)).map((l) => ({ ur: 'اردو', tr: 'Türkçe', id: 'Indonesia' })[l]).join(' · ') || 'بالعربية فقط'}</p></li>)}</ul> : <p className="note">لا أحاديث في هذا التصنيف مباشرة؛ اختر تصنيفًا فرعيًا.</p>}
      {last > 1 && <nav className="pager">{page > 1 ? <Link className="btn ghost" href={`/hadeeth/c/${id}?p=${page - 1}${q ? `&${q}` : ''}`}>السابق</Link> : <span />}<span className="note">صفحة {page.toLocaleString('ar-EG')} من {last.toLocaleString('ar-EG')}</span>{page < last ? <Link className="btn ghost" href={`/hadeeth/c/${id}?p=${page + 1}${q ? `&${q}` : ''}`}>التالي</Link> : <span />}</nav>}
    </article>
  );
}
