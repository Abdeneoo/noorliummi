import { SURAHS, loadSurah } from './quran';
/** «آية اليوم»: one complete ayah per date (60–320 letters, so it reads on its own), the same for everyone. */
export async function ayahOfDay(date: string) {
  let h = 2166136261; for (const c of date) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  for (let k = 0; k < 50; k++) {
    const s = 1 + ((h + k * 7919) % 114); const { ayat } = await loadSurah(s);
    const pool = ayat.filter((a) => a.t.length >= 60 && a.t.length <= 320);
    if (pool.length) { const a = pool[(h >>> 8) % pool.length]; return { s, a: a.n, t: a.t, name: SURAHS[s - 1].name }; }
  }
  return { s: 1, a: 2, t: (await loadSurah(1)).ayat[1].t, name: SURAHS[0].name };
}
