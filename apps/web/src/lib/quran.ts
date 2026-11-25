import surahs from '@/generated/surahs.json';
export interface SurahMeta { index: number; ayas: number; name: string; tname: string; ename: string; type: string; order: number }
export const SURAHS = surahs as SurahMeta[];
export interface SurahData { meta: SurahMeta; bismillah: string | null; ayat: { n: number; t: string }[] }
export async function loadSurah(n: number): Promise<SurahData> {
  return (await import(`@/generated/surah/${n}.json`)).default as SurahData;
}
/** Display-only: ayah number in Arabic-Indic digits. */
export const arDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
