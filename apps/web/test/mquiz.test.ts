import { describe, expect, it } from 'vitest';
import { dailyQuiz } from '../src/lib/mquiz';
import { loadSurah } from '../src/lib/quran';
describe('mutashabihat daily quiz', () => {
  it('gives the same three valid questions for a date', async () => {
    const a = await dailyQuiz('2026-11-26'); const b = await dailyQuiz('2026-11-26');
    expect(a).toHaveLength(3); expect(a).toEqual(b);
    for (const q of a) {
      const right = (await loadSurah(q.surah)).ayat[q.ayah - 1].t; const other = (await loadSurah(q.other[0])).ayat[q.other[1] - 1].t;
      expect(q.options[q.answer]).toBe(right); expect(q.options[1 - q.answer]).toBe(other);
    }
  });
});
