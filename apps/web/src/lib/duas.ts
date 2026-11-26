import 'server-only';
import data from '@/generated/duas/qahtani.json';
import tv from '@/generated/duas/tvquran.json';
import iha from '@/generated/duas/ih-audio.json';
import prophets from '@/generated/duas/prophets.json';
import { loadSurah, SURAHS } from './quran';
/** al-Qahtani, «الدعاء من الكتاب والسنة» (IslamHouse, verbatim) + the site's Quran text for each Quranic dua. */
export interface Dua { n: number; text: string; notes: string[]; kind: 'quran' | 'sunnah'; refs: [number, number, number][]; tags: string[]; audio?: string }
export const QD = data as { title: string; author: string; source: string; sections: { title: string; blocks: { tag: string; ar: string }[] }[]; duas: Dua[]; closing: string };
export const TV = tv as { id: number; title: string; scholar: string; scholar_id: number; mp3: string }[];
/** Topic labels for tags found by words in the dua's own text (automatic; stated as such on the pages). */
export const TAG: Record<string, string> = {
  rabbana: 'أدعية «ربنا»', rabbi: 'أدعية «ربِّ»', allahumma: 'أدعية «اللهم»', maghfira: 'المغفرة', tawba: 'التوبة', rahma: 'الرحمة', walidayn: 'الوالدان', dhurriyya: 'الذرية والزوج',
  huda: 'الهداية والثبات', rizq: 'الرزق والغنى', nar: 'الوقاية من النار', janna: 'الجنة', ilm: 'العلم', sabr: 'الصبر', nasr: 'النصر', isti3adha: 'الاستعاذة', afiya: 'العافية والشفاء', karb: 'الكرب والهم',
};
export async function ayatOf(d: Dua) {
  const out: { s: number; a: number; t: string }[] = [];
  for (const [s, a1, a2] of d.refs) { const su = await loadSurah(s); for (let a = a1; a <= a2; a++) if (su.ayat[a - 1]) out.push({ s, a, t: su.ayat[a - 1].t }); }
  return out;
}
export const surahName = (s: number) => SURAHS[s - 1].name;
/** The author's note without its footnote number. */
export const note = (t: string) => t.replace(/^\[\d+\]\s*/, '');
export interface IhAudio { id: number; title: string; by: { id: number; title: string; kind: string }[]; attachments: { type: string; size: string; url: string; desc: string | null }[]; url: string }
export const IHA = iha as IhAudio[];
export interface ProphetDua { prophet: string; kind: 'said' | 'joint' | 'commanded'; s: number; from: number; to: number; tafsir: { a: number; t: string }[]; context?: { a: number; t: string } }
export const PROPHETS = prophets as ProphetDua[];
