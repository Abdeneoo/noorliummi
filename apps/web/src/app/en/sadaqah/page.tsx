import type { Metadata } from 'next';
import Link from 'next/link';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'Sadaqah Jariyah' };
export default function Sadaqah() {
  return (
    <Hub eyebrow="Sadaqah Jariyah" title="A legacy that never ends" intro="This project is an ongoing charity, and you can build a page of remembrance for someone you love."
      items={[
        { href: '/en/dedication', icon: 'heart', title: 'Dedication', desc: 'To my beloved mother.' },
        { href: '/athar', icon: 'sadaqah', title: 'Athar page (Arabic)', desc: 'A shareable page of surahs, adhkar and a dua for someone you love.', lang: 'ar' },
      ]}>
      <section className="card dedication"><p>To my beloved mother, who has left my sight but never my heart.</p><Link href="/en/dedication">Read the dedication</Link></section>
    </Hub>
  );
}
