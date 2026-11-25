/** Validation for group khatmas. Pure functions, unit-tested. */
import { isSlug } from './athar';
import { PHRASES, TARGETS } from './dhikr-phrases';

const LINKISH = /(https?:\/\/|www\.|\.(com|net|org|io|me)\b|@[A-Za-z0-9_]{3,}|(?:\d[\s-]?){8,})/iu;
// eslint-disable-next-line no-control-regex
const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[\u0000-\u001F\u007F‎‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

export type GroupKind = 'quran' | 'dhikr' | 'dua';
export interface KhatmaInput { display_name: string; feminine: boolean; athar_slug: string | null; kind: GroupKind; phrase: number; target: number }
export function validateKhatma(b: Record<string, unknown>): { ok: true; v: KhatmaInput } | { ok: false; error: string } {
  const display_name = clean(b.display_name, 80);
  if (!display_name) return { ok: false, error: 'اكتب اسم من تُهدى إليه الختمة.' };
  if (LINKISH.test(display_name)) return { ok: false, error: 'لا تُقبل الروابط أو الأرقام في الاسم.' };
  const athar = typeof b.athar_slug === 'string' && isSlug(b.athar_slug) ? b.athar_slug : null;
  const kind: GroupKind = b.kind === 'dhikr' || b.kind === 'dua' ? b.kind : 'quran';
  const phrase = kind === 'dhikr' && Number.isInteger(b.phrase) && (b.phrase as number) >= 0 && (b.phrase as number) < PHRASES.length ? (b.phrase as number) : 0;
  const target = kind === 'dhikr' && TARGETS.includes(Number(b.target)) ? Number(b.target) : 0;
  return { ok: true, v: { display_name, feminine: b.feminine === true, athar_slug: athar, kind, phrase, target } };
}
export const cleanReader = (s: unknown) => { const r = clean(s, 40); return LINKISH.test(r) ? '' : r; };

