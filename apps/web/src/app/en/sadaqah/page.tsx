import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'Sadaqah Jariyah', openGraph: og('/en/sadaqah', 'en', 'Sadaqah Jariyah') };
export default function Sadaqah() {
  return (
    <Hub eyebrow="Sadaqah Jariyah" title="A legacy that never ends" intro="This project is an ongoing charity, and you can build a page of remembrance for someone you love."
      items={[
        { href: '/en/dedication', icon: 'heart', title: 'Dedication', desc: 'To my beloved mother.' },
        { href: '/en/athar', icon: 'sadaqah', title: 'Athar pages', desc: 'The directory, and a shareable page of surahs, adhkar and a dua for someone you love.' },
        { href: '/en/adhkar/56', icon: 'adhkar', title: 'Dua for the deceased', desc: 'From Hisn al-Muslim, with translation.' },
        { href: '/en/quran/36', icon: 'quran', title: 'Surah Ya-Sin', desc: 'Read and listen.' },
        { href: '/en/tasbeeh', icon: 'adhkar', title: 'Tasbeeh counter', desc: 'Count with a tap.' },
      ]}>
      <section className="card dedication"><p>To my beloved mother, Amal Magdy Mounir, who has left my sight but never my heart. Please remember her in your prayers.</p><Link href="/en/dedication">Read the dedication</Link></section>
    </Hub>
  );
}
