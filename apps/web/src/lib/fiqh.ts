import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** al-Fiqh al-Muyassar (generated from the IslamHouse content snapshot; see scripts/build-quran-json.ts). */
const dir = join(process.cwd(), 'src/generated/fiqh/muyassar');
export interface Bab { n: number; title: string; masail: string[] }
export interface Kitab { slug: string; title: string; intro: string[]; abwab: Bab[] }
export interface FiqhIndex { title: string; by: string; publisher: string; source: string; cnt: string; kitabs: Kitab[] }
export interface BabText { kitab: string; n: number; title: string; blocks: { tag: string; ar: string }[] }
let idx: FiqhIndex | null = null;
export const fiqhIndex = (): FiqhIndex => (idx ??= JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')));
export const kitab = (slug: string) => fiqhIndex().kitabs.find((k) => k.slug === slug) ?? null;
export function bab(n: number): BabText | null { if (!Number.isInteger(n) || n < 0 || n > 999) return null; const f = join(dir, `${n}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; }
export const allAbwab = () => fiqhIndex().kitabs.flatMap((k) => k.abwab.map((b) => ({ ...b, kitab: k.slug, kitabTitle: k.title })));
/** Worship books shown first; the rest of the book follows. */
export const IBADAT = ['taharah', 'salah', 'zakat', 'siyam', 'hajj'];
/** Books in /books that belong with each part. */
export const COMPANIONS: Record<string, { slug: string; note: string }[]> = {
  taharah: [{ slug: 'ahkam-fiqhiyya', note: 'الطهارة والصلاة والجنائز — ابن عثيمين' }],
  salah: [{ slug: 'how-to-pray', note: 'الدليل العملي خطوة بخطوة — ابن باز' }, { slug: 'ahkam-fiqhiyya', note: 'الطهارة والصلاة والجنائز — ابن عثيمين' }],
  siyam: [{ slug: 'fusul-siyam', note: 'الصيام والتراويح والزكاة — ابن عثيمين' }, { slug: 'ahkam-siyam', note: 'عشرة مباحث في أحكام الصيام' }, { slug: 'fasting-fatawa', note: 'فتاوى صوم التطوع' }, { slug: 'binbaz-fasting', note: 'فتاوى ابن باز في صيام التطوع' }],
  zakat: [{ slug: 'fusul-siyam', note: 'فيه فصول الزكاة وزكاة الفطر — ابن عثيمين' }],
  hajj: [{ slug: 'manasik', note: 'التحقيق والإيضاح — ابن باز' }, { slug: 'sifat-al-hajj', note: 'صفة الحج — ابن عثيمين' }, { slug: 'hajj-mistakes', note: 'أخطاء يرتكبها بعض الحجاج' }],
};
/** Arabic search normalisation (diacritics, alef/ya/ta marbuta forms). */
export const normAr = (t: string) => t.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/\s+/g, ' ').trim();
let corpus: { n: number; title: string; kitab: string; i: number; t: string; nt: string }[] | null = null;
export function searchFiqh(q: string, limit = 60) {
  const nq = normAr(q); if (nq.length < 2) return [];
  corpus ??= allAbwab().flatMap((b) => (bab(b.n)?.blocks ?? []).map((x, i) => ({ n: b.n, title: b.title, kitab: b.kitab, i, t: x.ar, nt: normAr(x.ar) })));
  const words = nq.split(' ').filter((w) => w.length > 1);
  const hits = corpus.filter((c) => words.every((w) => c.nt.includes(w)));
  // Headings first, then paragraphs in book order.
  return hits.sort((a, b) => Number(b.t.length < 160 && /^(المسألة|الباب)/.test(b.t)) - Number(a.t.length < 160 && /^(المسألة|الباب)/.test(a.t))).slice(0, limit).map((h) => ({ ...h, total: hits.length }));
}
