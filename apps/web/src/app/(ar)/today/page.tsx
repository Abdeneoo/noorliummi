import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import TodayBoard from '@/components/TodayBoard';
import { ayahOfDay } from '@/lib/daily';
import { sunnahAt, weekIdx } from '@/lib/weekly-sunnah';
import { QD, ayatOf, surahName } from '@/lib/duas';
import nawawi from '@/generated/hadith/nawawi.json';
import { loadSurah } from '@/lib/quran';
export const metadata: Metadata = { title: 'يومي مع الله', description: 'لوحتك اليومية: الصلاة القادمة، أذكار الوقت، الورد والختمة، آية وحديث ودعاء اليوم، سنة الأسبوع، الدعاء للوالدين، والمراجعة.' };
export const revalidate = 3600;
export default async function Today() {
  const now = new Date(); const date = now.toISOString().slice(0, 10);
  const doy = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000);
  const ayah = await ayahOfDay(date);
  const h = (nawawi as { n: number; t: string }[])[doy % 42];
  const duas = QD.duas.filter((d) => d.text.length < 400); const dua = duas[doy % duas.length];
  const duaAyat = dua.kind === 'quran' ? await ayatOf(dua) : [];
  const sunnah = await sunnahAt(weekIdx(now));
  const parents = (await loadSurah(17)).ayat[23];
  return (
    <article style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>يومي مع الله</h1><p>لوحة يومك في صفحة واحدة. ما تضع عليه علامة يبقى على جهازك وحدك، بلا أرقام ولا تقييم.</p></header>
      <PrayerCard />
      <div className="duo">
        <section className="card"><p className="eyebrow">آية اليوم</p><p lang="ar" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.3rem', lineHeight: 2.2 }}>{ayah.t}</p><p className="note">سورة {ayah.name}، الآية {ayah.a.toLocaleString('ar-EG')} — <Link href={`/quran/${ayah.s}#a${ayah.a}`}>في المصحف</Link> · <Link href={`/tafsir/${ayah.s}#a${ayah.a}`}>التفسير</Link></p></section>
        <section className="card"><p className="eyebrow">حديث اليوم</p><p lang="ar" style={{ lineHeight: 2 }}>{h.t.length > 700 ? `${h.t.slice(0, 700)}…` : h.t}</p><p className="note">الأربعون النووية ({h.n.toLocaleString('ar-EG')}) — <Link href={`/hadith/nawawi#h${h.n}`}>اقرأه كاملًا</Link></p></section>
      </div>
      <div className="duo">
        <section className="card"><p className="eyebrow">دعاء اليوم</p><p lang="ar" style={{ lineHeight: 2.1 }}>{dua.text}</p><p className="note">{dua.kind === 'quran' && duaAyat.length ? `${surahName(duaAyat[0].s)}: ${duaAyat.map((x) => x.a).join('، ')} — ` : ''}«الدعاء من الكتاب والسنة» للقحطاني — <Link href="/duas">موسوعة الدعاء</Link></p></section>
        <section className="card"><p className="eyebrow">الدعاء للوالدين</p><p lang="ar" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.2rem', lineHeight: 2.2 }}>{parents.t}</p><p className="note">الإسراء: ٢٤ — <Link href="/playlists#parents">قائمة أدعية الوالدين</Link> · <Link href="/sadaqah/parents">برّهما بعد وفاتهما</Link></p></section>
      </div>
      <section className="card"><p className="eyebrow">سنة هذا الأسبوع</p><h2 style={{ margin: '4px 0' }}>{sunnah.title}</h2><p lang="ar" style={{ lineHeight: 2 }}>{sunnah.text.length > 500 ? `${sunnah.text.slice(0, 500)}…` : sunnah.text}</p><p className="note">رياض الصالحين{sunnah.n ? ` (${sunnah.n})` : ''} — <Link href={sunnah.href}>الباب كاملًا</Link> · <Link href="/sunnah">كل السنن الأسبوعية</Link></p></section>
      <TodayBoard />
    </article>
  );
}
