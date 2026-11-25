import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Sources and licences' };
const ROWS = [
  ['Quran text (Uthmani)', 'Tanzil project', 'https://tanzil.net', 'CC BY 3.0', 'Shown verbatim; checked against the source on every build.'],
  ['English translation of the meanings', 'Noor International Center (Saheeh International), via QuranEnc.com', 'https://quranenc.com', 'QuranEnc terms', 'Shown complete with footnotes, unmodified, with publisher, source and version.'],
  ['Adhkar (Hisn al-Muslim, Arabic)', 'asellam/HisnElMuslim; book by Sa’id al-Qahtani', 'https://github.com/asellam/HisnElMuslim', 'MIT (data packaging)', 'Shown verbatim with count and reference.'],
  ['Adhkar English, transliteration and audio', 'OpenDua (Ihsan Labs, Human Development Fund) — Recitation by Muhammad Jumah for OpenDua', 'https://opendua.hdfund.org', 'CC BY 4.0', 'Attached only where the Arabic text matches exactly. No endorsement by OpenDua is implied.'],
  ['Prayer times and qibla', 'Adhan JS (Batoul Apps)', 'https://github.com/batoulapps/adhan-js', 'MIT', 'Calculated on your device.'],
  ['Recitations', 'Islamic Network (alquran.cloud)', 'https://alquran.cloud', 'Rights remain with their owners', 'Streamed from the source; not hosted or copied.'],
];
export default function Sources() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>Sources and licences</h1>
      <p>What the English interface uses today. No religious text on this site is written by us or by AI. The full list, including hadith and other sections, is on the <Link href="/sources" lang="ar">Arabic sources page</Link>.</p>
      {ROWS.map(([what, src, url, lic, how]) => (
        <section className="card" key={what}><h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>{what}</h2><p className="meta"><span>Source: <a href={url} rel="noopener">{src}</a></span><span>Licence: {lic}</span></p><p>{how}</p></section>
      ))}
    </article>
  );
}
