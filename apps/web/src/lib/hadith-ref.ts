import 'server-only';
import { isHadith, loadSection } from './hadith';
/** A hadith by book and number from the site's own collections, with the section it lives in (for linking). */
export async function hadithRef(book: string, s: number, n: number) {
  const h = (await loadSection(book, s)).find((x) => isHadith(x) && x.n === n);
  if (!h || !isHadith(h)) throw new Error(`hadith ${book} ${s}/${n} not found`);
  return { book, s, n, t: h.t, href: `/hadith/${book}/${s}#h${n}` };
}
export const BOOK_AR: Record<string, string> = { bukhari: 'صحيح البخاري', muslim: 'صحيح مسلم', abudawud: 'سنن أبي داود' };
