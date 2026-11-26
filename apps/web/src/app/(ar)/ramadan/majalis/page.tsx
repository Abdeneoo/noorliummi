import type { Metadata } from 'next';
import Link from 'next/link';
import ram from '@/generated/duas/ih-ramadan.json';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
import SaveOffline from '@/components/SaveOffline';
import TodayMajlis from '@/components/TodayMajlis';
export const metadata: Metadata = { title: 'مجالس شهر رمضان والدروس الرمضانية', description: 'مجلس لكل يوم من رمضان، ودروس الصيام وخطب الحرمين وكتب المجالس، من IslamHouse مع اسم الشيخ والمصدر.' };
type It = { id: number; type: string; title: string; url: string; by: { id: number; title: string; kind: string }[]; attachments: { type: string; size: string; url: string; desc: string | null }[]; description: string };
const R = (ram as { fetched: string; items: It[] }).items;
const author = (x: It) => x.by.filter((b) => b.kind === 'author').map((b) => b.title).join('، ') || x.by.map((b) => b.title).join('، ');
const tracks = (x: It) => x.attachments.filter((a) => a.type === 'MP3').map((a, k) => ({ id: `ihr${x.id}-${k}`, src: a.url, title: a.desc || x.title, by: author(x), source: `IslamHouse: ${x.title}`, license: 'سياسة IslamHouse المنشورة', page: '/ramadan/majalis' }));
const HARAMAIN = /السديس|الشريم|المعيقلي|البعيجان|القاسم|خياط|البدير|آل الشيخ|الحذيفي|الثبيتي|الجهني|بليلة|الدوسري|الخليفي|الغامدي|العكاري/;

export default function Majalis() {
  const series = R.filter((x) => /^دروس من رمضان \[ \d+ \]/.test(x.title)).map((x) => ({ n: Number(x.title.match(/\[ (\d+) \]/)![1]), x })).sort((a, b) => a.n - b.n);
  const audios = R.filter((x) => x.type === 'audios' && !series.some((s) => s.x.id === x.id));
  const khutab = audios.filter((x) => HARAMAIN.test(author(x)) && tracks(x).length <= 2);
  const sharh = audios.filter((x) => !khutab.includes(x));
  const books = R.filter((x) => x.type === 'books' && x.attachments.some((a) => a.type === 'PDF'));
  const majBooks = books.filter((x) => /مجالس|رمضان/.test(x.title));
  const videos = R.filter((x) => x.type === 'videos');
  const Row = ({ x }: { x: It }) => { const t = tracks(x); return <li className="card"><strong>{x.title}</strong><p className="note" style={{ margin: '4px 0' }}>{author(x)}{t.length > 1 ? ` · ${t.length.toLocaleString('ar-EG')} مقطعًا` : ''}</p><div className="row">{t.length > 0 && <PlayTrack tracks={t} />}<AddToPlaylist tracks={t} name="دروس رمضان" /><SaveOffline srcs={t.map((y) => y.src)} /><a className="note" href={x.url} target="_blank" rel="noopener">المصدر ↗</a></div></li>; };
  return (
    <article style={{ maxWidth: 960, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/ramadan">رمضان</Link></p><h1>مجالس شهر رمضان والدروس الرمضانية</h1>
        <p>دروس وخطب وكتب من IslamHouse بأسماء المشايخ ومصادرها. سياسة IslamHouse المنشورة تسمح بالنشر والاستماع والحفظ دون إنترنت دون تعديل مع ذكر المصدر. لا نكتب دروسًا ولا ننسب كلامًا لأحد.</p></header>
      <TodayMajlis days={series.map(({ n, x }) => ({ n, title: x.title.replace(/^دروس من رمضان \[ \d+ \] /, ''), track: tracks(x)[0] }))} />
      <section className="section" id="daily"><h2>«دروس من رمضان» — الشيخ صالح الفوزان (مجلس لكل يوم)</h2>
        <p className="note">من إذاعة القرآن الكريم بالمملكة العربية السعودية عبر IslamHouse. {series.length.toLocaleString('ar-EG')} من ٣٠ مجلسًا متاحة {series.length < 30 ? `(الناقص: ${Array.from({ length: 30 }, (_, i) => i + 1).filter((n) => !series.some((s) => s.n === n)).map((n) => n.toLocaleString('ar-EG')).join('، ')})` : ''}.</p>
        <div className="row"><PlayTrack tracks={series.flatMap((s) => tracks(s.x))} label="▶ شغّل السلسلة" className="btn" /><AddToPlaylist tracks={series.flatMap((s) => tracks(s.x))} name="دروس من رمضان — الفوزان" /></div>
        <ol className="athar-items">{series.map(({ n, x }) => <li key={x.id} value={n}><PlayTrack tracks={tracks(x)} /> {x.title.replace(/^دروس من رمضان \[ \d+ \] /, '')}</li>)}</ol></section>
      <section className="section" id="books"><h2>كتب المجالس الرمضانية</h2>
        <p className="note">تُفتح من IslamHouse (PDF). نصوصها غير منقولة إلى الموقع: نص «مجالس شهر رمضان» للعثيمين ينتظر إذن مؤسسة الشيخ.</p>
        <ul className="athar-dir">{majBooks.map((x) => <li key={x.id}><a href={x.attachments.find((a) => a.type === 'PDF')!.url} target="_blank" rel="noopener"><strong>{x.title}</strong><small>{author(x)} · PDF {x.attachments.find((a) => a.type === 'PDF')!.size}</small></a></li>)}</ul></section>
      <section className="section" id="khutab"><h2>خطب الحرمين عن رمضان والصيام</h2><ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>{khutab.map((x) => <Row key={x.id} x={x} />)}</ul></section>
      <section className="section" id="sharh"><h2>شروح كتب الصيام ودروس أخرى</h2><ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>{sharh.map((x) => <Row key={x.id} x={x} />)}</ul></section>
      <section className="section" id="videos"><h2>مرئيات</h2><ul className="athar-items">{videos.map((x) => <li key={x.id}><a href={x.url} target="_blank" rel="noopener">{x.title} ↗</a> <small className="note">{author(x)}</small></li>)}</ul></section>
      <section className="section" id="other-books"><h2>كتب أخرى عن الصيام ({(books.length - majBooks.length).toLocaleString('ar-EG')})</h2>
        <details><summary>اعرض القائمة</summary><ul className="athar-items">{books.filter((x) => !majBooks.includes(x)).map((x) => <li key={x.id}><a href={x.url} target="_blank" rel="noopener">{x.title} ↗</a> <small className="note">{author(x)}</small></li>)}</ul></details></section>
    </article>
  );
}
