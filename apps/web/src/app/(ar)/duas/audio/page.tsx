import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { HISN_GROUPS } from '@/lib/duas-groups';
import { QD, TV, ayatOf, surahName } from '@/lib/duas';
import PlayTrack from '@/components/PlayTrack';
import { DuaReciterBar } from '@/components/DuaAyahPlayer';
import TvEmbed from '@/components/TvEmbed';
import DuaNav from '@/components/DuaNav';
export const metadata: Metadata = { title: 'مكتبة الأدعية الصوتية', description: 'أدعية حصن المسلم بصوت محمد جمعة، وأدعية القرآن بأصوات القراء، ودعاء القنوت وختم القرآن بأصوات أئمة الحرمين.' };
const MORE: { t: string; ids: number[] }[] = [{ t: 'أذكار الصباح والمساء والنوم', ids: [27, 28, 29] }, { t: 'الاستغفار والتسبيح والصلاة على النبي ﷺ', ids: [130, 131, 108] }];
export default async function Page() {
  const groups = await Promise.all([...MORE.map((g, i) => ({ id: `m${i}`, title: g.t, ids: g.ids })), ...HISN_GROUPS].map(async (g) => {
    const tracks = (await Promise.all(g.ids.map(async (id) => { const c = await loadAdhkar(id); const title = ADHKAR.find((x) => x.id === id)?.title ?? ''; return c.items.filter((x) => x.a).map((x) => ({ id: `h${id}-${x.n}`, src: `/audio/adhkar/${x.a}`, title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0', source: `حصن المسلم: ${x.r}`, text: x.t, page: `/adhkar/${id}` })); }))).flat();
    return { ...g, tracks };
  }));
  const hisnTotal = groups.reduce((t, g) => t + g.tracks.length, 0);
  const quran = (await Promise.all(QD.duas.filter((d) => d.kind === 'quran').map(ayatOf))).flat().map((x) => ({ ...x, title: `${surahName(x.s)}: ${x.a}` }));
  const byScholar = [...new Set(TV.map((x) => x.scholar))].map((s) => ({ s, items: TV.filter((x) => x.scholar === s) }));
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>مكتبة الأدعية الصوتية</h1><p>تسجيلات بشرية فقط، بلا موسيقى ولا أصوات مولّدة. ما يُشغَّل هنا يستمر وأنت تتنقل في الموقع.</p></header>
      <DuaNav />
      <section className="section"><h2>أدعية القرآن الكريم بأصوات القراء</h2>
        <p className="note">{quran.length.toLocaleString('ar-EG')} آية من آيات الدعاء، تُتلى كل آية كاملة. اختر القارئ ثم شغّل.</p>
        <DuaReciterBar all={quran} /></section>
      <section className="section"><h2>أدعية «حصن المسلم» بصوت محمد جمعة</h2>
        <p className="note">{hisnTotal.toLocaleString('ar-EG')} تسجيلًا من مشروع OpenDua (ترخيص CC BY 4.0: «Recitation by Muhammad Jumah for OpenDua»)، كل تسجيل مربوط بنصه بعد مطابقة حروفه.</p>
        <ul className="athar-dir">{groups.filter((g) => g.tracks.length).map((g) => <li key={g.id}><div className="card"><strong>{g.title}</strong><p className="note" style={{ margin: '4px 0 8px' }}>{g.tracks.length.toLocaleString('ar-EG')} تسجيلًا</p><PlayTrack tracks={g.tracks} label="▶ شغّل القائمة" className="btn small" /></div></li>)}</ul></section>
      <section className="section"><h2>دعاء القنوت وختم القرآن — أئمة الحرمين وكبار القراء</h2>
        <p className="note">من موقع TVQuran عبر مشغّله الرسمي للتضمين ({TV.length.toLocaleString('ar-EG')} تسجيلًا). هذه أدعية يُنشئها الإمام في القنوت أو الختم، وليست أحاديث نبوية بلفظها. لا تعمل في الخلفية لأنها داخل مشغّل الموقع المصدر.</p>
        <ul className="athar-dir">{byScholar.map(({ s, items }) => <li key={s}><div className="card"><strong>{s}</strong>{items.map((x) => <div key={x.id} style={{ marginTop: 8 }}><span>{x.title}</span> <TvEmbed id={x.id} title={`${x.title} — ${s}`} /></div>)}</div></li>)}</ul></section>
    </article>
  );
}
