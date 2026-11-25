import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy and terms' };
const ISSUES = 'https://github.com/Abdeneoo/noorliummi/issues';

export default function Privacy() {
  return (
    <article style={{ maxWidth: 760, margin: '24px auto', lineHeight: 1.9 }}>
      <h1>Privacy and terms of use</h1>
      <p className="meta"><span>Last updated: 25 November 2026</span></p>
      <h2>In short</h2>
      <ul>
        <li>No accounts, no ads, no tracking or visitor analytics.</li>
        <li>Your location, prayer settings and memorisation progress stay on your device and are not sent to us. The one exception is the nearby-mosque search when you ask for it (see “Third parties”).</li>
        <li>We sell nothing and share no data with anyone.</li>
      </ul>
      <h2>Stored on your device only</h2>
      <p>Your browser keeps your settings in local storage: your city or your location coordinates (if you allowed it), calculation method, adhan settings, theme, memorisation progress, dhikr counters, and the edit codes of athar pages you created. Clearing this site&apos;s data in your browser removes all of it.</p>
      <p>Location is requested once through your browser&apos;s permission prompt and is used to calculate prayer times and the qibla on your device. It is never sent to any server.</p>
      <h2>Stored on our server</h2>
      <ul>
        <li><strong>Athar pages:</strong> the name, dedication and prayer you write, the surahs and adhkar you choose, the creation date, and a hash of the edit code (not the code itself). We do not store your IP address or anything about you. Pages are not listed anywhere and are hidden from search engines. Deleting a page erases its text immediately.</li>
        <li><strong>Reports:</strong> only the reason you give and the date.</li>
        <li><strong>Backups:</strong> the database is backed up daily on our server; backups are kept for 14 days, plus one weekly copy for up to 8 weeks. Text of a deleted page may therefore remain in a backup for up to 8 weeks.</li>
        <li><strong>Abuse limits:</strong> request counts per address are kept briefly in server memory to prevent flooding and are never written to disk.</li>
      </ul>
      <h2>Third parties</h2>
      <p>Recitations are streamed directly from Islamic Network&apos;s servers, which receive your IP address when you play them, as with any website. Fonts, the adhan audio and the adhkar recordings are hosted on our own server.</p>
      <p>Only on the <a href="/en/mosques">nearby mosques</a> page, and only when you tap search, your location rounded to about 1 km is sent to the public Overpass service to search OpenStreetMap. It is not sent to or stored on our server.</p>
      <h2>Content and responsibility</h2>
      <ul>
        <li>Religious texts are reproduced from their sources unchanged; every source and licence is listed on the <a href="/en/sources">sources page</a>. Content not yet reviewed is marked as a trial version.</li>
        <li>We do not write religious texts or fatwas, and do not generate them with AI.</li>
        <li>Prayer times are astronomical calculations and may differ by a few minutes from your local official timetable; follow your local timetable where they differ.</li>
        <li>Athar pages are written by their creators. Links and offensive content are not allowed; we review reports and remove violations.</li>
        <li>The site&apos;s code is open source under AGPL-3.0; content is under its sources&apos; licences. The name “Noor Li Ummi”, its logo and the dedication text are not covered by any licence.</li>
      </ul>
      <h2>Contact</h2>
      <p>For any note on a text, a source or privacy: <a href={ISSUES} rel="noopener">our public issue tracker on GitHub</a>. Please do not post personal information there.</p>
    </article>
  );
}
