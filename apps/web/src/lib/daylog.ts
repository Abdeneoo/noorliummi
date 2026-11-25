/**
 * A private, on-device log of the days the user opened the mushaf (q), completed an adhkar chapter (a) and said tasbeeh (t).
 * Used only for the monthly summary shown to the user; never sent anywhere. Kept for 400 days.
 */
type Day = { q?: number; a?: number; t?: number };
const KEY = 'noor.daylog';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function read(): Record<string, Day> { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
export function logDay(kind: keyof Day, n = 1) {
  try {
    const all = read(); const k = today(); const d = (all[k] ??= {}); d[kind] = (d[kind] ?? 0) + n;
    const keys = Object.keys(all).sort(); while (keys.length > 400) delete all[keys.shift()!];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* storage blocked */ }
}
export function monthSummary(ym = today().slice(0, 7)) {
  const days = Object.entries(read()).filter(([k]) => k.startsWith(ym)).map(([, v]) => v);
  return { quranDays: days.filter((d) => d.q).length, adhkarDays: days.filter((d) => d.a).length, tasbeeh: days.reduce((s, d) => s + (d.t ?? 0), 0), activeDays: days.length };
}
