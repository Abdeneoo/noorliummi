import { describe, expect, it } from 'vitest';
import { PROPHETS, prophetAyat } from '../src/lib/prophets';
describe('prophets named in the Quran', () => {
  it('finds each name exactly as many times as it occurs', async () => {
    const got: Record<string, number> = {};
    for (const p of PROPHETS) got[p.id] = (await prophetAyat(p)).reduce((t, x) => t + x.hits, 0);
    expect(got).toEqual(Object.fromEntries(PROPHETS.map((p) => [p.id, p.count])));
  }, 60000);
});
