import type { Metadata } from 'next';
import Link from 'next/link';
import MiqatMap from '@/components/MiqatMap';
import UmrahJourney, { type Dh, type Step } from '@/components/UmrahJourney';
import { loadAdhkar } from '@/lib/adhkar';

export const metadata: Metadata = { title: 'Umrah step by step', description: 'Your Umrah journey step by step, with the adhkar of each step, a lap counter for tawaf and sa\'i, and a map of the mawaqit.', alternates: { languages: { ar: '/umrah' } } };

const dh = async (ids: [number, string][]): Promise<Dh[]> => Promise.all(ids.map(async ([id, title]) => ({ title, items: (await loadAdhkar(id)).items.map((d) => ({ n: d.n, t: d.t, r: d.r, en: d.en, tl: d.tl })) })));

export default async function UmrahEn() {
  const steps: Step[] = [
    { id: 'safar', title: 'Travelling', hint: 'Mounting and travel supplications', dhikr: await dh([[96, 'On mounting a means of transport'], [97, 'The travel supplication']]) },
    { id: 'ihram', title: 'Ihram at the miqat', hint: 'The talbiyah', read: '#map', dhikr: await dh([[116, 'The talbiyah']]) },
    { id: 'masjid', title: 'Entering al-Masjid al-Haram', hint: 'Supplication on entering the mosque', dhikr: await dh([[13, 'On entering the mosque']]) },
    { id: 'tawaf', title: 'Tawaf', hint: 'Seven laps', laps: true, dhikr: await dh([[117, 'At the Black Stone'], [118, 'Between the Yemeni Corner and the Black Stone']]) },
    { id: 'rakatain', title: 'Two rak‘ahs after tawaf', hint: 'After completing tawaf', dhikr: [] },
    { id: 'sai', title: "Sa'i between Safa and Marwah", hint: 'Seven laps', laps: true, dhikr: await dh([[119, 'On Safa and Marwah']]) },
    { id: 'halq', title: 'Shaving or shortening the hair', hint: 'This completes the Umrah', dhikr: [] },
  ];
  const after = await dh([[14, 'On leaving the mosque'], [106, 'On returning from travel']]);
  return (
    <article className="um" lang="en">
      <header className="um-hero">
        <div className="um-hero-in">
          <p className="um-kicker"><Link href="/umrah" lang="ar">العربية</Link></p>
          <h1>Umrah, step by step</h1>
          <p className="um-lead">From travelling to completing your Umrah: the adhkar of each step and a lap counter for tawaf and sa&apos;i. Works offline once opened.</p>
          <ul className="um-facts"><li><b>7</b><span>laps of tawaf</span></li><li><b>2</b><span>rak‘ahs</span></li><li><b>7</b><span>laps of sa&apos;i</span></li></ul>
          <a className="btn light" href="#steps">Start your journey</a>
        </div>
      </header>
      <nav className="um-tabs" aria-label="Page sections"><a href="#steps">Steps</a><a href="#map">Mawaqit map</a><a href="#services">Services</a></nav>
      <UmrahJourney steps={steps} after={after} lang="en" />
      <section className="um-section" id="map">
        <div className="um-section-head"><h2>Map of the mawaqit</h2><p>Tap a miqat to see its distance and open it in maps.</p></div>
        <MiqatMap lang="en" />
      </section>
      <section className="um-section" id="services">
        <div className="um-section-head"><h2>Useful links</h2></div>
        <div className="um-grid">
          <a className="um-tile um-tile-main" href="https://www.nusuk.sa" target="_blank" rel="noopener"><strong>Nusuk</strong><span>Official Umrah permits and booking</span></a>
          <a className="um-tile" href="https://d1.islamhouse.com/data/en/ih_books/single/risala_en_hisnulmuslim.pdf" target="_blank" rel="noopener"><strong>Fortress of the Muslim</strong><span>Hisn al-Muslim in English (PDF)</span></a>
          <Link className="um-tile" href="/en/times"><strong>Prayer times</strong><span>For your city</span></Link>
          <Link className="um-tile" href="/en/travel"><strong>Travel kit</strong><span>Qibla, travel adhkar, mosques</span></Link>
          <Link className="um-tile" href="/umrah" lang="ar"><strong>العمرة بالعربية</strong><span lang="ar">مع صفة العمرة والمواقيت والمحظورات</span></Link>
        </div>
      </section>
    </article>
  );
}
