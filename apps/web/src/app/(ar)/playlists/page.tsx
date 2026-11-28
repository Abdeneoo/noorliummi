import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { readyPlaylists } from '@/lib/playlists-ready';
import { DuaReciterBar } from '@/components/DuaAyahPlayer';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
import TvLibrary from '@/components/TvLibrary';
import MyPlaylists from '@/components/MyPlaylists';
import SaveOffline from '@/components/SaveOffline';
import DuaNav from '@/components/DuaNav';
import { TVC, TV_DUA_CATS } from '@/lib/people';
export const metadata: Metadata = { title: 'قوائم تشغيل الأدعية', description: 'قوائم جاهزة لأدعية القرآن والسنة والأنبياء والوالدين والمتوفين والكرب والشفاء والرزق ورمضان والقنوت، وقوائمك الخاصة.', openGraph: og('/playlists', 'ar', 'قوائم تشغيل الأدعية', 'قوائم جاهزة لأدعية القرآن والسنة والأنبياء والوالدين والمتوفين والكرب والشفاء والرزق ورمضان والقنوت، وقوائمك الخاصة.') };
export default async function PlaylistsPage() {
  const lists = await readyPlaylists();
  const cats = TVC.categories.filter((c) => TV_DUA_CATS.includes(c.id));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>قوائم تشغيل الأدعية</h1>
        <p>تشغيل متواصل يستمر وأنت تتنقل في الموقع، ومع إغلاق الشاشة حين يسمح المتصفح. آيات القرآن تُتلى كاملة بالقارئ الذي تختاره؛ تسجيلات TVQuran تُشغَّل واحدًا واحدًا في مشغّلهم الرسمي.</p></header>
      <DuaNav />
      <nav className="card" aria-label="القوائم"><ul className="chips">{lists.map((l) => <li key={l.id}><a href={`#${l.id}`}>{l.title}</a></li>)}<li><a href="#mine">قوائمي</a></li></ul></nav>
      <MyPlaylists />
      {lists.map((l) => (
        <section key={l.id} id={l.id} className="section"><h2>{l.title}</h2><p className="note">{l.note}</p>
          {l.ayat.length > 0 && <DuaReciterBar all={l.ayat} />}
          {l.tracks.length > 0 && <div className="row"><PlayTrack tracks={l.tracks.map((t) => ({ ...t, page: t.page ?? `/playlists#${l.id}` }))} label={`▶ شغّل ${l.tracks.length.toLocaleString('ar-EG')} تسجيلًا`} className="btn" /><AddToPlaylist tracks={l.tracks} name={l.title} /><SaveOffline srcs={l.tracks.map((t) => t.src)} /></div>}
          {l.tv.length > 0 && <details style={{ marginTop: 8 }}><summary>{l.tv.length.toLocaleString('ar-EG')} تسجيلًا من TVQuran</summary><TvLibrary rows={l.tv} cats={cats} /></details>}
        </section>
      ))}
    </article>
  );
}
