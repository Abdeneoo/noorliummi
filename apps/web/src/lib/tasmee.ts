/**
 * «التسميع»: compares what the speech recogniser heard with the ayah, word by word. Pure and unit-tested.
 * Comparison ignores diacritics and hamza/alef spelling, because recognisers return plain modern spelling.
 */
export const plain = (w: string) => w.replace(/ٰ/g, 'ا').replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '')
  .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^ء-ي]/g, '');
// Uthmani spelling drops some alefs (ٱلصَّلَوٰةَ / الصلاة, ٱلْكِتَٰبُ / الكتاب): compare with alef, waw and ya removed too.
const skeleton = (w: string) => plain(w).replace(/[اوي]/g, '');
const same = (a: string, b: string) => plain(a) === plain(b) || (skeleton(a).length >= 2 && skeleton(a) === skeleton(b));

export interface WordResult { w: string; ok: boolean }
/** Longest-common-subsequence alignment: each ayah word is ok if it was heard in order; extra heard words are counted. */
export function compare(ayah: string, heard: string): { words: WordResult[]; missed: number; extra: number; score: number } {
  const A = ayah.split(/\s+/).filter((w) => plain(w)); const H = heard.split(/\s+/).filter((w) => plain(w));
  const n = A.length, m = H.length; const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = same(A[i], H[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const words: WordResult[] = []; let i = 0, j = 0;
  while (i < n) {
    if (j < m && same(A[i], H[j])) { words.push({ w: A[i], ok: true }); i++; j++; }
    else if (j < m && L[i][j + 1] >= L[i + 1][j]) j++;
    else { words.push({ w: A[i], ok: false }); i++; }
  }
  const hit = words.filter((x) => x.ok).length;
  return { words, missed: n - hit, extra: Math.max(0, m - hit), score: n ? hit / n : 0 };
}
