/** Upcoming occasions by the Umm al-Qura calendar (astronomical; actual days follow each country's moon sighting). */
const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
export function hijri(d: Date) { const p = fmt.formatToParts(d); const g = (t: string) => Number(p.find((x) => x.type === t)?.value); return { y: g('year'), m: g('month'), d: g('day') }; }
export interface Occasion { date: Date; title: string; kind: 'season' | 'fast' }
const NAMES: [number, number, string, Occasion['kind']][] = [
  [9, 1, 'أول رمضان', 'season'], [10, 1, 'عيد الفطر', 'season'], [12, 1, 'أول عشر ذي الحجة', 'season'], [12, 9, 'يوم عرفة', 'fast'], [12, 10, 'عيد الأضحى', 'season'], [1, 9, 'تاسوعاء', 'fast'], [1, 10, 'عاشوراء', 'fast'],
];
/** Scans the next `days` days: named occasions, the white days (13–15, outside Ramadan and the days of Eid/tashriq). */
export function upcoming(from: Date, days = 370): Occasion[] {
  const out: Occasion[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12); const h = hijri(d);
    for (const [m, dd, title, kind] of NAMES) if (h.m === m && h.d === dd) out.push({ date: d, title, kind });
    if (h.d === 13 && h.m !== 9 && h.m !== 12) out.push({ date: d, title: 'الأيام البيض (١٣ و١٤ و١٥)', kind: 'fast' });
  }
  return out;
}
export const daysUntil = (from: Date, to: Date) => Math.round((new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() - new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) / 86400000);
