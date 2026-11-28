import 'server-only';
import { db } from './db';
/**
 * Lessons from IslamHouse.com through its API v3. Its published republishing policy (README_AR of the IslamHouse API hub,
 * read 2026-11-26) allows use in apps and sites without prior permission provided the text is not modified and the
 * source, author and publisher are named. We show items as they are, stream attachments from IslamHouse's own servers,
 * and link back to the item. Lists are cached for six hours. The key below is IslamHouse's public developer key.
 */
const KEY = process.env.ISLAMHOUSE_KEY || 'paV29H2gm56kvLP';
const BASE = `https://api3.islamhouse.com/v3/${KEY}/main`;
export interface IhPerson { id: number; title: string; kind?: string; description?: string | null }
export interface IhAttachment { order: number; size: string; extension_type: string; description: string | null; url: string }
export interface IhItem { id: number; title: string; type: string; add_date: number; update_date?: number; description: string | null; full_description?: string | null; prepared_by?: IhPerson[]; attachments?: IhAttachment[]; source_language?: string }
export interface IhList { data: IhItem[]; links: { current_page: number; pages_number: number; total_items: number } }
export interface IhCat { id: number; title: string; description?: string | null; sub_categories?: IhCat[] }
export const TYPES = { audios: 'صوتيات', videos: 'مرئيات', books: 'كتب', articles: 'مقالات', fatwa: 'فتاوى' } as const;
export type IhType = keyof typeof TYPES | 'showall';
async function get<T>(path: string): Promise<T | null> {
  try { const r = await fetch(`${BASE}/${path}`, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(12000) }); if (!r.ok) return null; const j = await r.json(); return j && !j.error ? (j as T) : null; } catch { return null; }
}
/** Moderator controls (site_settings): 'lessons.off' = '1' closes the section; 'lessons.hidden' = ids of hidden items/categories/authors. Cached one minute. */
let ctl: { off: boolean; hidden: Set<number>; at: number } | null = null;
export async function lessonControl() {
  if (ctl && Date.now() - ctl.at < 60_000) return ctl;
  const c = { off: false, hidden: new Set<number>(), at: Date.now() };
  try { const r = await db().query<{ key: string; value: string }>("SELECT key, value FROM site_settings WHERE key IN ('lessons.off','lessons.hidden')"); for (const x of r.rows) { if (x.key === 'lessons.off') c.off = x.value === '1'; else for (const v of x.value.split(',')) { const n = Number(v); if (Number.isInteger(n) && n > 0) c.hidden.add(n); } } } catch { /* defaults */ }
  return (ctl = c);
}
export const resetLessonControl = () => { ctl = null; };
const okUrl = (u: string) => /^https:\/\/[a-z0-9.-]*islamhouse\.com\//i.test(u);
const cleanItem = (x: IhItem): IhItem => ({ ...x, attachments: (x.attachments ?? []).filter((a) => okUrl(a.url)) });
async function vis(l: IhList | null): Promise<IhList | null> { if (!l) return null; const c = await lessonControl(); if (c.off) return null; return { ...l, data: l.data.filter((x) => !c.hidden.has(x.id) && !(x.prepared_by ?? []).some((p) => c.hidden.has(p.id))).map(cleanItem) }; }
const pruneTree = (t: IhCat, h: Set<number>): IhCat => ({ ...t, sub_categories: (t.sub_categories ?? []).filter((c) => !h.has(c.id)).map((c) => pruneTree(c, h)) });
export async function categories() { const c = await lessonControl(); if (c.off) return null; const t = await get<IhCat>('get-categories-tree/ar/json'); return t ? pruneTree(t, c.hidden) : null; }
export async function categoryItems(cat: number, type: IhType, page: number, per = 20) { if ((await lessonControl()).hidden.has(cat)) return null; return vis(await get<IhList>(`get-category-items/${cat}/${type}/ar/ar/${page}/${per}/json`)); }
export async function latest(type: IhType, page = 1, per = 12) { return vis(await get<IhList>(`${type}/ar/ar/${page}/${per}/json`)); }
export async function item(id: number) { const c = await lessonControl(); if (c.off || c.hidden.has(id)) return null; const x = await get<IhItem>(`get-item/${id}/ar/json`); if (!x || (x.prepared_by ?? []).some((p) => c.hidden.has(p.id))) return null; return cleanItem(x); }
export async function author(id: number) { const c = await lessonControl(); return c.off || c.hidden.has(id) ? null : get<IhPerson>(`get-author/${id}/ar/json`); }
export async function authorItems(id: number, page: number, per = 20) { if ((await lessonControl()).hidden.has(id)) return null; return vis(await get<IhList>(`get-author-items/${id}/showall/ar/ar/${page}/${per}/json`)); }
export function findCat(tree: IhCat | null, id: number): IhCat | null { if (!tree) return null; if (tree.id === id) return tree; for (const c of tree.sub_categories ?? []) { const f = findCat(c, id); if (f) return f; } return null; }
/** English audio lessons (IslamHouse, written approval 26 Nov 2026), latest first, with their files. */
export async function latestEnAudios(per = 12) {
  if ((await lessonControl()).off) return null;
  const l = await get<IhList>(`audios/en/en/1/${per}/json`); if (!l) return null;
  const items = await Promise.all(l.data.map((x) => get<IhItem>(`get-item/${x.id}/en/json`)));
  return items.filter((x): x is IhItem => !!x && (x.attachments ?? []).some((a) => /mp3/i.test(a.extension_type) || /\.mp3$/i.test(a.url)));
}
export const sourceUrl = (x: { id: number; type: string }) => `https://islamhouse.com/ar/${x.type}/${x.id}/`;
/** Topics the owner asked for, mapped to IslamHouse's own category ids (from its category tree). */
export const FEATURED: [number, string][] = [[192525, 'العقيدة'], [199946, 'الفقه'], [5366, 'العبادات'], [728011, 'التفسير'], [344947, 'شروح السنة'], [795, 'السيرة النبوية'], [192527, 'الآداب'], [729107, 'فضائل الأخلاق'], [398209, 'الأسرة'], [179666, 'ما يحتاجه المسلم الجديد'], [797, 'ضيوف الرحمن (الحج والعمرة)'], [5392, 'مناسبات دورية (رمضان والمواسم)'], [200217, 'الرقائق والمواعظ'], [766, 'طلاب العلم المبتدئين'], [729106, 'فضائل العبادات'], [728014, 'الدعاء']];
