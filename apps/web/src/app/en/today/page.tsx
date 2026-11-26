import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import TodayBoard from '@/components/TodayBoard';
import { ayahOfDay } from '@/lib/daily';
import { loadSurah } from '@/lib/quran';
export const metadata: Metadata = { title: 'My day with Allah', description: 'Your daily board: next prayer, adhkar, wird and khatma, ayah of the day, dua for parents, review and your own reminders — kept on your device.', alternates: { languages: { ar: '/today' } } };
export const revalidate = 3600;
/** Saheeh International (QuranEnc 1.1.2), footnote markers removed for the card. */
async function en(s: number, a: number) { try { const m = (await import(`@/generated/en/quran/${s}.json`)).default as { ayat: { tr: string }[] }; return (m.ayat[a - 1]?.tr ?? '').replace(/\[\d+\]/g, ''); } catch { return ''; } }
export default async function TodayEn() {
  const date = new Date().toISOString().slice(0, 10); const ayah = await ayahOfDay(date); const tr = await en(ayah.s, ayah.a);
  const parents = (await loadSurah(17)).ayat[23]; const ptr = await en(17, 24);
  return (
    <article style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>My day with Allah</h1><p>Your day on one page. Whatever you mark stays on your device alone — no numbers, no judgement.</p></header>
      <PrayerCard lang="en" />
      <div className="duo">
        <section className="card"><p className="eyebrow">Ayah of the day</p><p lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.3rem', lineHeight: 2.2 }}>{ayah.t}</p>{tr && <p>{tr}</p>}{tr && <p className="note">Translation: Saheeh International (QuranEnc).</p>}<p className="note">Surah {ayah.s}, ayah {ayah.a} — <Link href={`/en/quran/${ayah.s}`}>open</Link></p></section>
        <section className="card"><p className="eyebrow">Dua for parents</p><p lang="ar" dir="rtl" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.2rem', lineHeight: 2.2 }}>{parents.t}</p>{ptr && <p>{ptr}</p>}<p className="note">al-Isra 17:24 — <Link href="/en/playlists#parents">duas for parents</Link></p></section>
      </div>
      <TodayBoard lang="en" />
    </article>
  );
}
