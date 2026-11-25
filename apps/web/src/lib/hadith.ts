import books from '@/generated/hadith/books.json';
export interface HadithDoc { ar: string; author: string; numbering: string; arabic_number_label?: string; collated: string | null; agreement: string | null; report: string | null }
export interface HadithSection { s: number; en: string; count: number }
export interface HadithBook { key: string; en: string; count: number; empty: number; sections: HadithSection[]; doc: HadithDoc }
export interface Hadith { n: number; an: number; t: string }
export const BOOKS = books as HadithBook[];
export const ORDER = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'qudsi', 'dehlawi'];
export const sortedBooks = () => [...BOOKS].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
export const bookOf = (k: string) => BOOKS.find((b) => b.key === k);
export async function loadSection(book: string, s: number): Promise<Hadith[]> {
  return (await import(`@/generated/hadith/${book}/${s}.json`)).default as Hadith[];
}
export const sectionLabel = (sec: HadithSection, list: Hadith[] | null = null) =>
  sec.s === 0 ? `قسم بلا عنوان في المصدر${list?.length ? ` (${list[0].n}–${list[list.length - 1].n})` : ''}` : `الكتاب ${sec.s}`;
/** Search key only (never displayed). */
export const normHadith = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^ء-ي0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
