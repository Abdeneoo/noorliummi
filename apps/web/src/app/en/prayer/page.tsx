import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import PrayerCard from '@/components/PrayerCard';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'Prayer & Adhan', openGraph: og('/en/prayer', 'en', 'Prayer & Adhan') };
export default function Prayer() {
  return (
    <Hub eyebrow="Prayer & Adhan" title="Prayer times and the adhan" intro="Times are calculated on your device from your location or city; your location is never sent to a server."
      items={[
        { href: '/en/times', icon: 'calendar', title: 'Monthly timetable & qibla', desc: 'The whole month, and a qibla compass.' },
        { href: '/en/adhan', icon: 'bell', title: 'Adhan settings', desc: 'Choose the adhan sound or use your own file, and turn on alerts.' },
        { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'The closest mosques from OpenStreetMap.' },
        { href: '/en/adhkar/15', icon: 'adhkar', title: 'Adhkar of the adhan', desc: 'What to say on hearing the adhan.' },
        { href: '/en/adhkar/25', icon: 'adhkar', title: 'After the prayer', desc: 'Adhkar after the salam.' },
      ]}>
      <PrayerCard lang="en" />
    </Hub>
  );
}
