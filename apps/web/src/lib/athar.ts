/** Validation for athar (sadaqah-jariyah) pages. Pure functions: no I/O, unit-tested. */
import { createHash, randomBytes } from 'node:crypto';
import adhkarIndex from '@/generated/adhkar/index.json';

export interface AtharItem { kind: 'surah' | 'dhikr'; ref: number }
export interface AtharInput { display_name: string; dedication: string; dua_text: string; items: AtharItem[] }
export const LIMITS = { name: 80, dedication: 300, dua: 1000, items: 10, reason: 300 } as const;
const DHIKR_IDS = new Set((adhkarIndex as { id: number }[]).map((c) => c.id));

// Links, bare domains, handles and long digit runs (phone numbers) are refused: these pages carry no external links.
const LINKISH = /(https?:\/\/|www\.|\b[\p{L}\p{N}-]+\.(com|net|org|io|me|ly|co|info|xyz|app|link|site|online|store|shop|top|sa|eg|ae|tk|gg)\b|t\.me|wa\.me|@[A-Za-z0-9_]{3,}|(?:\d[\s-]?){8,})/iu;
// eslint-disable-next-line no-control-regex
const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‎‏‪-‮⁦-⁩]/g, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim() : '');

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateAthar(body: unknown): Result<AtharInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const display_name = clean(b.display_name).replace(/\s+/g, ' ');
  const dedication = clean(b.dedication);
  const dua_text = clean(b.dua_text);
  if (!display_name) return { ok: false, error: 'اكتب الاسم الذي تُهدى إليه الصفحة.' };
  if (display_name.length > LIMITS.name) return { ok: false, error: `الاسم أطول من ${LIMITS.name} حرفًا.` };
  if (dedication.length > LIMITS.dedication) return { ok: false, error: `الإهداء أطول من ${LIMITS.dedication} حرف.` };
  if (dua_text.length > LIMITS.dua) return { ok: false, error: `الدعاء أطول من ${LIMITS.dua} حرف.` };
  for (const t of [display_name, dedication, dua_text]) if (LINKISH.test(t)) return { ok: false, error: 'لا تُقبل الروابط أو أرقام الهواتف أو الحسابات في هذه الصفحات.' };
  const raw = Array.isArray(b.items) ? b.items : [];
  if (raw.length > LIMITS.items) return { ok: false, error: `يمكن اختيار ${LIMITS.items} عناصر على الأكثر.` };
  const items: AtharItem[] = []; const seen = new Set<string>();
  for (const it of raw as Record<string, unknown>[]) {
    const kind = it?.kind; const ref = Number(it?.ref);
    if (kind === 'surah' && Number.isInteger(ref) && ref >= 1 && ref <= 114) { /* ok */ }
    else if (kind === 'dhikr' && DHIKR_IDS.has(ref)) { /* ok */ }
    else return { ok: false, error: 'عنصر غير صالح في قائمة القراءة.' };
    const k = `${kind}:${ref}`; if (!seen.has(k)) { seen.add(k); items.push({ kind, ref }); }
  }
  return { ok: true, value: { display_name, dedication, dua_text, items } };
}

export function validateReason(body: unknown): Result<string> {
  const r = clean((body as Record<string, unknown> | null)?.reason).slice(0, LIMITS.reason);
  return r ? { ok: true, value: r } : { ok: false, error: 'اذكر سبب البلاغ باختصار.' };
}

const ALPH = 'abcdefghjkmnpqrstuvwxyz23456789';
/** Unguessable slug (~60 bits): pages are reachable only by whoever has the link. */
export function newSlug(): string { return Array.from(randomBytes(12), (x) => ALPH[x % ALPH.length]).join(''); }
export function newToken(): string { return randomBytes(32).toString('hex'); }
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');
export const isSlug = (s: string) => /^[a-z2-9]{12}$/.test(s);
export const FREEZE_AT = 3;
