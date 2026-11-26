import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
/** IslamHouse Quran albums (136 complete or near-complete recitations), streamed from d1.islamhouse.com. */
export interface Album { id: number; title: string; description: string; url: string; by: { id: number; title: string; kind: string }[]; files: { n: number; size: string; url: string; d: string }[] }
let A: Album[] | null = null;
export const albums = (): Album[] => (A ??= (JSON.parse(readFileSync(join(process.cwd(), 'src/generated/ih-quran/albums.json'), 'utf8')) as { albums: Album[] }).albums);
export const album = (id: number) => albums().find((a) => a.id === id);
export const readers = (a: Album) => a.by.filter((b) => b.kind === 'author').map((b) => b.title);
export const producers = (a: Album) => a.by.filter((b) => b.kind !== 'author').map((b) => b.title);
export const isHaramain = (a: Album) => /الحرم|المكي|النبوي|تراويح/.test(a.title);
