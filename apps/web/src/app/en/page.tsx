import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
export const metadata: Metadata = { title: 'Home' };
export default function Home() {
  return (
    <>
      <section className="hero"><h1>Noor Li Ummi</h1><p>A light that never fades, a legacy that never ends.</p></section>
      <PrayerCard lang="en" />
      <div className="grid" style={{ marginTop: 20 }}>
        <section className="card"><h2>The Holy Quran</h2><p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>The Arabic text in Uthmani script with an English translation of the meanings and its footnotes.</p><Link className="btn" href="/en/quran">Open the Quran</Link></section>
        <section className="card"><h2>Adhkar</h2><p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>Hisn al-Muslim in Arabic, with English and transliteration where a licensed translation exists.</p><Link className="btn" href="/en/adhkar">Open adhkar</Link></section>
        <section className="card"><h2>More (in Arabic)</h2><p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>Tafsir, hadith, the Names of Allah, memorisation, monthly timetable and qibla are available in the Arabic interface for now.</p><Link className="btn ghost" href="/" lang="ar">العربية</Link></section>
      </div>
    </>
  );
}
