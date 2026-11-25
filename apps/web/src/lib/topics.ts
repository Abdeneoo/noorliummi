import { SURAHS, loadSurah } from './quran';
/**
 * Quran topic pages built by an exact word search (not a hand-picked or AI-chosen selection): every ayah in which one
 * of the listed word forms occurs. Pages say so, and that it is not an exhaustive thematic index.
 */
export interface Topic { id: string; title: string; words: string; re: RegExp; exclude?: RegExp; /** extra test on the original (vocalised) word */ also?: (w: string) => boolean; /** skip when the next word matches (e.g. «أم الكتاب») */ notBefore?: RegExp }
const P = '(?:[وفبل]|ول|فل|وب|فب)?(?:ال|لل)?';
export const TOPICS: Topic[] = [
  { id: 'parents', title: 'الوالدين', words: 'الوالدين، والديه، والديك، والدي…', re: new RegExp(`^${P}والد(?:ين|يه|يك|يهم|ي|تي|تك|ته|ة)$`) },
  { id: 'mother', title: 'الأم', words: 'أمه، أمك، أمي، أمهات…', exclude: /^(?:ال|وال)امي/, notBefore: /^(?:الكتاب|القري)/, re: new RegExp(`^${P}(?:امه|امك|امها|امي|امهما|امهات|امهاتكم|امهاتهم|امهاتهن)$`),
    // «أُمّ» alone (e.g. أُمِّ موسى): hamza with damma then mim with shadda — never the particle «أَمْ».
    also: (w) => /^(?:[وفبل]|ول|فل)?[\u064B-\u0652]*أُ?\u064F?م[\u0651\u064E\u064F\u0650]*$/.test(w) && w.includes('\u0651') && w.includes('أُ') },
  { id: 'sabr', title: 'الصبر', words: 'الصبر، اصبر، الصابرين…', re: /صبر|صابر/ },
  { id: 'rizq', title: 'الرزق', words: 'الرزق، يرزق، رزقناهم…', re: /رزق/ },
  { id: 'sakina', title: 'الطمأنينة والسكينة', words: 'تطمئن، مطمئنة، السكينة…', re: /طمئن|طمان|سكينت|سكينه|السكينة|سكينة/ },
  { id: 'tawba', title: 'التوبة', words: 'التوبة، توبوا، التواب، تاب…', re: new RegExp(`^${P}(?:توب|تواب|تاب|يتوب|تتوب|نتوب|تبت|تبنا|تبتم|تائب)`), exclude: /تابوت|تابع/ },
];
export const norm = (w: string) => w.replace(/ٰ/g, 'ا').replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي');

export async function topicAyat(t: Topic): Promise<{ s: number; a: number; text: string }[]> {
  const out: { s: number; a: number; text: string }[] = [];
  for (const s of SURAHS) {
    const { ayat } = await loadSurah(s.index);
    for (const a of ayat) {
      const ws = a.t.split(/\s+/);
      if (ws.some((w, i) => { const n = norm(w); return (t.re.test(n) || !!t.also?.(w)) && !t.exclude?.test(n) && !(t.notBefore && ws[i + 1] && t.notBefore.test(norm(ws[i + 1]))); })) out.push({ s: s.index, a: a.n, text: a.t });
    }
  }
  return out;
}
