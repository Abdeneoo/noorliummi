import type { Metadata } from 'next';
import Link from 'next/link';
import { og } from '@/lib/og-page';
export const metadata: Metadata = { title: 'Duas and supplications', description: 'Duas from the Quran and Sunnah, Hisn al-Muslim in 59 languages, recitations and playlists.', openGraph: og('/en/duas', 'en', 'Duas and supplications') };
const T: [string, string, string][] = [
  ['/en/adhkar', 'Adhkar (Hisn al-Muslim)', 'Morning, evening and every situation, with a counter.'],
  ['/duas/hisn-languages', 'Hisn al-Muslim in 59 languages', 'The book as published by IslamHouse, to send to anyone.'],
  ['/en/reciters', 'Duas by your favourite reciter', 'Supplications, ruqyah and recitations by well-known reciters.'],
  ['/en/playlists', 'Ready playlists', 'Listen in order, in the background.'],
  ['/en/umrah', 'Umrah adhkar', 'Step by step, with a lap counter.'],
  ['/en/patient', 'For the sick', 'Large text and ruqyah for a patient.'],
];
export default function DuasEn() {
  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }} lang="en">
      <header className="page-head"><p className="eyebrow">Supplication</p><h1>Duas and supplications</h1><p>Texts are shown in Arabic as in their sources, with an English translation where the source provides one.</p></header>
      <ul className="tiles">{T.map(([h, t, d]) => <li key={h}><Link href={h}><span className="ico" /><strong>{t}</strong><small>{d}</small></Link></li>)}</ul>
      <p className="note" style={{ marginTop: 16 }}><Link href="/duas" lang="ar">الأدعية بالعربية — المكتبة كاملة</Link></p>
    </article>
  );
}
