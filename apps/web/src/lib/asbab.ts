import { libBook } from './library';
import { SURAHS } from './quran';
/** Surah → section of each asbab al-nuzul book (al-Suyuti's «لباب النقول», al-Wahidi's «أسباب نزول القرآن»), by the books' own headings. */
const norm = (s: string) => s.replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/^سوره\s+/, '').replace(/\s+/g, ' ').trim();
const ALIAS: Record<string, string> = { 'براءه': 'التوبه', 'الانفال': 'الانفال', 'بني اسرائيل': 'الاسراء', 'المؤمن': 'غافر', 'حم السجده': 'فصلت', 'الدهر': 'الانسان', 'هل اتي': 'الانسان', 'الملائكه': 'فاطر', 'سبحان': 'الاسراء', 'تبارك': 'الملك', 'ن': 'القلم', 'عم': 'النبا', 'الم نشرح لك': 'الشرح', 'الم نشرح': 'الشرح' };
const MULTI: Record<string, string[]> = { 'المعوذتين': ['الفلق', 'الناس'] };
export const ASBAB_BOOKS = ['lubab', 'wahidi'] as const;
export function asbabFor(surah: number): { book: (typeof ASBAB_BOOKS)[number]; title: string; i: number }[] {
  const want = norm(SURAHS[surah - 1]?.name ?? ''); const out: { book: (typeof ASBAB_BOOKS)[number]; title: string; i: number }[] = [];
  for (const k of ASBAB_BOOKS) {
    const b = libBook(k); if (!b) continue;
    const s = b.sections.find((x) => { if (!/^سور/.test(x.title)) return false; const t = norm(x.title.replace(/\(.*?\)/g, '')); return (ALIAS[t] ?? t) === want || t === want || (MULTI[t] ?? []).includes(want); });
    if (s) out.push({ book: k, title: b.ar, i: s.i });
  }
  return out;
}
