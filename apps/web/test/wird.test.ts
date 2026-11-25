import { describe, expect, it } from 'vitest';
import { PAGES, expectedEnd, markDone, newPlan, perDayFor, streak, todayRange, doneToday, parseWird } from '../src/lib/wird';
import { compare } from '../src/lib/tasmee';
import pages from '../src/generated/pages.json';
const D = (s: string) => new Date(`${s}T10:00:00`);
describe('wird plan', () => {
  it('has the 604 page starts', () => { expect(pages).toHaveLength(604); expect(pages[0]).toEqual([1, 1]); expect(pages[1]).toEqual([2, 1]); expect(pages[603]).toEqual([112, 1]); });
  it('computes pages per day', () => { expect(perDayFor('page')).toBe(1); expect(perDayFor('ramadan') * 29).toBeGreaterThanOrEqual(PAGES); expect(perDayFor('days', 60)).toBe(11); expect(perDayFor('pages', 500)).toBe(60); });
  it('advances, counts a khatma and restarts', () => {
    let st = newPlan('pages', 300, D('2026-11-01')); expect(st.perDay).toBe(60); expect(todayRange(st)).toEqual({ from: 1, to: 60 });
    for (let i = 0; i < 10; i++) st = markDone(st, D(`2026-11-${String(i + 1).padStart(2, '0')}`));
    expect(st.page).toBe(601); expect(todayRange(st)).toEqual({ from: 601, to: 604 });
    st = markDone(st, D('2026-11-11')); expect(st.khatmas).toBe(1); expect(st.page).toBe(1);
  });
  it('tracks streak and today', () => {
    let st = newPlan('page', 1, D('2026-11-20')); st = markDone(st, D('2026-11-20')); st = markDone(st, D('2026-11-21')); st = markDone(st, D('2026-11-23'));
    expect(streak(st, D('2026-11-23'))).toBe(1); expect(streak(st, D('2026-11-24'))).toBe(1); expect(streak(st, D('2026-11-25'))).toBe(0);
    expect(doneToday(st, D('2026-11-23'))).toBe(true); expect(st.page).toBe(4);
    const twice = markDone(st, D('2026-11-23')); expect(twice.days).toHaveLength(3);
  });
  it('estimates the end date and validates stored data', () => {
    const st = newPlan('days', 30, D('2026-11-01')); expect(expectedEnd(st, D('2026-11-01')).getDate()).toBe(29); // 21 pages a day: 29 reading days starting the 1st
    expect(parseWird('{"v":1,"page":700}')).toBeNull(); expect(parseWird(JSON.stringify(st))?.perDay).toBe(st.perDay);
  });
});
describe('tasmee comparison', () => {
  const ayah = 'قُلْ هُوَ ٱللَّهُ أَحَدٌ';
  it('accepts a correct recitation in plain spelling', () => { const r = compare(ayah, 'قل هو الله أحد'); expect(r.score).toBe(1); expect(r.missed).toBe(0); });
  it('marks a forgotten word', () => { const r = compare(ayah, 'قل الله احد'); expect(r.words.map((w) => w.ok)).toEqual([true, false, true, true]); expect(r.missed).toBe(1); });
  it('marks a wrong word and counts extras', () => { const r = compare(ayah, 'قل هو الرحمن احد'); expect(r.words[2].ok).toBe(false); expect(r.extra).toBe(1); });
  it('tolerates Uthmani dropped alefs', () => { expect(compare('ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ', 'ذلك الكتاب لا ريب').score).toBe(1); expect(compare('وَيُقِيمُونَ ٱلصَّلَوٰةَ', 'ويقيمون الصلاة').score).toBe(1); });
});
