import type { Metadata } from 'next';
import Link from 'next/link';
import ram from '@/generated/duas/ih-ramadan.json';
import { loadSurah, SURAHS } from '@/lib/quran';
import { hadithRef } from '@/lib/hadith-ref';
import PlayTrack from '@/components/PlayTrack';
import AddToPlaylist from '@/components/AddToPlaylist';
export const metadata: Metadata = { title: '30 مجلسًا في رمضان', description: 'مجلس لكل يوم من رمضان: آيات وأحاديث بمصادرها، ودرس صوتي من IslamHouse، وباب الفقه المتصل — جمعٌ من مصادر موثقة، لا تأليف.' };
export const revalidate = 86400;

/**
 * Thirty Ramadan sittings, each assembled from sources already on the site (Tanzil ayat, hadith collections, al-Fiqh al-Muyassar,
 * IslamHouse lessons). The site writes no religious text here: only the topic name and the choice of references.
 */
type M = { t: string; ay: [number, number, number][]; h?: [string, number, number][]; k: RegExp; f?: [string, string] };
const H = { sawm: ['bukhari', 2, 38], qadr: ['bukhari', 30, 1901], tahar: ['bukhari', 32, 2017], ashr: ['bukhari', 32, 2024], itikaf: ['bukhari', 33, 2025], sahur: ['bukhari', 30, 1923], iftar: ['bukhari', 30, 1954], ajjil: ['bukhari', 30, 1957], zoor: ['bukhari', 30, 1903], fitr: ['bukhari', 24, 1503], afw: ['ibnmajah', 34, 3850] } as const;
const h = (...k: (keyof typeof H)[]) => k.map((x) => H[x] as unknown as [string, number, number]);
const MAJ: M[] = [
  { t: 'فضل رمضان', ay: [[2, 185, 185]], h: h('sawm'), k: /وأقبل رمضان|خصائص شهر رمضان|فضائل/ },
  { t: 'الإخلاص والنية', ay: [[98, 5, 5]], h: h('sawm'), k: /إيمان|احتساب|النية|الإخلاص/ },
  { t: 'فضل الصيام', ay: [[2, 183, 184]], k: /كتب عليكم الصيام|آثار الصيام/, f: ['/fiqh/siyam/32', 'مقدمات الصيام'] },
  { t: 'أحكام الصيام', ay: [[2, 187, 187]], k: /أحكام متعلقة بالصيام|أحكام الصيام/, f: ['/fiqh/siyam/33', 'الأعذار ومفطرات الصائم'] },
  { t: 'آداب الصيام', ay: [[2, 183, 183]], h: h('zoor'), k: /آداب متعلقة بالصيام/, f: ['/fiqh/siyam/34', 'مستحبات الصيام ومكروهاته'] },
  { t: 'السحور والإفطار', ay: [[2, 187, 187]], h: h('sahur', 'iftar', 'ajjil'), k: /السحور|الإفطار/ },
  { t: 'رمضان والقرآن', ay: [[2, 185, 185], [35, 29, 30]], k: /القرآن/ },
  { t: 'قيام الليل', ay: [[73, 1, 4], [32, 16, 16]], k: /القيام|قيام/ },
  { t: 'التراويح', ay: [[25, 64, 64]], h: h('qadr'), k: /التراويح/, f: ['/fiqh/salah/15', 'صلاة التطوع'] },
  { t: 'الدعاء', ay: [[2, 186, 186]], k: /الدعاء في شهر رمضان/ },
  { t: 'الاستغفار', ay: [[71, 10, 12], [3, 135, 135]], k: /الاستغفار/ },
  { t: 'التوبة', ay: [[66, 8, 8], [24, 31, 31]], k: /التوبة في رمضان|التوبة/ },
  { t: 'الصدقة', ay: [[2, 261, 261]], k: /أبواب الخير|يتقرب به/ },
  { t: 'إطعام الصائمين', ay: [[76, 8, 9]], k: /أعمال شهر رمضان|الأعمال التي يتأكد/ },
  { t: 'بر الوالدين', ay: [[17, 23, 24]], k: /الوالدين/ },
  { t: 'صلة الرحم', ay: [[4, 1, 1], [47, 22, 23]], k: /صلة الرحم/ },
  { t: 'حفظ اللسان', ay: [[50, 18, 18]], h: h('zoor'), k: /اللسان|الأخلاق/ },
  { t: 'الصبر', ay: [[39, 10, 10], [2, 155, 157]], k: /الصبر|المحافظة على الصيام/ },
  { t: 'التوكل', ay: [[65, 3, 3]], k: /التوكل/ },
  { t: 'استقبال العشر الأواخر', ay: [[97, 1, 3]], h: h('ashr'), k: /نفحات العشر|اغتنام لحظات/ },
  { t: 'فضل العشر الأواخر', ay: [[44, 3, 4]], h: h('ashr', 'tahar'), k: /العشر الأواخر/ },
  { t: 'الاعتكاف', ay: [[2, 187, 187]], h: h('itikaf'), k: /الاعتكاف/, f: ['/fiqh/siyam/36', 'الاعتكاف'] },
  { t: 'ليلة القدر', ay: [[97, 1, 5]], h: h('qadr', 'tahar', 'afw'), k: /ليلة القدر/ },
  { t: 'الذكر', ay: [[33, 41, 42], [13, 28, 28]], k: /ذكر الله في رمضان/ },
  { t: 'الرحمة والمغفرة', ay: [[39, 53, 53]], k: /العتق من النيران/ },
  { t: 'الدعاء للمتوفين', ay: [[59, 10, 10], [71, 28, 28]], k: /للميت|المتوفى/ },
  { t: 'جوامع الدعاء', ay: [[2, 201, 201], [3, 8, 8]], h: h('afw'), k: /الدعاء/ },
  { t: 'زكاة الفطر', ay: [[87, 14, 15]], h: h('fitr'), k: /زكاة الفطر/, f: ['/fiqh/zakat/30', 'زكاة الفطر'] },
  { t: 'ختام رمضان', ay: [[2, 185, 185]], k: /يختم بأعمال|علامات قبول|عيد الفطر/ },
  { t: 'الثبات بعد رمضان', ay: [[15, 99, 99], [16, 92, 92]], k: /بعد رمضان|يواصل عمل الخير|منطلق/ },
];
type It = { id: number; type: string; title: string; url: string; by: { title: string; kind: string }[]; attachments: { type: string; url: string; desc: string | null }[] };
const R = (ram as { items: It[] }).items.filter((x) => x.type === 'audios' && x.attachments.some((a) => a.type === 'MP3'));
const BOOK: Record<string, string> = { bukhari: 'صحيح البخاري', ibnmajah: 'سنن ابن ماجه' };

export default async function Thirty() {
  const used = new Set<number>();
  const rows = await Promise.all(MAJ.map(async (m, i) => {
    const ay = (await Promise.all(m.ay.map(async ([s, a, b]) => { const su = await loadSurah(s); return { s, a, b, t: su.ayat.slice(a - 1, b).map((x) => x.t).join(' ۝ ') }; })));
    const hs = (await Promise.all((m.h ?? []).map(async ([bk, sec, n]) => { try { return { bk, ...(await hadithRef(bk, sec, n)) }; } catch { return null; } }))).filter((x) => !!x);
    return { i, m, ay, hs };
  }));
  const audio = rows.map(({ m }) => { const x = R.find((r) => !used.has(r.id) && m.k.test(r.title)); if (x) used.add(x.id); return x; });
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/ramadan">رمضان</Link></p><h1>30 مجلسًا في رمضان</h1>
        <p>مجلس لكل يوم: آيات من المصحف، وأحاديث من كتبها، ودرس صوتي من IslamHouse بصوت صاحبه، وباب الفقه المتصل. لم يكتب الموقع نصًا دينيًا هنا؛ اختار الموضوع والمراجع فقط. هذه المجالس ليست كتاب «مجالس شهر رمضان» للشيخ العثيمين ولا تُنسب إليه.</p></header>
      <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>{rows.map(({ i, m, ay, hs }) => { const a = audio[i]; const tr = a ? a.attachments.filter((x) => x.type === 'MP3').map((x, k) => ({ id: `ihr${a.id}-${k}`, src: x.url, title: x.desc || a.title, by: a.by.filter((b) => b.kind === 'author').map((b) => b.title).join('، '), source: `IslamHouse: ${a.title}`, license: 'سياسة IslamHouse المنشورة', page: '/ramadan/30' })) : [];
        return (
          <li key={i} id={`m${i + 1}`} className="card"><p className="eyebrow">المجلس {(i + 1).toLocaleString('ar-EG')}</p><h2 style={{ margin: '4px 0' }}>{m.t}</h2>
            {ay.map((x) => <p key={`${x.s}:${x.a}`} lang="ar" style={{ fontFamily: 'var(--font-quran)', fontSize: '1.15rem', lineHeight: 2.2 }}>{x.t} <Link className="note" href={`/quran/${x.s}#a${x.a}`}>﴿{SURAHS[x.s - 1].name}: {x.a.toLocaleString('ar-EG')}{x.b > x.a ? `–${x.b.toLocaleString('ar-EG')}` : ''}﴾</Link> · <Link className="note" href={`/tafsir/${x.s}#a${x.a}`}>التفسير</Link></p>)}
            {hs.map((x) => <details key={`${x.bk}${x.n}`}><summary>{BOOK[x.bk]} ({x.n.toLocaleString('ar-EG')})</summary><p lang="ar" style={{ lineHeight: 2 }}>{x.t}</p><Link href={x.href}>في سياقه</Link></details>)}
            {a && <div className="row"><PlayTrack tracks={tr} label={`▶ ${a.title}`} /><small className="note">{tr[0]?.by}</small><AddToPlaylist tracks={tr} name="30 مجلسًا في رمضان" /></div>}
            {m.f && <p className="note" style={{ margin: 0 }}>الفقه: <Link href={m.f[0]}>{m.f[1]}</Link> (الفقه الميسر، وأقوال الفقهاء من بداية المجتهد)</p>}
          </li>); })}</ol>
    </article>
  );
}
