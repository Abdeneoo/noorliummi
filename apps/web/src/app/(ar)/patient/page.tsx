import type { Metadata } from 'next';
import Link from 'next/link';
import PlayTrack from '@/components/PlayTrack';
import SaveOffline from '@/components/SaveOffline';
import EasyMode from '@/components/EasyMode';
import { readyPlaylists } from '@/lib/playlists-ready';
import { RECITERS, surahUrl } from '@/lib/reciters';
import { IHA } from '@/lib/duas';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
export const metadata: Metadata = { title: 'وضع المريض وكبار السن', description: 'شاشة واحدة بأزرار كبيرة: القرآن، أدعية الشفاء، الرقية الشرعية، أذكار المريض، وأحكام طهارته وصلاته وصيامه.' };
export default async function Patient() {
  const r = RECITERS[0]; // Alafasy, full surahs
  const S: [number, string][] = [[1, 'الفاتحة'], [36, 'يس'], [67, 'الملك'], [112, 'الإخلاص'], [113, 'الفلق'], [114, 'الناس']];
  const quran = S.map(([n, name]) => ({ id: `q-${r.id}-${n}`, src: surahUrl(r, n), title: `سورة ${name}`, by: r.name, source: 'Islamic Network', page: '/patient' }));
  const shifa = (await readyPlaylists()).find((l) => l.id === 'shifa')!;
  const ruqyaIh = IHA.filter((x) => /رقية/.test(x.title) && x.attachments.some((a) => a.type === 'MP3')).slice(0, 8).map((it) => { const reader = it.by.filter((b) => b.kind === 'author').map((b) => b.title).join('، '); const a = it.attachments.find((y) => y.type === 'MP3')!; return { id: `ihp${it.id}`, src: a.url, title: it.title, by: reader, source: `IslamHouse: ${it.title}`, license: 'سياسة IslamHouse المنشورة', page: '/patient' }; });
  const adhkar = await Promise.all([50, 125, 52, 36, 35].map(async (id) => ({ id, title: ADHKAR.find((a) => a.id === id)?.title ?? '', c: await loadAdhkar(id) })));
  return (
    <article className="patient" style={{ maxWidth: 820, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header className="page-head"><h1>وضع المريض وكبار السن</h1>
        <p>كل ما يحتاجه المريض في شاشة واحدة بأزرار كبيرة. الاستماع يستمر في الخلفية، ومؤقت النوم من المشغّل أسفل الشاشة.</p>
        <p className="note"><strong>تنبيه:</strong> هذه الصفحة للذكر والدعاء والقرآن، وليست تشخيصًا ولا علاجًا طبيًا ولا بديلًا عن الطبيب.</p>
        <EasyMode /></header>
      <section className="card"><h2>القرآن الكريم</h2>
        <div className="big-grid"><PlayTrack tracks={quran} label="▶ استمع: الفاتحة ويس والملك والمعوذات" className="btn big-btn" /><SaveOffline srcs={quran.map((t) => t.src)} /></div>
        <p className="note">بصوت {r.name}. <Link href="/listen">وضع الاستماع بأزرار كبيرة</Link> · <Link href="/quran">المصحف</Link></p></section>
      <section className="card"><h2>أدعية الشفاء وأذكار المريض</h2>
        <div className="big-grid"><PlayTrack tracks={shifa.tracks} label="▶ أدعية الشفاء (حصن المسلم)" className="btn big-btn" /><SaveOffline srcs={shifa.tracks.map((t) => t.src)} /></div>
        {adhkar.map((g) => <details key={g.id}><summary style={{ fontSize: '1.15rem' }}>{g.title}</summary>{g.c.items.map((x) => <p key={x.n} lang="ar" style={{ lineHeight: 2.2, fontSize: '1.2rem' }}>{x.t} <small className="note">({x.r})</small></p>)}</details>)}</section>
      <section className="card"><h2>الرقية الشرعية</h2>
        <div className="big-grid">{ruqyaIh.map((t) => <PlayTrack key={t.id} tracks={[t]} label={`▶ ${t.by}`} className="btn big-btn" />)}</div>
        <div className="row"><SaveOffline srcs={ruqyaIh.map((t) => t.src)} /><Link className="btn ghost" href="/ruqyah">نصوص الرقية الموثقة</Link></div></section>
      <section className="card"><h2>أحكام المريض</h2>
        <ul className="athar-dir">{[['/fiqh/taharah/8', 'التيمم لمن لا يستطيع استعمال الماء'], ['/fiqh/taharah/6', 'المسح على الجبيرة'], ['/fiqh/salah/19', 'صلاة أهل الأعذار (المريض والمسافر)'], ['/fiqh/siyam/33', 'الأعذار المبيحة للفطر'], ['/fiqh/siyam/35', 'القضاء والفدية']].map(([h, t]) => <li key={h}><Link href={h}><strong>{t}</strong></Link></li>)}</ul>
        <p className="note">من «الفقه الميسر» مع أقوال الفقهاء في «بداية المجتهد». للحالات الخاصة اسأل أهل العلم.</p></section>
      <section className="card"><h2>المسبحة</h2><Link className="btn big-btn" href="/tasbeeh">افتح المسبحة بزر كبير</Link></section>
    </article>
  );
}
