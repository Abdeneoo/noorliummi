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
