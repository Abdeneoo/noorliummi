import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normHadith } from '../src/lib/hadith';
import { collections, sunnahEnabled } from '../src/lib/sunnah';

const src = resolve(__dirname, '../../../database/sources/hadith-fawazahmed0');
const books = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/hadith/books.json'), 'utf8')) as { key: string; count: number; empty: number; sections: { s: number }[] }[];

describe('hadith books equal the source', () => {
  it.each(books.map((b) => b.key))('%s: every non-empty hadith appears once, text identical, no grades written', (key) => {
    const raw = JSON.parse(readFileSync(`${src}/files/ara-${key}.json`, 'utf8')) as { hadiths: { hadithnumber: number; arabicnumber: number; text: string }[] };
    const b = books.find((x) => x.key === key)!;
    const gen = b.sections.flatMap((s) => JSON.parse(readFileSync(resolve(__dirname, `../src/generated/hadith/${key}/${s.s}.json`), 'utf8')) as { n: number; an: number; t: string; grades?: unknown }[]);
    const want = raw.hadiths.filter((h) => h.text.trim());
    expect(gen.length).toBe(want.length); expect(b.count).toBe(want.length); expect(b.empty).toBe(raw.hadiths.length - want.length);
    const byKey = new Map(gen.map((g) => [`${g.n}|${g.an}|${g.t}`, g]));
    for (const h of want) expect(byKey.has(`${h.hadithnumber}|${h.arabicnumber}|${h.text}`)).toBe(true);
    for (const g of gen) { expect(['an', 'n', 't']).toEqual(expect.arrayContaining(Object.keys(g))); expect(g.t).toBeTruthy(); }
  });
  it('total and editions documentation present for every book', () => {
    const docs = JSON.parse(readFileSync(`${src}/editions.json`, 'utf8')).books;
    for (const b of books) expect(docs[b.key]?.ar).toBeTruthy();
    expect(books.reduce((t, b) => t + b.count, 0)).toBe(36062);
  });
});

describe('search key and sunnah adapter', () => {
  it('normalises diacritics and hamza forms', () => { expect(normHadith('إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ')).toBe('انما الاعمال بالنيات'); });
  it('adapter is off without a key and refuses to call', async () => {
    expect(sunnahEnabled({})).toBe(false); expect(sunnahEnabled({ SUNNAH_API_KEY: '  ' })).toBe(false);
    await expect(collections({})).rejects.toThrow(/disabled/);
  });
});
