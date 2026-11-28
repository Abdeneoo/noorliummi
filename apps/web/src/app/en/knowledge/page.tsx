import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import { Hub } from '@/components/Tiles';
export const metadata: Metadata = { title: 'Knowledge', openGraph: og('/en/knowledge', 'en', 'Knowledge') };
export default function Knowledge() {
  return (
    <Hub eyebrow="Knowledge" title="Beneficial knowledge" intro="Texts with a documented source and licence, shown as published."
      items={[
        { href: '/en/names', icon: 'names', title: 'The Names of Allah', desc: 'The names with the verses that mention them.' },
        { href: '/en/today', icon: 'quran', title: 'My day with Allah', desc: 'Your daily board: prayer, adhkar, wird and reminders.' },
        { href: '/en/playlists', icon: 'adhkar', title: 'Dua playlists', desc: '16 ready playlists and your own.' },
        { href: '/en/reciters', icon: 'hifz', title: 'Reciters and scholars', desc: 'A page for each reciter with sources.' },
        { href: '/en/ramadan', icon: 'heart', title: 'Ramadan', desc: 'Timetable, countdown, khatma plan and reminders.' },
        { href: '/en/patient', icon: 'heart', title: 'For the sick and the elderly', desc: 'Large buttons for Quran, healing duas and ruqyah.' },
        { href: '/en/travel', icon: 'bell', title: 'Traveller’s kit', desc: 'Times and qibla where you are, travel duas, mosques.' },
        { href: '/en/quran', icon: 'quran', title: 'Translation of the meanings', desc: 'Saheeh International via QuranEnc, with footnotes.' },
        { href: '/tafsir', icon: 'tafsir', title: 'Tafsir (Arabic)', desc: 'Tafsir al-Jalalayn for every ayah.', lang: 'ar' },
        { href: '/hadith', icon: 'hadith', title: 'Hadith (Arabic)', desc: 'The six books, the Muwatta, Musnad Ahmad and al-Darimi.', lang: 'ar' },
        { href: '/hadith/nawawi', icon: 'hadith', title: "an-Nawawi's Forty (Arabic)", desc: 'The forty hadith of Imam an-Nawawi.', lang: 'ar' },
        { href: '/mutashabihat', icon: 'similar', title: 'Similar verses (Arabic)', desc: 'Verses with similar wording, to help memorisation.', lang: 'ar' },
        { href: '/quran/1/words', icon: 'words', title: 'Words and roots (Arabic)', desc: 'Part of speech and root of each word (automatic analysis).', lang: 'ar' },
      ]}>
      <p className="note">Sections marked (Arabic) are in Arabic on purpose: they are Arabic texts shown as published, without machine translation.</p>
    </Hub>
  );
}
