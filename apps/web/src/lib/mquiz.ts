import { SURAHS, loadMutashabihat, loadSurah } from './quran';
/**
 * Daily «تحدّي المتشابهات»: three questions built only from the Quran text and the mutashabihat list. Each shows two
 * similar ayat and asks which wording is in a given surah. Deterministic per date, so everyone gets the same three.
 */
export interface MQ { surah: number; ayah: number; other: [number, number]; options: string[]; answer: number }
const strip = (s: string) => s.replace(/[ً-ْٰۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/\s+/g, ' ').trim();
function rng(seed: number) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32); }

export async function dailyQuiz(date: string): Promise<MQ[]> {
  const seed = [...date].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const r = rng(seed); const out: MQ[] = []; const used = new Set<string>();
  for (let tries = 0; out.length < 3 && tries < 200; tries++) {
    const s = 1 + Math.floor(r() * 114);
    const map = await loadMutashabihat(s); const keys = Object.keys(map);
    if (!keys.length) continue;
    const ay = Number(keys[Math.floor(r() * keys.length)]);
    const single = map[ay].filter((rg) => rg.length === 1 && rg[0][0] !== s);
    if (!single.length) continue;
    const [os, oa] = single[Math.floor(r() * single.length)][0];
    const key = [s, ay, os, oa].join(':'); if (used.has(key)) continue;
    const a = (await loadSurah(s)).ayat[ay - 1].t; const b = (await loadSurah(os)).ayat[oa - 1].t;
    if (strip(a) === strip(b) || a.length > 420 || b.length > 420) continue;
    used.add(key);
    const flip = r() < 0.5;
    out.push({ surah: s, ayah: ay, other: [os, oa], options: flip ? [b, a] : [a, b], answer: flip ? 1 : 0 });
  }
  return out;
}
export const surahName = (n: number) => SURAHS[n - 1].name;
