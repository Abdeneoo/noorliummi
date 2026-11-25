import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import { addRange, emptyState, parseBackup, preview, queue, removeSurah, review, stats } from '../src/lib/hifz';

const t0 = new Date('2026-11-25T08:00:00Z');
describe('hifz scheduling', () => {
  it('adds a range once, clamped to the surah', () => {
    const st = emptyState();
    expect(addRange(st, 112, 1, 10, 4, t0)).toBe(4);
    expect(addRange(st, 112, 2, 3, 4, t0)).toBe(0);
    expect(st.added).toEqual(['112:1', '112:2', '112:3', '112:4']);
    expect(() => addRange(st, 115, 1, 1, 1)).toThrow();
  });
  it('limits new ayat per day and keeps Mushaf order', () => {
    const st = emptyState(); st.newPerDay = 3; addRange(st, 1, 1, 7, 7, t0);
    expect(queue(st, t0)).toEqual(['1:1', '1:2', '1:3']);
    review(st, '1:1', Rating.Good, t0);
    expect(queue(st, t0)).toEqual(['1:2', '1:3']); // 1:1 is learning, due in 10 min
    expect(stats(st, t0).learning).toBe(1);
  });
  it('Again comes back sooner than Easy; due cards return to the queue', () => {
    const st = emptyState(); addRange(st, 112, 1, 2, 4, t0);
    const p = preview(st, '112:1', t0);
    expect(p[Rating.Again].getTime()).toBeLessThan(p[Rating.Easy].getTime());
    review(st, '112:1', Rating.Easy, t0);
    const later = new Date(t0.getTime() + 30 * 86400_000);
    expect(queue(st, later)[0]).toBe('112:1');
  });
  it('survives a JSON round trip and rejects bad backups', () => {
    const st = emptyState(); addRange(st, 2, 255, 255, 286, t0); review(st, '2:255', Rating.Good, t0);
    const back = parseBackup(JSON.stringify(st));
    expect(back.cards['2:255'].due).toBe(st.cards['2:255'].due);
    expect(() => parseBackup('{"v":1,"cards":{"999:1":{"due":"x"}},"added":[]}')).toThrow();
    removeSurah(back, 2); expect(Object.keys(back.cards)).toHaveLength(0);
  });
});
