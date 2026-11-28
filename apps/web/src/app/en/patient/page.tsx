import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import EasyMode from '@/components/EasyMode';
import { readyPlaylists } from '@/lib/playlists-ready';
import { RECITERS, surahUrl } from '@/lib/reciters';
import { IHA } from '@/lib/duas';
export const metadata: Metadata = { title: 'For the sick and the elderly', description: 'One screen with large buttons: Quran, duas for healing, ruqyah, and the rulings of purification, prayer and fasting for the sick.', alternates: { languages: { ar: '/patient' } }, openGraph: og('/en/patient', 'en', 'For the sick and the elderly', 'One screen with large buttons: Quran, duas for healing, ruqyah, and the rulings of purification, prayer and fasting for the sick.') };
export default async function PatientEn() {
  const r = RECITERS[0]; const S: [number, string][] = [[1, 'al-Fatiha'], [36, 'Ya-Sin'], [67, 'al-Mulk'], [112, 'al-Ikhlas'], [113, 'al-Falaq'], [114, 'an-Nas']];
  const quran = S.map(([n, name]) => ({ id: `q-${r.id}-${n}`, src: surahUrl(r, n), title: `Surah ${name}`, by: r.en, source: 'Islamic Network', page: '/en/patient' }));
  const shifa = (await readyPlaylists()).find((l) => l.id === 'shifa')!;
  const ruqya = IHA.filter((x) => /رقية/.test(x.title) && x.attachments.some((a) => a.type === 'MP3')).slice(0, 8).map((it) => ({ id: `ihp${it.id}`, src: it.attachments.find((y) => y.type === 'MP3')!.url, title: it.title, by: it.by.filter((b) => b.kind === 'author').map((b) => b.title).join('، '), source: `IslamHouse: ${it.title}`, page: '/en/patient' }));
  return (
    <article style={{ maxWidth: 820, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>For the sick and the elderly</h1><p>What a sick person needs on one screen with large buttons. Listening continues in the background; the sleep timer is in the player.</p><p className="note"><strong>Note:</strong> this page is for Quran, dhikr and dua. It is not a diagnosis or treatment and does not replace a doctor.</p><EasyMode lang="en" /></header>
      <section className="card"><h2>The Quran</h2><div className="big-grid"><PlayTrack tracks={quran} label="▶ al-Fatiha, Ya-Sin, al-Mulk and the last three surahs" className="btn big-btn" lang="en" /><SaveOffline srcs={quran.map((t) => t.src)} lang="en" /></div><p className="note">Recited by {r.en}.</p></section>
      <section className="card"><h2>Duas for healing</h2><div className="big-grid"><PlayTrack tracks={shifa.tracks} label="▶ Duas for healing (Hisn al-Muslim)" className="btn big-btn" lang="en" /><SaveOffline srcs={shifa.tracks.map((t) => t.src)} lang="en" /></div></section>
      <section className="card"><h2>Ruqyah</h2><div className="big-grid">{ruqya.map((t) => <PlayTrack key={t.id} tracks={[t]} label={`▶ ${t.by}`} className="btn big-btn" lang="en" />)}</div><p className="note">Quran recitations: streamed only.</p></section>
      <section className="card"><h2>Rulings for the sick (in Arabic)</h2><ul className="athar-dir">{[['/fiqh/taharah/8', 'Tayammum'], ['/fiqh/taharah/6', 'Wiping over a splint'], ['/fiqh/salah/19', 'Prayer of those with excuses'], ['/fiqh/siyam/33', 'Excuses for not fasting'], ['/fiqh/siyam/35', 'Making up fasts and fidya']].map(([h, t]) => <li key={h}><Link href={h}><strong>{t}</strong></Link></li>)}</ul></section>
      <section className="card"><h2>Tasbeeh</h2><Link className="btn big-btn" href="/en/tasbeeh">Open the tasbeeh counter</Link></section>
    </article>
  );
}
