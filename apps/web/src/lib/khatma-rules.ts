/** Validation for group khatmas. Pure functions, unit-tested. */
import { isSlug } from './athar';

const LINKISH = /(https?:\/\/|www\.|\.(com|net|org|io|me)\b|@[A-Za-z0-9_]{3,}|(?:\d[\s-]?){8,})/iu;
// eslint-disable-next-line no-control-regex
const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[\u0000-\u001F\u007F‎‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

export function validateKhatma(b: Record<string, unknown>): { ok: true; v: { display_name: string; feminine: boolean; athar_slug: string | null } } | { ok: false; error: string } {
  const display_name = clean(b.display_name, 80);
  if (!display_name) return { ok: false, error: 'اكتب اسم من تُهدى إليه الختمة.' };
  if (LINKISH.test(display_name)) return { ok: false, error: 'لا تُقبل الروابط أو الأرقام في الاسم.' };
  const athar = typeof b.athar_slug === 'string' && isSlug(b.athar_slug) ? b.athar_slug : null;
  return { ok: true, v: { display_name, feminine: b.feminine === true, athar_slug: athar } };
}
export const cleanReader = (s: unknown) => { const r = clean(s, 40); return LINKISH.test(r) ? '' : r; };

