import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import Tiles from '@/components/Tiles';
import Reveal from '@/components/Reveal';
import Tasbeeh from '@/components/Tasbeeh';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';
export const metadata: Metadata = { title: { absolute: 'Noor Li Ummi — Quran, prayer times and adhkar' } };
export default function Home() {
  return (
    <>
      <HomeCover lang="en" />
      <div className="lift reveal"><PrayerCard lang="en" /></div>
      <div className="duo section reveal"><ContinueReading lang="en" /><TodayAdhkar lang="en" /></div>
      <div className="section reveal tas-home"><Tasbeeh lang="en" /></div>
      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">Explore</h2><Link href="/en/knowledge">All sections</Link></div>
        <Tiles items={[
          { href: '/en/quran', icon: 'quran', title: 'Quran', desc: 'Arabic text with the translation of the meanings.' },
          { href: '/en/adhkar', icon: 'adhkar', title: 'Adhkar', desc: 'Hisn al-Muslim with translation.' },
          { href: '/en/athar', icon: 'sadaqah', title: 'Athar pages', desc: 'Pages dedicated to loved ones.' },
          { href: '/en/names', icon: 'names', title: 'Names of Allah', desc: 'With the verses that mention them.' },
          { href: '/en/hifz', icon: 'hifz', title: 'Memorise', desc: 'Spaced review on your device.' },
          { href: '/en/adhan', icon: 'bell', title: 'Adhan', desc: 'Choose the sound and alerts.' },
          { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'From OpenStreetMap.' },
          { href: '/tafsir', icon: 'tafsir', title: 'Tafsir (Arabic)', desc: 'Tafsir al-Jalalayn.', lang: 'ar' },
          { href: '/hadith', icon: 'hadith', title: 'Hadith (Arabic)', desc: 'Hadith collections with search (Arabic).', lang: 'ar' },
        ]} />
      </section>
      <Reveal />
    </>
  );
}
