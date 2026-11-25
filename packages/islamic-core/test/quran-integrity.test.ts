import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractCopyrightBlock, normalizeForSearch, parseTanzilMetadata, parseTanzilText, sha256File } from '../src';

const dir = resolve(__dirname, '../../../database/sources/tanzil');
const sums = Object.fromEntries(
  readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split('\n').map((l) => { const [h, f] = l.split(/\s+/); return [f, h]; }),
);

describe('Quran integrity (Tanzil)', () => {
  for (const f of ['uthmani.xml', 'simple-clean.xml', 'quran-data.xml']) {
    it(`${f} matches the recorded checksum (unaltered)`, () => {
      expect(sha256File(`${dir}/${f}`)).toBe(sums[f]);
    });
  }
  const meta = parseTanzilMetadata(readFileSync(`${dir}/quran-data.xml`, 'utf8'));
  for (const edition of ['uthmani.xml', 'simple-clean.xml']) {
    const xml = readFileSync(`${dir}/${edition}`, 'utf8');
    const ayat = parseTanzilText(xml);
    it(`${edition}: 114 suras, 6236 ayat, counts match metadata`, () => {
      expect(meta).toHaveLength(114);
      expect(ayat).toHaveLength(6236);
      for (const m of meta) {
        const inSura = ayat.filter((a) => a.sura === m.index);
        expect(inSura.length, `sura ${m.index}`).toBe(m.ayas);
        inSura.forEach((a, i) => expect(a.aya).toBe(i + 1));
      }
    });
    it(`${edition}: suras are in order 1..114 and no empty ayah`, () => {
      let prev = 0;
      for (const a of ayat) { expect(a.sura).toBeGreaterThanOrEqual(prev); prev = a.sura; expect(a.text.length).toBeGreaterThan(0); }
    });
    it(`${edition}: copyright block is present`, () => {
      expect(extractCopyrightBlock(xml)).toMatch(/Tanzil Project/);
      expect(extractCopyrightBlock(xml)).toMatch(/CHANGING IT IS NOT ALLOWED/);
    });
  }
  it('metadata: known sura facts', () => {
    expect(meta[0]).toMatchObject({ index: 1, ayas: 7, name: 'الفاتحة' });
    expect(meta[1]).toMatchObject({ index: 2, ayas: 286 });
    expect(meta[113]).toMatchObject({ index: 114, ayas: 6 });
  });
  it('search normalisation makes the two editions comparable for search only', () => {
    const u = parseTanzilText(readFileSync(`${dir}/uthmani.xml`, 'utf8'));
    expect(normalizeForSearch(u[1].text)).toContain('الحمد');
  });
});
