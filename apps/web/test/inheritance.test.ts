import { describe, expect, it } from 'vitest';
import { inherit, type Heirs } from '../src/lib/inheritance';
const H = (o: Partial<Heirs>): Heirs => ({ husband: false, wives: 0, father: false, mother: false, sons: 0, daughters: 0, siblings: 0, others: false, ...o });
const shares = (o: Partial<Heirs>) => { const r = inherit(H(o)); if (!r.ok) throw new Error(r.reason); const m: Record<string, string> = {}; for (const s of r.shares) m[s.who] = `${s.total[0]}/${s.total[1]}`; return m; };
describe('inheritance (basic agreed cases)', () => {
  it('the two Umari cases', () => { expect(shares({ husband: true, father: true, mother: true })).toEqual({ 'الزوج': '1/2', 'الأم': '1/6', 'الأب': '1/3' }); expect(shares({ wives: 1, father: true, mother: true })).toEqual({ 'الزوجة': '1/4', 'الأم': '1/4', 'الأب': '1/2' }); });
  it('children share two to one', () => { expect(shares({ husband: true, sons: 1, daughters: 1 })).toEqual({ 'الزوج': '1/4', 'الابن': '1/2', 'البنت': '1/4' }); });
  it('awl: the minbariyya (24 → 27)', () => { expect(shares({ wives: 1, father: true, mother: true, daughters: 2 })).toEqual({ 'الزوجة': '1/9', 'الأم': '4/27', 'الأب': '4/27', 'البنات': '16/27' }); });
  it('father takes the residue with a daughter', () => { expect(shares({ father: true, daughters: 1 })).toEqual({ 'الأب': '1/2', 'البنت': '1/2' }); });
  it('radd excludes the spouse', () => { expect(shares({ mother: true, daughters: 1 })).toEqual({ 'الأم': '1/4', 'البنت': '3/4' }); expect(shares({ husband: true, daughters: 1 })).toEqual({ 'الزوج': '1/4', 'البنت': '3/4' }); });
  it('wives share one eighth; mother reduced by siblings', () => {
    const r = inherit(H({ wives: 3, sons: 2 })); expect(r.ok && r.shares.map((s) => `${s.who} ${s.each[0]}/${s.each[1]}`)).toEqual(['الزوجات 1/24', 'الأبناء 7/16']);
    expect(shares({ father: true, mother: true, siblings: 2 })).toEqual({ 'الأم': '1/6', 'الأب': '5/6' }); expect(shares({ father: true, mother: true, siblings: 1 })).toEqual({ 'الأم': '1/3', 'الأب': '2/3' });
  });
  it('every result sums to the whole estate', () => {
    for (const o of [{ husband: true, father: true, mother: true, daughters: 3 }, { wives: 4, mother: true, sons: 3, daughters: 2 }, { mother: true, father: true, sons: 1, others: true }, { husband: true, mother: true, daughters: 2 }]) {
      const r = inherit(H(o)); if (!r.ok) throw new Error(r.reason); const t = r.shares.reduce((s, x) => s + x.total[0] / x.total[1], 0); expect(t).toBeCloseTo(1, 9);
    }
  });
  it('refuses what is out of scope', () => {
    expect(inherit(H({ mother: true, siblings: 2 })).ok).toBe(false); expect(inherit(H({ husband: true, daughters: 1, others: true })).ok).toBe(false);
    expect(inherit(H({ husband: true, wives: 1 })).ok).toBe(false); expect(inherit(H({})).ok).toBe(false);
    const alone = inherit(H({ wives: 1 })); expect(alone.ok && alone.note).toContain('اسأل عالمًا');
  });
});
