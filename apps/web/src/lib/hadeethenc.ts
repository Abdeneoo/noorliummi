import 'server-only';
/**
 * HadeethEnc.com — Encyclopedia of Translated Prophetic Hadiths (public API v1, no key). Its publisher's republishing policy
 * (IslamHouse API hub README_AR, read 2026-11-26) allows use without prior permission provided the text is shown unmodified
 * with the source named. We show the Arabic record and the chosen translation verbatim, cached six hours, with a link back.
 */
const BASE = 'https://hadeethenc.com/api/v1';
export const HE_LANGS = { en: { name: 'English', dir: 'ltr' }, ur: { name: 'اردو', dir: 'rtl' }, tr: { name: 'Türkçe', dir: 'ltr' }, id: { name: 'Bahasa Indonesia', dir: 'ltr' }, fr: { name: 'Français', dir: 'ltr' }, es: { name: 'Español', dir: 'ltr' }, ru: { name: 'Русский', dir: 'ltr' }, bn: { name: 'বাংলা', dir: 'ltr' } } as const;
export type HeLang = keyof typeof HE_LANGS;
export const isHeLang = (v: unknown): v is HeLang => typeof v === 'string' && v in HE_LANGS;
export interface HeCat { id: string; title: string; hadeeths_count: string; parent_id: string | null }
export interface HeItem { id: string; title: string; translations: string[] }
export interface HeHadith { id: string; title: string; hadeeth: string; attribution: string; grade: string; explanation: string; hints: string[]; words_meanings?: { word: string; meaning: string }[]; reference?: string; categories: string[]; translations: string[] }
async function get<T>(path: string): Promise<T | null> {
  try { const r = await fetch(`${BASE}/${path}`, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(12000) }); if (!r.ok) return null; return (await r.json()) as T; } catch { return null; }
}
export const heCategories = (lang: 'ar' | HeLang = 'ar') => get<HeCat[]>(`categories/list/?language=${lang}`);
export const heList = (cat: number, page: number, lang: 'ar' | HeLang = 'ar') => get<{ data: HeItem[]; meta: { current_page: string; last_page: number; total_items: number } }>(`hadeeths/list/?language=${lang}&category_id=${cat}&page=${page}&per_page=20`);
export const heOne = (id: number, lang: 'ar' | HeLang = 'ar') => get<HeHadith>(`hadeeths/one/?language=${lang}&id=${id}`);
export const heSource = (id: string | number, lang = 'ar') => `https://hadeethenc.com/${lang}/browse/hadith/${id}`;
const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/\r/g, '').trim() : '');
export const tidy = (h: HeHadith): HeHadith => ({ ...h, title: clean(h.title), hadeeth: clean(h.hadeeth), attribution: clean(h.attribution), grade: clean(h.grade), explanation: clean(h.explanation), hints: (h.hints ?? []).map(clean).filter(Boolean), reference: clean(h.reference) });
