import 'server-only';
import { libBook, loadLibSection } from './library';
/**
 * «أحيِ سنة»: 52 chapters of Riyad al-Salihin on recommended acts (chapter numbers of the site's edition), one per week.
 * Each week shows the chapter's first hadith exactly as in the book, with its number.
 */
export const WEEKLY = [216, 132, 100, 101, 207, 145, 89, 95, 112, 110, 102, 128, 247, 249, 252, 187, 209, 210, 186, 197, 206, 213, 211, 204, 205, 230, 231, 228, 229, 222, 223, 143, 144, 136, 141, 127, 40, 75, 85, 96, 98, 99, 167, 173, 179, 183, 185, 212, 245, 372, 163, 67];
/** Week index since a fixed Saturday (2026-01-03), so every visitor sees the same sunnah in the same week. */
export const weekNo = (d = new Date()) => Math.floor((d.getTime() - Date.UTC(2026, 0, 3)) / (7 * 86400000));
export const weekIdx = (d = new Date()) => ((weekNo(d) % WEEKLY.length) + WEEKLY.length) % WEEKLY.length;
export async function sunnahAt(k: number) {
  const i = WEEKLY[k]; const b = libBook('riyad'); const sec = b?.sections.find((s) => s.i === i);
  const s = await loadLibSection('riyad', i) as unknown as { title: string; blocks: ({ n?: string; p?: string })[] };
  const at = s.blocks.findIndex((x) => x.n); const n = at >= 0 ? s.blocks[at].n : undefined; const text = s.blocks.slice(at + 1).find((x) => x.p)?.p ?? '';
  return { k, i, title: (sec?.title ?? s.title).replace(/^\s*\d+\s*[-–]\s*/, ''), n, text, href: `/library/riyad/${i}` };
}
