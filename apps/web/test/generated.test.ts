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

describe('tafsir data equals the source', () => {
  it('every Jalalayn entry is identical to the source file and attached to the right ayah', () => {
    let n = 0;
    for (let i = 1; i <= 114; i++) {
      const src = JSON.parse(readFileSync(resolve(__dirname, `../../../database/sources/tafsir-jalalayn/${i}.json`), 'utf8')) as { text: string; ayah: number }[];
      const gen = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/tafsir/jalalayn/${i}.json`), 'utf8'));
      expect(Object.keys(gen).length).toBe(src.length);
      for (const r of src) { expect(gen[r.ayah]).toBe(r.text); n++; }
    }
    expect(n).toBe(6010);
  });
});

describe('mutashabihat data', () => {
  it('every source group appears, symmetric, with valid refs', () => {
    const raw = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/mutashabihat/mutashabiha_data.json'), 'utf8')) as Record<string, { src: { ayah: number | number[] }; muts: { ayah: number | number[] }[] }[]>;
    const gen: Record<number, Record<string, number[][][]>> = {};
    for (let i = 1; i <= 114; i++) gen[i] = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/mutashabihat/${i}.json`), 'utf8'));
    const counts = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/surahs.json'), 'utf8')) as { ayas: number }[];
    let groups = 0;
    for (const e of Object.values(raw).flat()) groups++;
    expect(groups).toBe(1348);
    for (let i = 1; i <= 114; i++) for (const [ay, lists] of Object.entries(gen[i])) {
      expect(Number(ay)).toBeGreaterThanOrEqual(1); expect(Number(ay)).toBeLessThanOrEqual(counts[i - 1].ayas);
      for (const rng of lists) for (const [su, a] of rng) { expect(su).toBeGreaterThanOrEqual(1); expect(a).toBeLessThanOrEqual(counts[su - 1].ayas); }
    }
    // symmetry: if A lists B, then B lists A
    for (let i = 1; i <= 114; i++) for (const [ay, lists] of Object.entries(gen[i])) for (const rng of lists) for (const [su, a] of rng) {
      const back = gen[su][String(a)] ?? [];
      expect(back.some((r) => r.some(([s2, a2]) => s2 === i && a2 === Number(ay)))).toBe(true);
    }
  });
});

describe('Nawawi 40 equals the source', () => {
  it('every hadith text is identical', () => {
    const raw = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/hadith-nawawi/ara-nawawi.json'), 'utf8')) as { hadiths: { hadithnumber: number; text: string }[] };
    const g = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/hadith/nawawi.json'), 'utf8')) as { n: number; t: string }[];
    expect(g.length).toBe(42);
    g.forEach((h, i) => { expect(h.n).toBe(raw.hadiths[i].hadithnumber); expect(h.t).toBe(raw.hadiths[i].text); });
  });
});

describe('OpenDua audio mapping', () => {
  it('each attached recording belongs to a dua whose text matches the dhikr exactly (after removing diacritics)', async () => {
    const { normDhikr } = await import('../src/lib/dhikr-norm');
    const cat = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/opendua/catalogue.json'), 'utf8'));
    const byFile = new Map<string, string>();
    for (const e of cat.entries) for (const v of e.variations ?? []) for (const st of v.steps) {
      if (st.items?.length === 1 && st.items[0].dua && st.recordings?.length === 1) byFile.set(st.recordings[0].url.split('/').pop(), normDhikr(st.items[0].dua.arabic));
    }
    const idx = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/adhkar/index.json'), 'utf8')) as { id: number }[];
    let n = 0;
    for (const c of idx) {
      const g = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/adhkar/${c.id}.json`), 'utf8'));
      for (const it of g.items) if (it.a) { n++; expect(byFile.get(it.a)).toBe(normDhikr(it.t)); }
    }
    expect(n).toBe(183);
  });
});
