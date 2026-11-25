import { SURAHS, loadSurah } from './quran';
import { norm } from './topics';
/**
 * «ذكر الأنبياء في القرآن»: for each prophet named in the Quran, the ayat where the name occurs — found by an exact
 * word search in the mushaf text, shown in mushaf order. No story is written here; the ayat speak for themselves.
 * `count` is the well-known number of times the name occurs, used by the test to verify the search.
 */
export interface Prophet { id: string; name: string; re: RegExp; count: number; skip?: string[] }
const P = '(?:[وفبلك]|ول|فل|يا|ويا|فيا|ا)?';
const mk = (id: string, name: string, core: string, count: number, skip?: string[]): Prophet => ({ id, name, re: new RegExp(`^${P}(?:${core})$`), count, skip });
export const PROPHETS: Prophet[] = [
  mk('adam', 'آدم', 'ءادم|ادم', 25), mk('idris', 'إدريس', 'ادريس', 2), mk('nuh', 'نوح', 'نوح|نوحا', 43), mk('hud', 'هود', 'هود|هودا', 7, ['2:111', '2:135', '2:140']),
  mk('lut', 'لوط', 'لوط|لوطا', 27), mk('ibrahim', 'إبراهيم', 'ابراهي?م', 69), mk('ismail', 'إسماعيل', 'اسماعيل', 12), mk('ishaq', 'إسحاق', 'اسحاق', 17),
  mk('yaqub', 'يعقوب', 'يعقوب', 16), mk('yusuf', 'يوسف', 'يوسف', 27), mk('shuayb', 'شعيب', 'شعيب|شعيبا', 11), mk('ayyub', 'أيوب', 'ايوب', 4),
  mk('musa', 'موسى', 'موسي|موسيا', 136), mk('harun', 'هارون', 'هارون', 20), mk('dawud', 'داود', 'داود|داوود', 16), mk('sulayman', 'سليمان', 'سليمان', 17),
  mk('yunus', 'يونس', 'يونس', 4), mk('ilyas', 'إلياس', 'الياس', 2), mk('alyasa', 'اليسع', 'اليسع', 2), mk('zakariyya', 'زكريا', 'زكريا', 7),
  mk('isa', 'عيسى', 'عيسي|عيسيا', 25), mk('muhammad', 'محمد ﷺ', 'محمد|محمدا', 4),
];
export async function prophetAyat(p: Prophet) {
  const out: { s: number; a: number; text: string; hits: number }[] = [];
  for (const s of SURAHS) for (const a of (await loadSurah(s.index)).ayat) {
    if (p.skip?.includes(`${s.index}:${a.n}`)) continue;
    const hits = a.t.split(/\s+/).filter((w) => p.re.test(norm(w))).length; if (hits) out.push({ s: s.index, a: a.n, text: a.t, hits });
  }
  return out;
}
