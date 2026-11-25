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
    // Allowed hosting bases: free licences on Wikimedia Commons / Internet Archive, or islamweb's non-commercial-with-attribution policy.
    for (const s of pub) {
      expect(s.by.length).toBeGreaterThan(0); expect(s.licenseUrl).toMatch(/^https:\/\//);
      if (/commons\.wikimedia\.org/.test(s.source)) expect(s.license).toMatch(/^CC/);
      else if (/archive\.org/.test(s.source)) expect(s.license).toMatch(/^(CC0|Public Domain)/);
      else expect(s.source).toMatch(/^https:\/\/www\.islamweb\.net\//);
    }
    expect(pub.length).toBeGreaterThanOrEqual(40);
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
    const { dhikrKey: normDhikr } = await import('../src/lib/dhikr-norm');
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
    expect(n).toBe(189);
  });
});

describe('Names of Allah', () => {
  it('99 names in source order, every ref is a real ayah, names equal the source', () => {
    const raw = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/names-of-allah/asma_allah_alhusna_saeed_alqahtani.json'), 'utf8')) as { id: number; name_arabic: string }[];
    const g = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/names-of-allah.json'), 'utf8')) as { id: number; name: string; refs: [number, number][] }[];
    const meta = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/surahs.json'), 'utf8')) as { ayas: number }[];
    expect(g).toHaveLength(99);
    g.forEach((n, i) => { expect(n.id).toBe(raw[i].id); expect(n.name).toBe(raw[i].name_arabic); for (const [s, a] of n.refs) { expect(a).toBeGreaterThanOrEqual(1); expect(a).toBeLessThanOrEqual(meta[s - 1].ayas); } });
    expect(g.flatMap((n) => n.refs).length).toBe(315); // 317 verified, 2 duplicates merged
    for (const n of g) expect(Object.keys(n).sort()).toEqual(['id', 'name', 'page', 'refs', 'url']);
  });
});

describe('Quranic Arabic Corpus alignment', () => {
  it('file is unmodified, keeps its copyright header, and every aligned ayah has one entry per Tanzil word', async () => {
    const { createHash } = await import('node:crypto');
    const dir = resolve(__dirname, '../../../database/sources/quranic-corpus');
    const buf = readFileSync(`${dir}/quranic-corpus-morphology-0.4.txt`);
    expect(createHash('sha256').update(buf).digest('hex')).toBe('a1d12923815341face765083805d2148ed2d9f5cc3f7d6665219d887675d8c46');
    expect(buf.toString('utf8')).toContain('PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK');
    const { rootArabic } = await import('../src/lib/morph');
    let aligned = 0; const none: string[] = [];
    for (let s = 1; s <= 114; s++) {
      const su = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/surah/${s}.json`), 'utf8')) as { ayat: { n: number; t: string }[] };
      const m = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/morph/${s}.json`), 'utf8')) as Record<string, { r: string }[] | null>;
      for (const a of su.ayat) {
        const x = m[a.n]; if (x === null) { none.push(`${s}:${a.n}`); continue; }
        expect(x.length).toBe(a.t.split(' ').length); aligned++;
        for (const w of x) if (w.r) expect(rootArabic(w.r)).not.toBe('');
      }
    }
    expect(aligned).toBe(6232); expect(none).toEqual(['2:181', '8:6', '13:37', '37:130']);
    expect(rootArabic('smw')).toBe('س م و');
  });
});

describe('English data', () => {
  it('QuranEnc translation and footnotes are identical to the source, aligned to every ayah', () => {
    const dir = resolve(__dirname, '../../../database/sources/quranenc-english-saheeh');
    let n = 0;
    for (let s = 1; s <= 114; s++) {
      const src = JSON.parse(readFileSync(`${dir}/s${s}.json`, 'utf8')).result as { aya: string; translation: string; footnotes: string }[];
      const g = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/en/quran/${s}.json`), 'utf8')) as { v: string; ayat: { tr: string; fn: string }[] };
      expect(g.v).toBe('1.1.2'); expect(g.ayat.length).toBe(src.length);
      g.ayat.forEach((a, i) => { expect(a.tr).toBe(src[i].translation); expect(a.fn).toBe(src[i].footnotes ?? ''); n++; });
    }
    expect(n).toBe(6236);
  });
  it('OpenDua English is attached only on an exact Arabic match', async () => {
    const { dhikrKey: normDhikr } = await import('../src/lib/dhikr-norm');
    const cat = JSON.parse(readFileSync(resolve(__dirname, '../../../database/sources/opendua/catalogue.json'), 'utf8'));
    const en = new Map<string, string>();
    for (const e of cat.entries) for (const v of e.variations ?? []) for (const st of v.steps) if (st.items?.length === 1 && st.items[0].dua?.translation) en.set(normDhikr(st.items[0].dua.arabic), st.items[0].dua.translation);
    const idx = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/adhkar/index.json'), 'utf8')) as { id: number }[];
    let k = 0;
    for (const c of idx) for (const it of JSON.parse(readFileSync(resolve(__dirname, `../src/generated/adhkar/${c.id}.json`), 'utf8')).items) if (it.en) { k++; expect(en.get(normDhikr(it.t))).toBe(it.en); }
    expect(k).toBe(189);
  });
});

describe('Tajweed mapping', () => {
  it('every annotation sits inside its ayah, letter signatures hold, identical ayat keep the published offsets', () => {
    const dir = resolve(__dirname, '../../../database/sources/quran-tajweed');
    const pub = JSON.parse(readFileSync(`${dir}/tajweed.hafs.uthmani-pause-sajdah.json`, 'utf8')) as { surah: number; ayah: number; annotations: { rule: string; start: number; end: number }[] }[];
    const old = new Map(readFileSync(`${dir}/quran-uthmani-2017.txt`, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l && !l.startsWith('#')).map((l) => { const [s, a, ...t] = l.split('|'); return [`${s}:${a}`, t.join('|')] as const; }));
    const SIG: Record<string, string> = { hamzat_wasl: 'ٱ', qalqalah: 'قطبجد', lam_shamsiyyah: 'ل' };
    let n = 0; let identical = 0;
    for (let s = 1; s <= 114; s++) {
      const su = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/surah/${s}.json`), 'utf8')) as { ayat: { n: number; t: string }[] };
      const tj = JSON.parse(readFileSync(resolve(__dirname, `../src/generated/tajweed/${s}.json`), 'utf8')) as Record<string, [string, number, number][]>;
      for (const a of su.ayat) {
        const v = tj[a.n] ?? [];
        for (const [r, x, y] of v) { expect(y).toBeLessThanOrEqual(a.t.length); expect(x).toBeLessThan(y); if (SIG[r]) expect(SIG[r]).toContain(a.t[x]); n++; }
        if (old.get(`${s}:${a.n}`) === a.t) {
          identical++;
          const p = pub.find((x) => x.surah === s && x.ayah === a.n)!;
          expect(v).toEqual(p.annotations.map((x) => [x.rule, x.start, x.end]));
        }
      }
    }
    expect(n).toBe(60023); expect(identical).toBe(5816);
  });
});
