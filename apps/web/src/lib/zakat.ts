/**
 * Zakat on money, gold, silver and trade goods — the widely taught basic rule: if the total reaches the nisab and a
 * lunar year has passed, 2.5% is due. Guidance for learning only; details and differences are for a scholar.
 */
export const NISAB_GOLD_G = 85; export const NISAB_SILVER_G = 595; export const RATE = 0.025;
export interface ZakatInput { cash: number; goldG: number; silverG: number; trade: number; debtsDue: number; goldPrice: number; silverPrice: number; nisabBy: 'gold' | 'silver' }
const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
export function zakat(i: ZakatInput) {
  const gold = n(i.goldG) * n(i.goldPrice); const silver = n(i.silverG) * n(i.silverPrice);
  const total = Math.max(0, n(i.cash) + gold + silver + n(i.trade) - n(i.debtsDue));
  const nisab = i.nisabBy === 'gold' ? NISAB_GOLD_G * n(i.goldPrice) : NISAB_SILVER_G * n(i.silverPrice);
  const due = nisab > 0 && total >= nisab; return { gold, silver, total, nisab, due, amount: due ? total * RATE : 0 };
}
