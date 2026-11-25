/** Matching key only (never displayed): Arabic letters without diacritics, tatweel or punctuation. */
export function normDhikr(s: string): string {
  return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[^\u0621-\u064A ]/g, ' ').replace(/\s+/g, ' ').trim();
}
