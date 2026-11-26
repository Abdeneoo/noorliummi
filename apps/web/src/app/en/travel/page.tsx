import type { Metadata } from 'next';
import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';
import TravelTools from '@/components/TravelTools';
import MosqueFinder from '@/components/MosqueFinder';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'Traveller’s kit', description: 'Prayer times and qibla where you are, travel duas, rulings for travellers, nearby mosques and halal places, and an offline pack.', alternates: { languages: { ar: '/travel' } } };
export default async function TravelEn() {
  const ids = [96, 97, 103, 98, 105, 101, 102, 104, 100, 106, 10, 11];
  const g = await Promise.all(ids.map(async (id) => ({ id, title: ADHKAR.find((a) => a.id === id)?.title ?? '', c: await loadAdhkar(id) })));
  const tracks = g.flatMap((x) => x.c.items.filter((i) => i.a).map((i) => ({ id: `h${x.id}-${i.n}`, src: `/audio/adhkar/${i.a}`, title: x.title, by: 'Muhammad Jumah (OpenDua)', license: 'CC BY 4.0 — Recitation by Muhammad Jumah for OpenDua', text: i.t, page: '/en/travel' })));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>Traveller’s kit</h1><p>Everything a traveller needs on one page. In a new country tap “my location” on the prayer card so the times follow where you are and its time zone.</p></header>
      <PrayerCard lang="en" />
      <TravelTools lang="en" />
      <section className="card"><h2>Travel duas</h2><p className="note">From Hisn al-Muslim, recited by Muhammad Jumah (OpenDua, CC BY 4.0). The text is in Arabic.</p>
        <div className="row"><PlayTrack tracks={tracks} label={`▶ Listen to all (${tracks.length})`} className="btn" lang="en" /><SaveOffline srcs={tracks.map((t) => t.src)} lang="en" /></div>
        {g.map((x) => <details key={x.id}><summary lang="ar">{x.title}</summary>{x.c.items.map((i) => <p key={i.n} lang="ar" dir="rtl" style={{ lineHeight: 2.1 }}>{i.t}</p>)}</details>)}</section>
      <section className="card"><h2>Rulings for travellers (in Arabic)</h2><ul className="athar-dir">{[['/fiqh/salah/19', 'Shortening and joining prayers'], ['/fiqh/siyam/33', 'Not fasting while travelling'], ['/fiqh/taharah/8', 'Tayammum'], ['/fiqh/taharah/6', 'Wiping over socks']].map(([h, t]) => <li key={h}><Link href={h}><strong>{t}</strong></Link></li>)}</ul><p className="note">From al-Fiqh al-Muyassar, with the views of the schools from Bidayat al-Mujtahid — no preference given by the site.</p></section>
      <section className="card"><h2>Nearby mosques</h2><MosqueFinder lang="en" /><h2>Nearby halal places</h2><MosqueFinder lang="en" kind="halal" /><p className="note">Volunteer OpenStreetMap data (ODbL), not a halal certificate.</p></section>
    </article>
  );
}
