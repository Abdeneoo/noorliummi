import Link from 'next/link';
import KidTasks from '@/components/KidTasks';
import { kidTasks } from '@/lib/family';
import { allows } from '@/lib/family-rules';
import { kidHere } from '@/lib/kid-page';
import { ADHKAR } from '@/lib/adhkar';
import { SURAHS } from '@/lib/quran';
import { item } from '@/lib/islamhouse';
export default async function KidsHome() {
  const k = await kidHere(); if (!k || k.timeUp) return null; const a = k.allowed;
  const lessons = allows(a, 'lessons') ? (await Promise.all(a.lessons.slice(0, 30).map((id) => item(id)))).filter((x) => x != null) : [];
  return (
    <>
      <h1>السلام عليكم يا {k.name}</h1>
      <KidTasks tasks={await kidTasks(k.id)} />
      {allows(a, 'quran') && a.surahs.length > 0 && <section><h2>القرآن</h2><ul className="kid-tiles">{a.surahs.map((n) => <li key={n}><Link href={`/kids/surah/${n}`}>سورة {SURAHS[n - 1].name}</Link></li>)}</ul></section>}
      {allows(a, 'adhkar') && a.adhkar.length > 0 && <section><h2>الأذكار</h2><ul className="kid-tiles">{a.adhkar.map((id) => { const c = ADHKAR.find((x) => x.id === id); return c ? <li key={id}><Link href={`/kids/adhkar/${id}`}>{c.title}</Link></li> : null; })}</ul></section>}
      {lessons.length > 0 && <section><h2>الدروس</h2><ul className="kid-tiles">{lessons.map((x) => <li key={x.id}><Link href={`/kids/lesson/${x.id}`}>{x.title}</Link></li>)}</ul></section>}
      {allows(a, 'tasbeeh') && <section><h2>المسبحة</h2><ul className="kid-tiles"><li><Link href="/kids/tasbeeh">سبّح</Link></li></ul></section>}
      {!a.sections.length && <p className="note">لم يختر وليّ الأمر محتوى بعد.</p>}
    </>
  );
}
