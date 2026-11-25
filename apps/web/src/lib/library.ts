import index from '@/generated/library/index.json';
import type { Section } from './openiti-book';
export interface LibBook { key: string; ar: string; author: string; title_full?: string; edition: string; source_uri: string; license: string; sections: { i: number; title: string; group?: string; n: number }[] }
export const LIBRARY = index as LibBook[];
export const libBook = (k: string) => LIBRARY.find((b) => b.key === k);
export async function loadLibSection(book: string, i: number): Promise<Section> { return (await import(`@/generated/library/${book}/${i}.json`)).default as Section; }
