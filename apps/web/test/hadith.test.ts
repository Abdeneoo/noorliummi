import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normHadith } from '../src/lib/hadith';
import { collections, sunnahEnabled } from '../src/lib/sunnah';

const src = resolve(__dirname, '../../../database/sources/hadith-fawazahmed0');
const all = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/hadith/books.json'), 'utf8')) as { key: string; count: number; empty: number; sections: { s: number; count: number }[]; doc: { source?: string; edition?: string; license?: string } }[];
const books = all.filter((b) => b.doc.source !== 'openiti');

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

describe('OpenITI books (Musnad Ahmad, Darimi)', () => {
  it.each(['ahmad', 'darimi'] as const)('%s: no Arabic letter lost, edition from the file header, no grades', async (key) => {
    const { parseOpenITI, arabicLetters } = await import('../src/lib/openiti');
    const raw = readFileSync(resolve(__dirname, `../../../database/sources/hadith-openiti/files/${key}.txt`), 'utf8');
    const p = parseOpenITI(raw, key);
    const out = p.items.map((x) => ('h' in x ? x.h : 'u' in x ? x.u : x.t)).join('');
    // Every Arabic letter of the body is either shown or in the short pre-hadith preamble (book chain, basmala).
    expect(arabicLetters(out).length + arabicLetters(p.skipped.join('')).length).toBe(arabicLetters(p.body).length);
    expect(arabicLetters(p.skipped.join(''))).toBe(''); // only marker lines are dropped
    const b = all.find((x) => x.key === key)!;
    const gen = b.sections.flatMap((s) => JSON.parse(readFileSync(resolve(__dirname, `../src/generated/hadith/${key}/${s.s}.json`), 'utf8')) as Record<string, unknown>[]);
    const hs = gen.filter((x) => 't' in x);
    expect(hs.length).toBe(p.items.filter((x) => 'n' in x).length); expect(b.count).toBe(hs.length);
    for (const h of hs) { expect(Object.keys(h).every((k) => ['n', 'an', 't', 'm', 'l'].includes(k))).toBe(true); expect(String(h.t)).not.toMatch(/PageV|ms\d|~~|\(\d+\)/); }
    for (const s of b.sections) expect(s.count).toBeLessThanOrEqual(200);
    expect(b.doc.license).toBe('CC BY-NC-SA 4.0');
    expect(b.doc.edition).toContain(key === 'ahmad' ? 'مؤسسة الرسالة' : 'دار الكتاب العربي');
  });
  it('counts', () => {
    expect(all.find((b) => b.key === 'ahmad')!.count).toBe(27637);
    expect(all.find((b) => b.key === 'darimi')!.count).toBe(3513);
  });
});
