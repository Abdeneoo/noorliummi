import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import Tiles from '@/components/Tiles';
import Reveal from '@/components/Reveal';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';
export const metadata: Metadata = { title: 'Home' };
export default function Home() {
  return (
    <>
      <HomeCover lang="en" />
      <div className="lift reveal"><PrayerCard lang="en" /></div>
      <div className="duo section reveal"><ContinueReading lang="en" /><TodayAdhkar lang="en" /></div>
      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">Explore</h2><Link href="/en/knowledge">All sections</Link></div>
        <Tiles items={[
          { href: '/en/names', icon: 'names', title: 'Names of Allah', desc: 'With the verses that mention them.' },
          { href: '/en/hifz', icon: 'hifz', title: 'Memorise', desc: 'Spaced review on your device.' },
          { href: '/en/adhan', icon: 'bell', title: 'Adhan', desc: 'Choose the sound and alerts.' },
          { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'From OpenStreetMap.' },
          { href: '/tafsir', icon: 'tafsir', title: 'Tafsir (Arabic)', desc: 'Tafsir al-Jalalayn.', lang: 'ar' },
          { href: '/hadith', icon: 'hadith', title: 'Hadith (Arabic)', desc: 'Eleven collections.', lang: 'ar' },
        ]} />
      </section>
      <section className="section memorial-band reveal" aria-labelledby="ded-title">
        <div className="arch-frame" aria-hidden="true" />
        <div className="band-text">
          <p className="eyebrow" id="ded-title">Dedication</p>
          <p className="band-quote">To my beloved mother, who has left my sight but never my heart.</p>
          <div className="row"><Link className="btn light" href="/en/dedication">Read the dedication</Link></div>
        </div>
      </section>
      <Reveal />
    </>
  );
}
