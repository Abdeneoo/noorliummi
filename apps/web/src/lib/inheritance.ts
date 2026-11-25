/**
 * Inheritance shares for the simplest, agreed-upon cases only: spouse, father, mother, sons and daughters.
 * Anything else (grandparents, grandchildren, siblings who would inherit, wills, debts…) is refused with «اسأل عالمًا».
 * Guidance for learning, never a fatwa. Exact fractions; unit-tested on well-known cases.
 */
export interface Heirs { husband: boolean; wives: number; father: boolean; mother: boolean; sons: number; daughters: number; /** brothers and sisters of the deceased, of any kind */ siblings: number; /** any other relatives (grandparents, grandchildren, uncles…) */ others: boolean }
export type Frac = [number, number];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const f = (n: number, d: number): Frac => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
const add = (a: Frac, b: Frac) => f(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); const sub = (a: Frac, b: Frac) => add(a, [-b[0], b[1]]);
const mul = (a: Frac, b: Frac) => f(a[0] * b[0], a[1] * b[1]); const div = (a: Frac, b: Frac) => mul(a, [b[1], b[0]]);
const gt = (a: Frac, b: Frac) => a[0] * b[1] > b[0] * a[1];
export interface Share { who: string; count: number; total: Frac; each: Frac; basis: string }
export type Result = { ok: true; shares: Share[]; note?: string } | { ok: false; reason: string };

export function inherit(h: Heirs): Result {
  const int = (v: number) => Number.isInteger(v) && v >= 0;
  if (![h.wives, h.sons, h.daughters, h.siblings].every(int) || h.wives > 4 || h.sons > 30 || h.daughters > 30) return { ok: false, reason: 'أدخل أعدادًا صحيحة.' };
  if (h.husband && h.wives > 0) return { ok: false, reason: 'لا يجتمع الزوج والزوجة في مسألة واحدة.' };
  const child = h.sons + h.daughters > 0; const asaba = h.father || h.sons > 0;
  if (!h.husband && !h.wives && !h.father && !h.mother && !child) return { ok: false, reason: 'اختر وارثًا واحدًا على الأقل.' };
  // Siblings are excluded by the father or a son; otherwise they inherit and the case is outside this calculator.
  if (h.siblings > 0 && !asaba) return { ok: false, reason: 'الإخوة والأخوات يرثون في هذه الحالة، وأحكامهم خارج نطاق هذه الحاسبة. اسأل عالمًا.' };
  // Other relatives are excluded only when father (grandfather, uncles), mother (grandmothers) and a son (grandchildren) are all present.
  if (h.others && !(h.father && h.mother && h.sons > 0)) return { ok: false, reason: 'قد يرث بعض الأقارب الآخرين (كالجد أو الجدة أو أولاد الابن) في هذه الحالة، وهذا خارج نطاق الحاسبة. اسأل عالمًا.' };

  const S: Share[] = []; const put = (who: string, count: number, total: Frac, basis: string) => S.push({ who, count, total, each: div(total, [count, 1]), basis });
  const spouse: Frac | null = h.husband ? (child ? [1, 4] : [1, 2]) : h.wives ? (child ? [1, 8] : [1, 4]) : null;
  if (h.husband) put('الزوج', 1, spouse!, child ? 'الربع لوجود الولد' : 'النصف لعدم الولد');
  if (h.wives) put(h.wives > 1 ? 'الزوجات' : 'الزوجة', h.wives, spouse!, child ? 'الثمن لوجود الولد' : 'الربع لعدم الولد');
  // The two «عمريتان»: spouse, father and mother only — the mother takes a third of what remains after the spouse.
  const umari = !!spouse && h.father && h.mother && !child && h.siblings < 2;
  if (h.mother) {
    if (umari) put('الأم', 1, mul(sub([1, 1], spouse!), [1, 3]), 'ثلث الباقي بعد فرض أحد الزوجين (المسألة العمرية)');
    else if (child || h.siblings >= 2) put('الأم', 1, [1, 6], child ? 'السدس لوجود الولد' : 'السدس لوجود جمع من الإخوة');
    else put('الأم', 1, [1, 3], 'الثلث لعدم الولد وعدم جمع من الإخوة');
  }
  if (h.father && child) put('الأب', 1, [1, 6], h.sons ? 'السدس لوجود الابن' : 'السدس فرضًا، وله الباقي تعصيبًا إن بقي شيء');
  if (h.daughters && !h.sons) put(h.daughters > 1 ? 'البنات' : 'البنت', h.daughters, h.daughters > 1 ? [2, 3] : [1, 2], h.daughters > 1 ? 'الثلثان للبنتين فأكثر عند عدم الابن' : 'النصف للبنت الواحدة عند عدم الابن');

  let sum = S.reduce<Frac>((t, x) => add(t, x.total), [0, 1]); let note: string | undefined;
  if (gt(sum, [1, 1])) { // «العول»: shares exceed the estate, so all are reduced in proportion
    for (const x of S) { x.total = div(x.total, sum); x.each = div(x.total, [x.count, 1]); }
    note = 'زادت الفروض على التركة، فدخل النقص على الجميع بنسبة أنصبتهم (العول).'; sum = [1, 1];
  }
  const rest = sub([1, 1], sum);
  if (rest[0] > 0) {
    if (h.sons) { const units = h.sons * 2 + h.daughters; put(h.sons > 1 ? 'الأبناء' : 'الابن', h.sons, mul(rest, [h.sons * 2, units]), 'الباقي تعصيبًا، للذكر مثل حظ الأنثيين');
      if (h.daughters) put(h.daughters > 1 ? 'البنات' : 'البنت', h.daughters, mul(rest, [h.daughters, units]), 'مع الابن تعصيبًا، للذكر مثل حظ الأنثيين'); }
    else if (h.father) { const fa = S.find((x) => x.who === 'الأب'); if (fa) { fa.total = add(fa.total, rest); fa.each = fa.total; } else put('الأب', 1, rest, 'الباقي تعصيبًا'); }
    else { // «الرد»: no residuary heir — the remainder returns to the fixed-share heirs other than the spouse
      const back = S.filter((x) => x.who !== 'الزوج' && !x.who.startsWith('الزوج'));
      if (!back.length) return { ok: true, shares: S, note: 'بقي من التركة جزء لا وارث له في هذه الحاسبة (الباقي بعد فرض أحد الزوجين)، وفي مصرفه كلام لأهل العلم. اسأل عالمًا.' };
      const base = back.reduce<Frac>((t, x) => add(t, x.total), [0, 1]);
      for (const x of back) { x.total = add(x.total, mul(rest, div(x.total, base))); x.each = div(x.total, [x.count, 1]); }
      note = 'بقي من التركة جزء بلا عاصب، فرُدَّ على أصحاب الفروض غير الزوجين بنسبة أنصبتهم (الرد، على قول جمهور أهل العلم).';
    }
  }
  return { ok: true, shares: S, note };
}
