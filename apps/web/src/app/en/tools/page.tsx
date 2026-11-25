import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'Tools' };
export default function Tools() {
  return (
    <Hub eyebrow="Tools" title="Everyday tools" intro="Every tool runs on your device, and your data stays with you."
      items={[
        { href: '/en/hifz', icon: 'hifz', title: 'Memorise & review', desc: 'Spaced review of the ayat you memorise.' },
        { href: '/en/times', icon: 'compass', title: 'Qibla', desc: 'A qibla compass from your location.' },
        { href: '/en/adhan', icon: 'bell', title: 'Adhan & alerts', desc: 'Choose the adhan sound and prayer alerts.' },
        { href: '/en/mosques', icon: 'mosque', title: 'Nearby mosques', desc: 'Find the closest mosque.' },
        { href: '/en/sources', icon: 'hadith', title: 'Sources & licences', desc: 'Where every text and recording comes from.' },
      ]} />
  );
}
