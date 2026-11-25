/**
 * Memorisation scheduling (FSRS via ts-fsrs, MIT). Pure functions over a plain state object;
 * the page keeps the state in localStorage on the user's device only. One card = one ayah.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

export type CardJSON = Omit<Card, 'due' | 'last_review'> & { due: string; last_review?: string };
export interface HifzState { v: 1; cards: Record<string, CardJSON>; added: string[]; newPerDay: number; introduced: Record<string, number> }
export const emptyState = (): HifzState => ({ v: 1, cards: {}, added: [], newPerDay: 10, introduced: {} });
export const keyOf = (s: number, a: number) => `${s}:${a}`;
export const parseKey = (k: string) => k.split(':').map(Number) as [number, number];

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));
const toJSON = (c: Card): CardJSON => ({ ...c, due: c.due.toISOString(), last_review: c.last_review?.toISOString() });
const fromJSON = (c: CardJSON): Card => ({ ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined }) as Card;
const day = (d: Date) => d.toISOString().slice(0, 10);

/** Adds ayat from..to of surah s (skips ones already added). Returns how many were added. */
export function addRange(st: HifzState, s: number, from: number, to: number, ayas: number, now = new Date()): number {
  if (!Number.isInteger(s) || s < 1 || s > 114) throw new RangeError('surah');
  const a = Math.max(1, Math.min(from, to)); const b = Math.min(ayas, Math.max(from, to));
  let n = 0;
  for (let i = a; i <= b; i++) { const k = keyOf(s, i); if (!st.cards[k]) { st.cards[k] = toJSON(createEmptyCard(now)); st.added.push(k); n++; } }
  return n;
}

/** Cards to review now: due reviews first (oldest due first), then new cards up to today's allowance, in Mushaf order of adding. */
export function queue(st: HifzState, now = new Date()): string[] {
  const due = Object.entries(st.cards).filter(([, c]) => c.state !== State.New && new Date(c.due) <= now).sort((x, y) => x[1].due.localeCompare(y[1].due)).map(([k]) => k);
  const left = Math.max(0, st.newPerDay - (st.introduced[day(now)] ?? 0));
  const fresh = st.added.filter((k) => st.cards[k]?.state === State.New).slice(0, left);
  return [...due, ...fresh];
}

export const GRADES: { g: Grade; ar: string }[] = [
  { g: Rating.Again, ar: 'نسيتها' }, { g: Rating.Hard, ar: 'صعبة' }, { g: Rating.Good, ar: 'جيدة' }, { g: Rating.Easy, ar: 'سهلة' },
];
/** Next due date for each grade, for showing on the buttons. */
export function preview(st: HifzState, k: string, now = new Date()): Record<number, Date> {
  const r = scheduler.repeat(fromJSON(st.cards[k]), now);
  return Object.fromEntries(GRADES.map(({ g }) => [g, r[g].card.due]));
}
export function review(st: HifzState, k: string, g: Grade, now = new Date()): void {
  const c = st.cards[k]; if (!c) throw new Error('unknown card');
  if (c.state === State.New) { const d = day(now); st.introduced[d] = (st.introduced[d] ?? 0) + 1; }
  st.cards[k] = toJSON(scheduler.next(fromJSON(c), now, g).card);
}
export function stats(st: HifzState, now = new Date()) {
  const all = Object.values(st.cards);
  return { total: all.length, fresh: all.filter((c) => c.state === State.New).length, learning: all.filter((c) => c.state === State.Learning || c.state === State.Relearning).length, review: all.filter((c) => c.state === State.Review).length, dueNow: queue(st, now).length };
}
export function removeSurah(st: HifzState, s: number) {
  for (const k of Object.keys(st.cards)) if (parseKey(k)[0] === s) delete st.cards[k];
  st.added = st.added.filter((k) => parseKey(k)[0] !== s);
}
/** Validates an imported backup; throws on anything unexpected. */
export function parseBackup(text: string): HifzState {
  const j = JSON.parse(text) as HifzState;
  if (j?.v !== 1 || typeof j.cards !== 'object' || !Array.isArray(j.added)) throw new Error('bad backup');
  for (const [k, c] of Object.entries(j.cards)) { const [s, a] = parseKey(k); if (!(s >= 1 && s <= 114 && a >= 1 && a <= 286) || Number.isNaN(Date.parse(c.due))) throw new Error('bad card'); }
  return { ...emptyState(), ...j };
}
