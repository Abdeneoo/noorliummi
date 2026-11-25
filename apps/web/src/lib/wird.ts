/**
 * Daily wird / flexible khatma plan. Pure functions over a plain state kept in localStorage on the user's device.
 * Progress is counted in mushaf pages (604, Madinah mushaf). No reward figures of any kind.
 */
export const PAGES = 604;
export type PlanKind = 'page' | 'pages' | 'juzWeek' | 'ramadan' | 'days';
export interface WirdState { v: 1; kind: PlanKind; perDay: number; start: string; page: number; /** days on which the wird was completed */ days: string[]; khatmas: number }
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** Pages per day for each plan. 'days' = finish in n days; 'juzWeek' = one juz' (≈20 pages) a week. */
export function perDayFor(kind: PlanKind, n = 1): number {
  switch (kind) {
    case 'page': return 1;
    case 'pages': return Math.max(1, Math.min(60, Math.round(n)));
    case 'juzWeek': return 3;            // 20 pages a week, rounded up
    case 'ramadan': return 21;           // 604 / 29 days, rounded up: done by the 29th
    case 'days': return Math.max(1, Math.ceil(PAGES / Math.max(1, Math.min(1000, Math.round(n)))));
  }
}
export function newPlan(kind: PlanKind, n: number, now = new Date()): WirdState {
  return { v: 1, kind, perDay: perDayFor(kind, n), start: dayKey(now), page: 1, days: [], khatmas: 0 };
}
/** Today's portion: mushaf pages from..to (inclusive). */
export function todayRange(st: WirdState): { from: number; to: number } {
  return { from: st.page, to: Math.min(PAGES, st.page + st.perDay - 1) };
}
export const doneToday = (st: WirdState, now = new Date()) => st.days.includes(dayKey(now));
/** Marks today's wird read and moves the position. Finishing page 604 counts a khatma and starts again from page 1. */
export function markDone(st: WirdState, now = new Date()): WirdState {
  const k = dayKey(now); const { to } = todayRange(st);
  const days = st.days.includes(k) ? st.days : [...st.days, k].slice(-800);
  return to >= PAGES ? { ...st, days, page: 1, khatmas: st.khatmas + 1 } : { ...st, days, page: to + 1 };
}
/** Consecutive days ending today (or yesterday, if today is not done yet). */
export function streak(st: WirdState, now = new Date()): number {
  const set = new Set(st.days); let d = set.has(dayKey(now)) ? now : addDays(now, -1); let n = 0;
  while (set.has(dayKey(d))) { n++; d = addDays(d, -1); }
  return n;
}
export function expectedEnd(st: WirdState, now = new Date()): Date {
  const left = PAGES - st.page + 1; return addDays(now, Math.ceil(left / st.perDay) - (doneToday(st, now) ? 0 : 1));
}
export function parseWird(text: string | null): WirdState | null {
  try { const j = JSON.parse(text || 'null') as WirdState; if (j?.v === 1 && j.page >= 1 && j.page <= PAGES && j.perDay >= 1 && Array.isArray(j.days)) return j; } catch { /* bad data */ }
  return null;
}
