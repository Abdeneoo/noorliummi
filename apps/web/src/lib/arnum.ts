/** Arabic-Indic digits for Arabic pages (one numeral system everywhere). */
export const arDigitsN = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
/**
 * Number + counted noun following Arabic grammar:
 * 1 → «آية واحدة», 2 → «آيتان», 3–10 → «٣ آيات», 11–99 → «١١ آيةً» (tamyiz singular), 100+ → «١٠٠ آية».
 * forms: [singular, dual, plural, tamyiz (accusative singular)].
 */
export function arCount(n: number, [one, two, plural, tamyiz]: [string, string, string, string], oneWord = 'واحد') {
  if (n === 1) return `${one} ${oneWord}`;
  if (n === 2) return two;
  const k = n % 100;
  if (k >= 3 && k <= 10) return `${arDigitsN(n)} ${plural}`;
  if (k >= 11 && k <= 99) return `${arDigitsN(n)} ${tamyiz}`;
  return `${arDigitsN(n)} ${one}`;
}
export const AYAH: [string, string, string, string] = ['آية', 'آيتان', 'آيات', 'آيةً'];
export const DHIKR: [string, string, string, string] = ['ذكر', 'ذكران', 'أذكار', 'ذكرًا'];
export const BOOK: [string, string, string, string] = ['كتاب', 'كتابان', 'كتب', 'كتابًا'];
export const ayat = (n: number) => arCount(n, AYAH, 'واحدة');
export const MARRA: [string, string, string, string] = ['مرة', 'مرتان', 'مرات', 'مرةً'];
