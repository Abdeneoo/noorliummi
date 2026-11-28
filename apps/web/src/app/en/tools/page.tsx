import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import { Hub } from '@/components/Tiles';
import MyData from '@/components/MyData';
import OfflineKit from '@/components/OfflineKit';
export const metadata: Metadata = { title: 'Tools', openGraph: og('/en/tools', 'en', 'Tools') };
export default function Tools() {
  return (
    <Hub eyebrow="Tools" title="Everyday tools" intro="Every tool runs on your device, and your data stays with you."
      items={[
        { href: '/en/tasbeeh', icon: 'adhkar', title: 'Tasbeeh counter', desc: 'Count your dhikr with a tap, target 33, 70 or 100; open count for salawat.' },
        { href: '/en/hifz', icon: 'hifz', title: 'Memorise & review', desc: 'Spaced review of the ayat you memorise.' },
        { href: '/en/times', icon: 'compass', title: 'Qibla', desc: 'A qibla compass from your location.' },
        { href: '/en/adhan', icon: 'bell', title: 'Adhan & alerts', desc: 'Choose the adhan sound and prayer alerts.' },
        { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'Find the closest mosque.' },
        { href: '/en/sources', icon: 'hadith', title: 'Sources & licences', desc: 'Where every text and recording comes from.' },
      ]}>
      <div className="section"><OfflineKit lang="en" /></div><div className="section"><MyData lang="en" /></div>
    </Hub>
  );
}
