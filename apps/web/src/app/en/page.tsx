import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import BrandLogo from '@/components/BrandLogo';
import Tiles from '@/components/Tiles';
import Icon from '@/components/Icon';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';
export const metadata: Metadata = { title: 'Home' };
export default function Home() {
  return (
    <>
      <section className="cover" aria-labelledby="cover-title">
        <BrandLogo alt="Noor Li Ummi logo" priority />
        <div className="cover-text">
          <h1 id="cover-title">Noor Li Ummi</h1>
          <p className="tagline">A light that never fades, a legacy that never ends</p>
          <p className="lead">A free Islamic digital platform dedicated to the memory of my beloved mother, offering access to the Quran, daily worship tools and beneficial knowledge.</p>
          <div className="actions" style={{ marginTop: 20 }}>
            <Link className="btn" href="/en/quran"><Icon name="quran" />Open the Quran</Link>
            <Link className="btn ghost" href="/en/prayer"><Icon name="prayer" />Prayer times</Link>
          </div>
        </div>
      </section>
      <div className="grid two section">
        <PrayerCard lang="en" />
        <div className="grid"><ContinueReading lang="en" /><TodayAdhkar lang="en" /></div>
      </div>
      <section className="section" aria-labelledby="sections-title">
        <h2 id="sections-title">Sections</h2>
        <Tiles items={[
          { href: '/en/quran', icon: 'quran', title: 'The Holy Quran', desc: 'Arabic text with the translation of the meanings.' },
          { href: '/en/adhkar', icon: 'adhkar', title: 'Adhkar', desc: 'Hisn al-Muslim with a counter.' },
          { href: '/en/names', icon: 'names', title: 'Names of Allah', desc: 'With the verses that mention them.' },
          { href: '/en/hifz', icon: 'hifz', title: 'Memorise', desc: 'Spaced review on your device.' },
          { href: '/en/adhan', icon: 'bell', title: 'Adhan', desc: 'Choose the adhan and alerts.' },
          { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'From OpenStreetMap.' },
          { href: '/tafsir', icon: 'tafsir', title: 'Tafsir (Arabic)', desc: 'Tafsir al-Jalalayn.', lang: 'ar' },
          { href: '/hadith', icon: 'hadith', title: 'Hadith (Arabic)', desc: 'Eleven collections with search.', lang: 'ar' },
        ]} />
      </section>
      <section className="section card dedication">
        <p className="eyebrow">Dedication</p>
        <p>To my beloved mother, who has left my sight but never my heart.</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link className="btn ghost" href="/en/dedication">Read the dedication</Link></div>
      </section>
    </>
  );
}
