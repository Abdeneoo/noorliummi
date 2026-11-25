'use client';
import Link from 'next/link';
import { useState } from 'react';
import ShareImageButton from './ShareImageButton';
import FridayReminder from './FridayReminder';
import { recordActivity } from './Lantern';
/** Sharing tools under an athar page: story image, Friday calendar reminder, group khatma, «قرأتُ ما تيسّر». */
export default function AtharShare({ slug, name, dua }: { slug: string; name: string; dua: string }) {
  const [read, setRead] = useState(false);
  return (
    <section className="card athar-share">
      <h2 style={{ marginTop: 0 }}>شارك وذكّر</h2>
      <div className="row">
        <button type="button" className="btn" disabled={read} onClick={() => { setRead(true); void recordActivity(slug, 'read'); }}>{read ? 'تقبّل الله ✓' : 'قرأتُ ما تيسّر'}</button>
        <ShareImageButton className="btn ghost" story={{ text: dua || `ادعوا لـ${name}`, caption: `صفحة أثر · ${name}`, path: `/athar/${slug}` }} />
        <Link className="btn ghost" href={`/khatma?athar=${slug}`}>ابدأ ختمة جماعية</Link>
      </div>
      <FridayReminder path={`/athar/${slug}`} name={name} />
    </section>
  );
}
