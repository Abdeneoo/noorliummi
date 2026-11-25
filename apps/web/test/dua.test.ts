import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FEMININE, feminine } from '../src/lib/dua';

describe('feminine dua for the deceased', () => {
  const src = JSON.parse(readFileSync(resolve(__dirname, '../src/generated/adhkar/56.json'), 'utf8')).items[0].t as string;
  it('changes only the listed pronoun words; everything else is the source text', () => {
    const a = src.split(' '), b = feminine(src).split(' ');
    expect(b.length).toBe(a.length);
    const map = new Map(FEMININE);
    let changed = 0;
    a.forEach((w, i) => { if (w !== b[i]) { expect(map.get(w)).toBe(b[i]); changed++; } });
    expect(changed).toBe(FEMININE.length);
    expect(feminine(src)).not.toMatch(/[َُِ]هُ[،\s]|[َُِ]هِ[،\s]/);
  });
});
