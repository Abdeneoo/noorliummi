import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseTanzilText } from '../../../packages/islamic-core/src/index';

describe('reader data equals the Tanzil source', () => {
  const src = parseTanzilText(readFileSync(resolve(__dirname, '../../../database/sources/tanzil/uthmani.xml'), 'utf8'));
  it('every ayah in the generated JSON is character-identical to the source', () => {
    let i = 0;
    for (let n = 1; n <= 114; n++) {
      const j = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/surah/${n}.json`), 'utf8'));
      for (const a of j.ayat) {
        expect(src[i].sura).toBe(n); expect(src[i].aya).toBe(a.n); expect(a.t).toBe(src[i].text); i++;
      }
    }
    expect(i).toBe(6236);
  });
});

describe('adhkar data equals the source', () => {
  it('every entry is identical to hisn.json (text, count, reference)', () => {
    const raw = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/hisn-al-muslim/hisn.json'), 'utf8')) as Record<string, { Adhkar: { Text: string; Count: number; Reference?: string }[] }>;
    const titles = Object.keys(raw); let n = 0;
    titles.forEach((title, i) => {
      const g = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/adhkar/${i + 1}.json`), 'utf8'));
      expect(g.title).toBe(title); expect(g.items.length).toBe(raw[title].Adhkar.length);
      g.items.forEach((it: { t: string; c: number; r: string }, j: number) => {
        const s = raw[title].Adhkar[j];
        expect(it.t).toBe(s.Text.replace(/\r\n/g, '\n')); expect(it.c).toBe(s.Count); expect(it.r).toBe(s.Reference ?? ''); n++;
      });
    });
    expect(titles.length).toBe(133); expect(n).toBe(302);
  });
});

describe('adhan registry', () => {
  it('publishes only licensed, self-hostable recordings with attribution', () => {
    const pub = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/adhan-registry.json'), 'utf8'));
    for (const s of pub) { expect(s.license).toMatch(/^CC/); expect(s.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//); expect(s.by.length).toBeGreaterThan(0); }
  });
});
