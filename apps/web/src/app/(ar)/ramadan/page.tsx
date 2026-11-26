import type { Metadata } from 'next';
import Link from 'next/link';
import RamadanPanel from '@/components/RamadanPanel';
import PlayTrack from '@/components/PlayTrack';
import TvLibrary from '@/components/TvLibrary';
import { hadithRef } from '@/lib/hadith-ref';
import { readyPlaylists } from '@/lib/playlists-ready';
import { TVC, TV_DUA_CATS } from '@/lib/people';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'رمضان — الإمساكية والعد التنازلي والأحكام والأدعية', description: 'إمساكية رمضان حسب مدينتك، والعد التنازلي للإفطار والسحور، وخطة الختمة، وأحكام الصيام والاعتكاف وزكاة الفطر، وأدعية رمضان بأصوات القراء.' };
export const revalidate = 3600;

const H: [string, string, number, number][] = [
  ['من صام رمضان إيمانًا واحتسابًا', 'bukhari', 2, 38], ['من قام ليلة القدر', 'bukhari', 30, 1901], ['تحرّوا ليلة القدر في الوتر من العشر الأواخر', 'bukhari', 32, 2017],
  ['إذا دخل العشر', 'bukhari', 32, 2024], ['الاعتكاف في العشر الأواخر', 'bukhari', 33, 2025], ['السحور بركة', 'bukhari', 30, 1923],
  ['متى يفطر الصائم', 'bukhari', 30, 1954], ['تعجيل الفطر', 'bukhari', 30, 1957], ['من لم يدع قول الزور', 'bukhari', 30, 1903], ['زكاة الفطر', 'bukhari', 24, 1503],
  ['دعاء ليلة القدر: اللهم إنك عفو', 'ibnmajah', 34, 3850],
];
const BOOK: Record<string, string> = { bukhari: 'صحيح البخاري', ibnmajah: 'سنن ابن ماجه' };

export default async function RamadanPage() {
  const hs = await Promise.all(H.map(async ([t, b, s, n]) => { try { return { l: t, b, ...(await hadithRef(b, s, n)) }; } catch { return null; } }));
  const lists = await readyPlaylists();
  const ram = lists.find((l) => l.id === 'ramadan')!; const qunut = lists.find((l) => l.id === 'qunut')!; const tah = lists.find((l) => l.id === 'tahajjud')!;
  const iftar = await Promise.all([69, 74, 75, 76, 68].map(async (id) => ({ id, title: ADHKAR.find((a) => a.id === id)?.title ?? '', c: await loadAdhkar(id) })));
  const cats = TVC.categories.filter((c) => TV_DUA_CATS.includes(c.id));
  const F: [string, string][] = [['/fiqh/siyam/32', 'مقدمات الصيام: فضله وشروطه ونيته'], ['/fiqh/siyam/33', 'الأعذار المبيحة للفطر ومفطرات الصائم'], ['/fiqh/siyam/34', 'مستحبات الصيام ومكروهاته'], ['/fiqh/siyam/35', 'القضاء والكفارة والفدية والصيام المستحب'], ['/fiqh/siyam/36', 'الاعتكاف'], ['/fiqh/zakat/30', 'زكاة الفطر'], ['/fiqh/salah/15', 'صلاة التطوع: التراويح والوتر'], ['/fiqh/siyam', 'كتاب الصيام كاملًا وأقوال الفقهاء (بداية المجتهد)']];
  return (
    <article style={{ maxWidth: 980, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">المواسم</p><h1>رمضان</h1>
        <p>الإمساكية والعد التنازلي وخطة الختمة ومتابعتك، ثم الأحكام والأحاديث والأدعية — كلها في صفحة واحدة.</p></header>
      <nav className="card no-print" aria-label="أقسام الصفحة"><ul className="chips"><li><a href="#imsakiya">الإمساكية</a></li><li><a href="#khatma">الختمة</a></li><li><a href="#track">متابعتي</a></li><li><a href="#ahkam">الأحكام</a></li><li><a href="#hadith">أحاديث رمضان</a></li><li><a href="#duas">الأدعية</a></li><li><a href="#audio">أدعية صوتية</a></li><li><Link href="/live">بث الحرمين</Link></li><li><Link href="/ramadan/majalis">مجالس رمضان</Link></li><li><Link href="/ramadan/30">30 مجلسًا</Link></li></ul></nav>
      <RamadanPanel />
      <section className="section no-print" id="ahkam"><h2>فقه الصيام</h2>
        <p className="note">من «الفقه الميسر» (مجمع الملك فهد)، ومعه أقوال الفقهاء وأسباب اختلافهم من «بداية المجتهد» لابن رشد. لا ترجيح من الموقع.</p>
        <ul className="athar-dir">{F.map(([h, t]) => <li key={h}><Link href={h}><strong>{t}</strong></Link></li>)}</ul></section>
      <section className="section" id="hadith"><h2>أحاديث في الصيام وليلة القدر</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>{hs.filter((x) => !!x).map((x) => <li key={`${x.b}${x.n}`} className="card"><strong>{x.l}</strong><p lang="ar" style={{ lineHeight: 2.1 }}>{x.t}</p><p className="note" style={{ margin: 0 }}>{BOOK[x.b]} ({x.n.toLocaleString('ar-EG')}) — <Link href={x.href}>في سياقه</Link></p></li>)}</ul></section>
      <section className="section" id="duas"><h2>أدعية الصيام والإفطار</h2>
        <p className="note">من «حصن المسلم» بصوت محمد جمعة (OpenDua، CC BY 4.0).</p>
        {iftar.map((g) => <div key={g.id} className="card" style={{ marginBottom: 8 }}><strong>{g.title}</strong>
          {g.c.items.map((x) => <p key={x.n} lang="ar" style={{ lineHeight: 2.1 }}>{x.t} <small className="note">({x.r})</small></p>)}
          <PlayTrack tracks={g.c.items.filter((x) => x.a).map((x) => ({ id: `h${g.id}-${x.n}`, src: `/audio/adhkar/${x.a}`, title: g.title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0', text: x.t, page: '/ramadan#duas' }))} /></div>)}
        <p><Link href="/adhkar/27">أذكار الصباح</Link> · <Link href="/adhkar/28">أذكار المساء</Link> · <Link href="/adhkar/33">دعاء قنوت الوتر</Link></p></section>
      <section className="section no-print" id="audio"><h2>أدعية رمضان والتهجد والقنوت بأصوات كبار القراء</h2>
        <p className="note">من TVQuran بمشغّله الرسمي (يبقى أسفل الشاشة وأنت تتنقل)، ومن قوائم التشغيل في الموقع.</p>
        <div className="row"><Link className="btn" href="/playlists#ramadan">قائمة أدعية رمضان</Link><Link className="btn ghost" href="/playlists#qunut">أدعية القنوت</Link><Link className="btn ghost" href="/playlists#tahajjud">التهجد وختم القرآن</Link></div>
        <TvLibrary rows={[...ram.tv, ...qunut.tv, ...tah.tv].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i)} cats={cats} /></section>
    </article>
  );
}
