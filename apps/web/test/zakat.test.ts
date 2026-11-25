import { describe, expect, it } from 'vitest';
import { zakat } from '../src/lib/zakat';
const base = { cash: 0, goldG: 0, silverG: 0, trade: 0, debtsDue: 0, goldPrice: 100, silverPrice: 1, nisabBy: 'gold' as const };
describe('zakat (guidance)', () => {
  it('is 2.5% at or above the gold nisab', () => { const r = zakat({ ...base, cash: 8500 }); expect(r.nisab).toBe(8500); expect(r.due).toBe(true); expect(r.amount).toBeCloseTo(212.5); });
  it('is nothing below nisab and subtracts due debts', () => { expect(zakat({ ...base, cash: 8499 }).due).toBe(false); expect(zakat({ ...base, cash: 9000, debtsDue: 600 }).due).toBe(false); });
  it('adds gold, silver and trade goods; silver nisab is lower', () => { const r = zakat({ ...base, goldG: 50, silverG: 1000, trade: 3000 }); expect(r.total).toBe(9000); expect(r.amount).toBeCloseTo(225); expect(zakat({ ...base, cash: 600, nisabBy: 'silver' }).due).toBe(true); });
  it('ignores negative or invalid input', () => { expect(zakat({ ...base, cash: -5, goldG: NaN }).total).toBe(0); });
});
