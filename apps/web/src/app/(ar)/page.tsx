import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import { FeaturedSections } from '@/components/SectionsGrid';
import AppsPanel from '@/components/AppsPanel';
import Reveal from '@/components/Reveal';
import HomeSections from '@/components/HomeSections';
import Tasbeeh from '@/components/Tasbeeh';
import SeasonCard from '@/components/SeasonCard';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';

export const metadata: Metadata = { openGraph: og('/', 'ar') };
export const revalidate = 3600;
export default async function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'نور لأمي', alternateName: 'Noor Li Ummi', inLanguage: ['ar', 'en'], url: (process.env.SITE_URL || 'https://staging.noorliummi.io'), potentialAction: { '@type': 'SearchAction', target: `${process.env.SITE_URL || 'https://staging.noorliummi.io'}/search?q={q}`, 'query-input': 'required name=q' } }) }} />
      <HomeCover />
      <div className="lift reveal"><PrayerCard /></div>
      <SeasonCard />

      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">الأقسام</h2><Link href="/sections">كل الأقسام</Link></div>
        <FeaturedSections pick={['/quran', '/prayer', '/adhkar', '/duas', '/umrah', '/ramadan', '/ghusl', '/ruqyah', '/reciters', '/tafsir', '/fiqh', '/family', '/athar', '/hajj', '/live']} all={{ href: '/sections', title: 'كل الأقسام' }} />
      </section>

      <div className="duo section reveal">
        <ContinueReading />
        <TodayAdhkar />
      </div>
      <div className="section reveal tas-home"><Tasbeeh /></div>

      <div className="section"><AppsPanel /></div>

      <HomeSections />

      <Reveal />
    </>
  );
}
