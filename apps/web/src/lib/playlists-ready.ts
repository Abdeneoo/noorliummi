import 'server-only';
import { ADHKAR, loadAdhkar } from './adhkar';
import { IHA, PROPHETS, QD, ayatOf, surahName } from './duas';
import { loadSurah } from './quran';
import { TV_ITEMS, personOfTv } from './people';
import type { Track } from './audio-store';

/**
 * Ready-made playlists, built only from recordings the site already plays under their licences:
 * Quranic ayat (recited in full by a reciter the listener picks), OpenDua (CC BY 4.0), IslamHouse (published policy),
 * and TVQuran (official embed — one recording at a time, not queued).
 */
export type Ayah = { s: number; a: number; t: string; title: string };
export interface Ready { id: string; title: string; note: string; ayat: Ayah[]; tracks: Track[]; tv: { id: number; title: string; by: string; slug?: string; cat: number; plays: number }[] }

async function od(ids: number[]): Promise<Track[]> {
  return (await Promise.all(ids.map(async (id) => { const c = await loadAdhkar(id); const t = ADHKAR.find((x) => x.id === id)?.title ?? '';
    return c.items.filter((x) => x.a).map((x) => ({ id: `h${id}-${x.n}`, src: `/audio/adhkar/${x.a}`, title: t, by: 'محمد جمعة (OpenDua)', source: `حصن المسلم: ${x.r}`, license: 'CC BY 4.0 — Recitation by Muhammad Jumah for OpenDua', text: x.t, page: `/adhkar/${id}` })); }))).flat();
}
async function quranByTag(tags: string[]): Promise<Ayah[]> {
  const d = QD.duas.filter((x) => x.kind === 'quran' && x.tags.some((t) => tags.includes(t)));
  return (await Promise.all(d.map(ayatOf))).flat().map((x) => ({ ...x, title: `${surahName(x.s)}: ${x.a}` }));
}
async function ayatRefs(refs: [number, number, number][]): Promise<Ayah[]> {
  const out: Ayah[] = [];
  for (const [s, a1, a2] of refs) { const su = await loadSurah(s); for (let a = a1; a <= a2; a++) if (su.ayat[a - 1]) out.push({ s, a, t: su.ayat[a - 1].t, title: `${surahName(s)}: ${a}` }); }
  return out;
}
const ih = (pred: (title: string) => boolean, onlyIds?: number[]): Track[] => IHA.filter((it) => !onlyIds || onlyIds.includes(it.id)).flatMap((it) => {
  const reader = it.by.filter((p) => p.kind === 'author').map((p) => p.title).join('، ');
  const f = it.attachments.filter((a) => a.type === 'MP3'); const parts = f.length > 1 ? f.filter((a) => !/كامل/.test(a.desc ?? '')) : f;
  return parts.filter((a) => pred(a.desc || it.title)).map((a, k) => ({ id: `ih${it.id}-${k}-${(a.desc ?? '').length}`, src: a.url, title: a.desc || it.title, by: reader, source: `IslamHouse: ${it.title}`, license: 'سياسة IslamHouse المنشورة' }));
});
const tv = (re: RegExp, cats = [4, 6, 8, 9]) => TV_ITEMS.filter((x) => cats.includes(x.cat) && re.test(x.title)).map((x) => { const p = personOfTv(x.scholar_id); return { id: x.id, title: x.title, by: p?.ar ?? '', slug: p?.slug, cat: x.cat, plays: x.plays }; });
const DEAD = /الميت|للميت|المحتضر|مصيبة|التعزية|القبر|القبور|الفرط|للفرط/;

export async function readyPlaylists(): Promise<Ready[]> {
  const prophets = await ayatRefs(PROPHETS.map((p) => [p.s, p.from, p.to] as [number, number, number]));
  return [
    { id: 'quran', title: 'أدعية القرآن', note: 'كل آيات الدعاء في «الدعاء من الكتاب والسنة» للقحطاني، تُتلى كل آية كاملة.', ayat: await quranByTag(Object.keys({ huda: 1, rabbana: 1, tawba: 1, nar: 1, maghfira: 1, rahma: 1, nasr: 1, rabbi: 1, dhurriyya: 1, allahumma: 1, isti3adha: 1, walidayn: 1, ilm: 1, rizq: 1, afiya: 1, janna: 1, karb: 1 })), tracks: [], tv: [] },
    { id: 'sunnah', title: 'أدعية السنة', note: 'أدعية نبوية من «حصن المسلم» بصوت محمد جمعة، بلفظ الحديث.', ayat: [], tracks: await od([24, 26, 33, 35, 36, 42, 44, 45, 47, 130]), tv: [] },
    { id: 'prophets', title: 'أدعية الأنبياء', note: 'ما دعا به الأنبياء عليهم السلام في القرآن، تُتلى كل آية كاملة.', ayat: prophets, tracks: [], tv: [] },
    { id: 'parents', title: 'أدعية الوالدين', note: 'آيات الدعاء للوالدين.', ayat: await ayatRefs([[17, 24, 24], [14, 41, 41], [71, 28, 28], [46, 15, 15], [27, 19, 19]]), tracks: [], tv: [] },
    { id: 'deceased', title: 'أدعية المتوفين', note: 'من «حصن المسلم»: الدعاء للميت في الصلاة عليه وعند دفنه وزيارة القبور، بصوت محمد جمعة ثم حمد الدريهم.', ayat: [], tracks: [...await od([55, 56, 57, 59, 60, 61]), ...ih((t) => DEAD.test(t), [263352])], tv: [] },
    { id: 'mercy', title: 'أدعية الرحمة والمغفرة', note: 'آيات طلب المغفرة والرحمة، ثم الاستغفار من السنة.', ayat: await quranByTag(['maghfira', 'rahma', 'tawba']), tracks: await od([130]), tv: [] },
    { id: 'karb', title: 'أدعية الكرب والحزن', note: 'دعاء الهم والحزن والكرب ومن أصيب بمصيبة أو استصعب عليه أمر.', ayat: await quranByTag(['karb']), tracks: await od([35, 36, 44, 54]), tv: [] },
    { id: 'shifa', title: 'أدعية الشفاء', note: 'الدعاء للمريض وما يقول من أحس وجعًا، مع الرقية.', ayat: [], tracks: await od([50, 125, 49]), tv: tv(/رقية|الرقية/, [6]) },
    { id: 'rizq', title: 'أدعية الرزق', note: 'آيات سؤال الرزق ودعاء قضاء الدين.', ayat: await quranByTag(['rizq']), tracks: await od([42]), tv: [] },
    { id: 'ramadan', title: 'أدعية رمضان', note: 'دعاء رؤية الهلال والإفطار، وأدعية ليالي رمضان من الحرمين.', ayat: [], tracks: await od([68, 69, 74, 75, 76]), tv: tv(/رمضان|القدر|ليلة/) },
    { id: 'qunut', title: 'أدعية القنوت', note: 'دعاء قنوت الوتر من السنة، ثم أدعية القنوت من أئمة الحرمين وكبار القراء.', ayat: [], tracks: await od([33, 34]), tv: tv(/القنوت|قنوت/) },
    { id: 'tahajjud', title: 'أدعية التهجد وختم القرآن', note: 'أدعية ختم القرآن والتهجد من TVQuran.', ayat: [], tracks: [], tv: tv(/الختم|ختم|التهجد|قيام/) },
    { id: 'haramain', title: 'أدعية الحرمين', note: 'تسجيلات أئمة الحرمين المسجلة في المسجد الحرام أو المسجد النبوي.', ayat: [], tracks: [], tv: tv(/الحرم|المكي|النبوي|مكة|المدينة/) },
    { id: 'jawami', title: 'جوامع الدعاء من القرآن', note: 'أدعية «ربنا» الجامعة من القرآن. النص الكامل لجوامع الدعاء في مكتبة الكتب.', ayat: await quranByTag(['rabbana']), tracks: [], tv: [] },
    { id: 'sleep', title: 'أدعية قبل النوم', note: 'أذكار النوم والتقلب ليلًا والفزع، بصوت محمد جمعة.', ayat: [], tracks: await od([29, 30, 31]), tv: [] },
    { id: 'voices', title: 'أدعية بأصوات القراء المشهورين', note: '«حصن المسلم» بصوت حمد الدريهم وسليمان الشويهي، وأذكار بصوت العفاسي (IslamHouse)، وأدعية من TVQuran.', ayat: [], tracks: ih(() => true).slice(0, 400), tv: tv(/./, [4]) },
  ];
}
export const READY_IDS = ['quran', 'sunnah', 'prophets', 'parents', 'deceased', 'mercy', 'karb', 'shifa', 'rizq', 'ramadan', 'qunut', 'tahajjud', 'haramain', 'jawami', 'sleep', 'voices'];
