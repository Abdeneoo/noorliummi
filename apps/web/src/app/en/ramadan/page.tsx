import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import RamadanPanel from '@/components/RamadanPanel';
export const metadata: Metadata = { title: 'Ramadan — timetable, countdown and duas', description: 'Ramadan timetable for your city, countdown to iftar and suhoor, a khatma plan, your own marks, reminders, and links to the rulings and duas.', alternates: { languages: { ar: '/ramadan' } }, openGraph: og('/en/ramadan', 'en', 'Ramadan — timetable, countdown and duas', 'Ramadan timetable for your city, countdown to iftar and suhoor, a khatma plan, your own marks, reminders, and links to the rulings and duas.') };
export default function RamadanEn() {
  return (
    <article style={{ maxWidth: 980, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">Seasons</p><h1>Ramadan</h1><p>The timetable, countdowns, khatma plan and your own marks — all on this device. The first day follows the Umm al-Qura calendar with your adjustment, or the date you set from your country’s announcement.</p></header>
      <RamadanPanel lang="en" />
      <section className="section"><h2>More (in Arabic)</h2><ul className="athar-dir">
        <li><Link href="/ramadan#ahkam"><strong>Fiqh of fasting</strong><small>al-Fiqh al-Muyassar with Bidayat al-Mujtahid</small></Link></li>
        <li><Link href="/ramadan#hadith"><strong>Hadiths on fasting and Laylat al-Qadr</strong><small>Bukhari and Ibn Majah, with references</small></Link></li>
        <li><Link href="/ramadan/majalis"><strong>Ramadan lessons</strong><small>A lesson for each day, khutbas and books (IslamHouse)</small></Link></li>
        <li><Link href="/en/playlists#ramadan"><strong>Ramadan duas</strong><small>Playlists, qunut and tahajjud</small></Link></li>
        <li><Link href="/live"><strong>Live from the two Holy Mosques</strong><small>Official broadcasts</small></Link></li></ul></section>
    </article>
  );
}
