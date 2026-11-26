import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { HISN_GROUPS } from '@/lib/duas-groups';
import { IHA, QD, TV, ayatOf, surahName } from '@/lib/duas';
import PlayTrack from '@/components/PlayTrack';
import { DuaReciterBar } from '@/components/DuaAyahPlayer';
import SaveOffline from '@/components/SaveOffline';
import OfflineManager from '@/components/OfflineManager';
import { hiddenDuas } from '@/lib/duas-hidden';
import { tvDirect } from '@/lib/rights';
import TvLibrary from '@/components/TvLibrary';
import { TVC, TV_DUA_CATS, TV_ITEMS, personOfTv } from '@/lib/people';
export const revalidate = 300;
import DuaNav from '@/components/DuaNav';
export const metadata: Metadata = { title: 'مكتبة الأدعية الصوتية', description: 'أدعية حصن المسلم بصوت محمد جمعة، وأدعية القرآن بأصوات القراء، ودعاء القنوت وختم القرآن بأصوات أئمة الحرمين.' };
const MORE: { t: string; ids: number[] }[] = [{ t: 'أذكار الصباح والمساء والنوم', ids: [27, 28, 29] }, { t: 'الاستغفار والتسبيح والصلاة على النبي ﷺ', ids: [130, 131, 108] }];
export default async function Page() {
  const hid = await hiddenDuas(); const direct = await tvDirect();
  const groups = await Promise.all([...MORE.map((g, i) => ({ id: `m${i}`, title: g.t, ids: g.ids })), ...HISN_GROUPS].map(async (g) => {
    const tracks = (await Promise.all(g.ids.map(async (id) => { const c = await loadAdhkar(id); const title = ADHKAR.find((x) => x.id === id)?.title ?? ''; return c.items.filter((x) => x.a).map((x) => ({ id: `h${id}-${x.n}`, src: `/audio/adhkar/${x.a}`, title, by: 'محمد جمعة (OpenDua)', license: 'CC BY 4.0', source: `حصن المسلم: ${x.r}`, text: x.t, page: `/adhkar/${id}` })); }))).flat();
    return { ...g, tracks };
  }));
  const hisnTotal = groups.reduce((t, g) => t + g.tracks.length, 0);
  const quran = (await Promise.all(QD.duas.filter((d) => d.kind === 'quran').map(ayatOf))).flat().map((x) => ({ ...x, title: `${surahName(x.s)}: ${x.a}` }));
  // IslamHouse: per-chapter tracks only (the one-file "complete" copy is left out so nothing plays twice).
  const ih = IHA.map((it) => {
    const reader = it.by.filter((p) => p.kind !== 'reviewer' && p.kind !== 'source').map((p) => p.title).join('، ');
    const files = it.attachments.filter((a) => a.type === 'MP3');
    const parts = files.length > 1 ? files.filter((a) => !/كامل/.test(a.desc ?? '')) : files;
    return { it, reader, tracks: parts.map((a, k) => ({ id: `ih${it.id}-${k}`, k, src: a.url, title: a.desc || it.title, by: reader, source: `IslamHouse: ${it.title}`, license: 'سياسة IslamHouse: دون تعديل مع ذكر المصدر', page: '/duas/audio' })).filter((t) => !hid.has(t.id) && !hid.has(`ih${it.id}`)) };
  });
  const mb = (x: { it: { attachments: { size: string; desc: string | null }[] } }) => { let t = 0; for (const a of x.it.attachments) { if (/كامل/.test(a.desc ?? '') && x.it.attachments.length > 1) continue; const m = /([\d.]+)\s*(MB|KB)/i.exec(a.size); if (m) t += Number(m[1]) / (m[2].toUpperCase() === 'KB' ? 1024 : 1); } return `${Math.round(t)} م.ب`; };
  const hisnIh = ih.filter((x) => /حصن المسلم/.test(x.it.title));
  const afasy = ih.filter((x) => x.reader.includes('العفاسي'));
  const talks = ih.filter((x) => !hisnIh.includes(x) && !afasy.includes(x));
  const tvRows = TV_ITEMS.filter((x) => TV_DUA_CATS.includes(x.cat) && !hid.has(`tv${x.id}`)).map((x) => { const p = personOfTv(x.scholar_id); return { id: x.id, title: x.title, by: p?.ar ?? '', slug: p?.slug, cat: x.cat, plays: x.plays }; });
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>مكتبة الأدعية الصوتية</h1><p>تسجيلات بشرية فقط، بلا موسيقى ولا أصوات مولّدة. ما يُشغَّل هنا يستمر وأنت تتنقل في الموقع.</p></header>
      <DuaNav />
      <OfflineManager />
      <section className="section"><h2>أدعية القرآن الكريم بأصوات القراء</h2>
        <p className="note">{quran.length.toLocaleString('ar-EG')} آية من آيات الدعاء، تُتلى كل آية كاملة. اختر القارئ ثم شغّل.</p>
        <DuaReciterBar all={quran} /></section>
      <section className="section" id="hisn-full"><h2>«حصن المسلم» كاملًا بأصوات القراء</h2>
        <p className="note">من موسوعة IslamHouse، تُشغَّل من خوادمها دون تعديل، مع ذكر القارئ والمصدر.</p>
        <ul className="athar-dir">{hisnIh.map((x) => <li key={x.it.id}><div className="card"><strong>{x.reader}</strong><p className="note" style={{ margin: '4px 0 8px' }}>{x.tracks.length.toLocaleString('ar-EG')} مقطعًا{x.it.by.some((p) => p.kind === 'reviewer') ? ` · مراجعة: ${x.it.by.filter((p) => p.kind === 'reviewer').map((p) => p.title).join('، ')}` : ''}</p><PlayTrack tracks={x.tracks} label="▶ شغّل من البداية" className="btn small" /> <SaveOffline srcs={x.tracks.map((t) => t.src)} size={mb(x)} /> <a className="note" href={x.it.url} target="_blank" rel="noopener">المصدر ↗</a></div></li>)}</ul></section>
      <section className="section" id="afasy"><h2>أذكار وأدعية بصوت مشاري العفاسي</h2>
        <ul className="athar-dir">{afasy.map((x) => <li key={x.it.id}><div className="card"><strong>{x.it.title}</strong><p className="note" style={{ margin: '4px 0 8px' }}>{x.tracks.length > 1 ? `${x.tracks.length.toLocaleString('ar-EG')} تسجيلات (إصدارات مختلفة)` : 'تسجيل واحد'}</p><PlayTrack tracks={x.tracks} label="▶ استمع" className="btn small" /> <SaveOffline srcs={x.tracks.map((t) => t.src)} size={mb(x)} /> <a className="note" href={x.it.url} target="_blank" rel="noopener">المصدر ↗</a></div></li>)}</ul></section>
      <section className="section"><h2>أدعية «حصن المسلم» بصوت محمد جمعة</h2>
        <p className="note">{hisnTotal.toLocaleString('ar-EG')} تسجيلًا من مشروع OpenDua (ترخيص CC BY 4.0: «Recitation by Muhammad Jumah for OpenDua»)، كل تسجيل مربوط بنصه بعد مطابقة حروفه.</p>
        <ul className="athar-dir">{groups.filter((g) => g.tracks.length).map((g) => <li key={g.id}><div className="card"><strong>{g.title}</strong><p className="note" style={{ margin: '4px 0 8px' }}>{g.tracks.length.toLocaleString('ar-EG')} تسجيلًا</p><PlayTrack tracks={g.tracks} label="▶ شغّل القائمة" className="btn small" /> <SaveOffline srcs={g.tracks.map((t) => t.src)} /></div></li>)}</ul></section>
      <section className="section" id="talks"><h2>خطب ودروس عن الدعاء والأذكار</h2>
        <ul className="athar-dir">{talks.map((x) => <li key={x.it.id}><div className="card"><strong>{x.it.title}</strong><p className="note" style={{ margin: '4px 0 8px' }}>{x.reader}</p><PlayTrack tracks={x.tracks} label="▶ استمع" className="btn small" /> <SaveOffline srcs={x.tracks.map((t) => t.src)} size={mb(x)} /> <a className="note" href={x.it.url} target="_blank" rel="noopener">المصدر ↗</a></div></li>)}</ul></section>
      <section className="section" id="tv"><h2>أدعية وأذكار ورقية — أئمة الحرمين وكبار القراء (TVQuran)</h2>
        <p className="note">كل ما وجدناه في أقسام الأدعية والأذكار والرقية والأذان والتكبير على موقع TVQuran ({tvRows.length.toLocaleString('ar-EG')} تسجيلًا)، يُشغَّل في مشغّلهم الرسمي للتضمين، ويبقى مفتوحًا أسفل الشاشة وأنت تتنقل في الموقع. أدعية القنوت والختم يُنشئها الإمام، وليست أحاديث نبوية بلفظها.</p>
        <TvLibrary rows={tvRows} cats={TVC.categories.filter((c) => TV_DUA_CATS.includes(c.id))} />
        <details id="tv-help" className="card" style={{ marginTop: 12 }}><summary>ماذا يعمل وماذا لا يعمل في مشغّل TVQuran؟</summary>
          <ul><li>يستمر التشغيل وأنت تنتقل بين صفحات الموقع داخل التبويب نفسه.</li><li>يتوقف إذا أغلقت التبويب أو أعدت تحميل الصفحة.</li><li>على أندرويد (Chrome): غالبًا يستمر مع تصغير المتصفح، وقد يتوقف عند قفل الشاشة.</li><li>على آيفون (Safari): يتوقف غالبًا عند قفل الشاشة أو ترك المتصفح.</li><li>لا تحكم من شاشة القفل ولا حفظ للاستماع دون إنترنت، لأن الصوت داخل مشغّل موقعهم.</li><li>تشغيل مباشر في مشغّل المنصة يحتاج إذنًا من TVQuran (مسجّل في سجل الحقوق).</li></ul></details>
        {direct && <p className="note">مسجّل إذن تشغيل مباشر: {TV.length.toLocaleString('ar-EG')} تسجيلًا تعمل في مشغّل المنصة: {TV.map((x) => <PlayTrack key={x.id} tracks={[{ id: `tv${x.id}`, src: x.mp3, title: x.title, by: x.scholar, source: 'TVQuran.com (بإذن)', page: '/duas/audio' }]} label={`▶ ${x.scholar}: ${x.title}`} />)}</p>}
      </section>
    </article>
  );
}
