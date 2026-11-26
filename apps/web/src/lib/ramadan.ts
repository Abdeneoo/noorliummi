/** Ramadan dates on the visitor's device: Umm al-Qura + the visitor's ±day adjustment, or the first day they set from the local announcement. */
const fmtH = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
export const hij = (d: Date) => { const p = fmtH.formatToParts(d); const g = (t: string) => Number(p.find((x) => x.type === t)?.value); return { y: g('year'), m: g('month'), d: g('day') }; };
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const SKEY = 'noor.ramadan.start';
/** First day of the current Ramadan, or of the next one if we are outside it. */
export function calcStart(now: Date, adj: number): Date {
  for (let i = -30; i < 400; i++) { const d = addDays(now, i); const h = hij(new Date(d.getTime() + adj * 86400000)); if (h.m === 9 && h.d === 1 && addDays(d, 30) > now) return d; }
  return now;
}
export function ramadanStart(now: Date, adj: number, manual: string | null): Date {
  if (manual && /^\d{4}-\d{2}-\d{2}$/.test(manual)) { const [y, m, d] = manual.split('-').map(Number); const s = new Date(y, m - 1, d); if (addDays(s, 30) > now) return s; }
  return calcStart(now, adj);
}
/** Day of Ramadan (1–30), or 0 outside it. */
export function ramadanDay(now: Date, start: Date) { const t = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); const n = Math.floor((t - start.getTime()) / 86400000) + 1; return n >= 1 && n <= 30 ? n : 0; }
