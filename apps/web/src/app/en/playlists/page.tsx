import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import { readyPlaylists } from '@/lib/playlists-ready';
import { DuaReciterBar } from '@/components/DuaAyahPlayer';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
import TvLibrary from '@/components/TvLibrary';
import MyPlaylists from '@/components/MyPlaylists';
import SaveOffline from '@/components/SaveOffline';
import { TVC, TV_DUA_CATS } from '@/lib/people';
export const metadata: Metadata = { title: 'Dua playlists', description: 'Ready playlists of Quranic and prophetic duas, duas for parents and the deceased, for distress, healing, provision, Ramadan and qunut — and your own playlists.', alternates: { languages: { ar: '/playlists' } }, openGraph: og('/en/playlists', 'en', 'Dua playlists', 'Ready playlists of Quranic and prophetic duas, duas for parents and the deceased, for distress, healing, provision, Ramadan and qunut — and your own playlists.') };
const EN: Record<string, [string, string]> = {
  quran: ['Duas from the Quran', 'Every ayah of supplication in al-Qahtani’s collection, each recited in full.'], sunnah: ['Prophetic duas', 'From Hisn al-Muslim, recited by Muhammad Jumah, in the wording of the hadith.'],
  prophets: ['Duas of the prophets', 'What the prophets (peace be upon them) prayed in the Quran.'], parents: ['Duas for parents', 'The ayat of dua for one’s parents.'],
  deceased: ['Duas for the deceased', 'From Hisn al-Muslim: the funeral prayer, burial and visiting graves.'], mercy: ['Mercy and forgiveness', 'Ayat asking for forgiveness and mercy, then istighfar from the Sunnah.'],
  karb: ['Distress and grief', 'Duas for worry, grief and hardship.'], shifa: ['Healing', 'Duas for the sick and for pain, with ruqyah.'], rizq: ['Provision', 'Ayat asking for provision and the dua for debt.'],
  ramadan: ['Ramadan', 'Seeing the new moon, breaking the fast, and Ramadan nights in the two Holy Mosques.'], qunut: ['Qunut', 'Qunut al-witr from the Sunnah, then qunut duas of the imams.'],
  tahajjud: ['Tahajjud and khatm', 'Khatm al-Quran and tahajjud duas from TVQuran.'], haramain: ['The two Holy Mosques', 'Recordings from al-Masjid al-Haram and al-Masjid an-Nabawi.'],
  jawami: ['Comprehensive Quranic duas', 'The “Rabbana” duas of the Quran.'], sleep: ['Before sleep', 'Adhkar for sleep and waking at night.'], voices: ['Famous voices', 'Hisn al-Muslim by al-Durayhim and al-Shuwaihi, adhkar by Alafasy (IslamHouse), and TVQuran duas.'],
};
export default async function PlaylistsEn() {
  const lists = await readyPlaylists(); const cats = TVC.categories.filter((c) => TV_DUA_CATS.includes(c.id));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><h1>Dua playlists</h1><p>Continuous play that carries on while you browse, and with the screen off where the browser allows. Quranic ayat are recited in full by the reciter you choose; TVQuran recordings play one at a time in its official player. Duas are in Arabic.</p></header>
      <nav className="card" aria-label="Playlists"><ul className="chips">{lists.map((l) => <li key={l.id}><a href={`#${l.id}`}>{EN[l.id]?.[0] ?? l.title}</a></li>)}<li><a href="#mine">My playlists</a></li></ul></nav>
      <MyPlaylists lang="en" />
      {lists.map((l) => (
        <section key={l.id} id={l.id} className="section"><h2>{EN[l.id]?.[0] ?? l.title}</h2><p className="note">{EN[l.id]?.[1]}</p>
          {l.ayat.length > 0 && <DuaReciterBar all={l.ayat} lang="en" />}
          {l.tracks.length > 0 && <div className="row"><PlayTrack tracks={l.tracks.map((t) => ({ ...t, page: `/en/playlists#${l.id}` }))} label={`▶ Play ${l.tracks.length} recordings`} className="btn" lang="en" /><AddToPlaylist tracks={l.tracks} name={EN[l.id]?.[0] ?? l.title} lang="en" /><SaveOffline srcs={l.tracks.map((t) => t.src)} lang="en" /></div>}
          {l.tv.length > 0 && <details style={{ marginTop: 8 }}><summary>{l.tv.length} recordings from TVQuran</summary><TvLibrary rows={l.tv} cats={cats} lang="en" /></details>}
        </section>
      ))}
    </article>
  );
}
