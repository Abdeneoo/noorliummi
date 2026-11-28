import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import HomeCover from '@/components/HomeCover';
import SectionsGrid from '@/components/SectionsGrid';
import AppsPanel from '@/components/AppsPanel';
import Reveal from '@/components/Reveal';
import Tasbeeh from '@/components/Tasbeeh';
import { ContinueReading, TodayAdhkar } from '@/components/HomeWidgets';
export const metadata: Metadata = { title: { absolute: 'Noor Li Ummi — Quran, prayer times and adhkar' }, openGraph: og('/en', 'en', undefined) };
export default function Home() {
  return (
    <>
      <HomeCover lang="en" />
      <div className="lift reveal"><PrayerCard lang="en" /></div>
      <div className="duo section reveal"><ContinueReading lang="en" /><TodayAdhkar lang="en" /></div>
      <div className="section reveal tas-home"><Tasbeeh lang="en" /></div>
      <section className="section reveal" aria-labelledby="sections-title">
        <div className="section-head"><h2 id="sections-title">Sections</h2><Link href="/en/tools">All tools</Link></div>
        <SectionsGrid lang="en" />
      </section>
      <div className="section"><AppsPanel lang="en" /></div>
      <Reveal />
    </>
  );
}
