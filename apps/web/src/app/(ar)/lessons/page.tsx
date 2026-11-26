import type { Metadata } from 'next';
import Link from 'next/link';
import { FEATURED, categories, latest } from '@/lib/islamhouse';
import { LessonList, SourceNote } from '@/components/LessonParts';
import LessonShelf from '@/components/LessonShelf';
import LessonCatSearch from '@/components/LessonCatSearch';
import type { IhCat } from '@/lib/islamhouse';
const flat = (t: IhCat | null, out: [number, string][] = []) => { for (const c of t?.sub_categories ?? []) { out.push([c.id, c.title]); flat(c, out); } return out; };
export const revalidate = 300;
export const metadata: Metadata = { title: 'الدروس' };
export default async function Lessons() {
  const [tree, audio] = await Promise.all([categories(), latest('audios', 1, 8)]);
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المعرفة</p><h1>الدروس</h1><p>دروس ومحاضرات وكتب في العقيدة والفقه والتفسير والسيرة والآداب، من موقع دار الإسلام، مصنّفة حسب الموضوع.</p></header>
      <SourceNote />
      <LessonShelf />
      {tree && <LessonCatSearch cats={flat(tree)} />}
      <section className="section"><h2>أبرز الأبواب</h2><ul className="chips even">{FEATURED.map(([id, t]) => <li key={id}><Link href={`/lessons/c/${id}`}>{t}</Link></li>)}</ul></section>
      <section className="section"><h2>كتب تُقرأ درسًا درسًا</h2><ul className="athar-dir"><li><Link href="/library/riyad"><strong>رياض الصالحين</strong><small>٣٧٢ بابًا: آيات ثم أحاديث</small></Link></li><li><Link href="/hadith/nawawi"><strong>الأربعون النووية</strong><small>٤٢ حديثًا</small></Link></li><li><Link href="/library/adhkar-nawawi"><strong>الأذكار للنووي</strong></Link></li></ul></section>
      {tree?.sub_categories && <section className="section"><h2>كل التصنيفات</h2>
        <ul className="surah-list">{tree.sub_categories.map((c) => <li key={c.id}><Link href={`/lessons/c/${c.id}`}><span><span className="nm">{c.title}</span>{c.sub_categories?.length ? <span className="sub">{c.sub_categories.slice(0, 4).map((s) => s.title).join('، ')}…</span> : null}</span></Link></li>)}</ul></section>}
      <section className="section"><h2>أحدث الصوتيات</h2>{audio ? <LessonList items={audio.data} /> : <p className="note">تعذّر الاتصال بالمصدر الآن. حاول لاحقًا.</p>}</section>
    </article>
  );
}
