import surahs from '@/generated/surahs.json';
export interface SurahMeta { index: number; ayas: number; name: string; tname: string; ename: string; type: string; order: number }
export const SURAHS = surahs as SurahMeta[];
export interface SurahData { meta: SurahMeta; bismillah: string | null; ayat: { n: number; t: string }[] }
export async function loadSurah(n: number): Promise<SurahData> {
  return (await import(`@/generated/surah/${n}.json`)).default as SurahData;
}
/** Display-only: ayah number in Arabic-Indic digits. */
export const arDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export async function loadJalalayn(n: number): Promise<Record<string, string>> {
  return (await import(`@/generated/tafsir/jalalayn/${n}.json`)).default as Record<string, string>;
}

/** Related ayat (mutashabihat) for each ayah of a surah: ayah -> list of ranges of [sura, ayah]. */
export async function loadMutashabihat(n: number): Promise<Record<string, [number, number][][]>> {
  return (await import(`@/generated/mutashabihat/${n}.json`)).default as Record<string, [number, number][][]>;
}
