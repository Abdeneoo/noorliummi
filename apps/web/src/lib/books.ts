import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
/** Books chosen by the owner, imported verbatim from IslamHouse (phrase-aligned, with the publisher's own translations). */
export type BookLang = 'ur' | 'tr' | 'id';
export interface BookMeta { id: number; slug: string; title: string; author: string; langs: BookLang[]; source: string; chapters: { n: number; title: string; tr: Partial<Record<BookLang, string>>; blocks: number }[] }
export interface Chapter { url?: string; topic?: string; title: string; tr: Partial<Record<BookLang, string>>; blocks: { tag: string; ar: string; tr: Partial<Record<BookLang, string>> }[] }
const dir = join(process.cwd(), 'src/generated/books');
export const bookList = (): { slug: string; id: number; title: string; author: string; langs: BookLang[]; chapters: number; blocks: number }[] => (existsSync(join(dir, 'index.json')) ? JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) : []);
export function bookMeta(slug: string): BookMeta | null { if (!/^[a-z-]+$/.test(slug)) return null; const f = join(dir, slug, 'index.json'); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; }
export function chapter(slug: string, n: number): Chapter | null { if (!/^[a-z-]+$/.test(slug) || !Number.isInteger(n) || n < 1) return null; const f = join(dir, slug, `${n}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; }
export const BOOK_LANGS: Record<BookLang, { name: string; dir: 'rtl' | 'ltr' }> = { ur: { name: 'اردو', dir: 'rtl' }, tr: { name: 'Türkçe', dir: 'ltr' }, id: { name: 'Indonesia', dir: 'ltr' } };
