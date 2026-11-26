/** Validation for athar (sadaqah-jariyah) pages. Pure functions: no I/O, unit-tested. */
import { createHash, randomBytes } from 'node:crypto';
import adhkarIndex from '@/generated/adhkar/index.json';
import { RECITERS } from '@/lib/reciters';

export interface AtharItem { kind: 'surah' | 'dhikr' | 'reciter'; ref: number }
export type Gender = 'm' | 'f' | 'pl';
export interface AtharInput { display_name: string; dedication: string; dua_text: string; items: AtharItem[]; listed: boolean; gender: Gender; relation: string; died_on: string | null; audio_set: string }
/** Recorded dua sets a page may play (all from licensed sources). */
export const AUDIO_SETS: Record<string, string> = { 'od-dead': 'أدعية المتوفى من «حصن المسلم» — محمد جمعة (OpenDua)', 'quran-duas': 'أدعية القرآن الكريم — بصوت القارئ الذي يختاره الزائر', 'ih-263352': '«حصن المسلم» كاملًا — حمد الدريهم (IslamHouse)', 'ih-2799103': '«حصن المسلم» كاملًا — سليمان الشويهي (IslamHouse)', 'ih-289563': '«حصن المسلم» — فارس عباد (IslamHouse)', 'pl-deceased': 'قائمة «أدعية المتوفين»', 'pl-parents': 'قائمة «أدعية الوالدين» (آيات)', 'pl-mercy': 'قائمة «أدعية الرحمة والمغفرة»', none: 'بلا تسجيل صوتي' };
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
    else if (kind === 'reciter' && Number.isInteger(ref) && ref >= 0 && ref < RECITERS.length) { if (items.some((x) => x.kind === 'reciter')) return { ok: false, error: 'يمكن اختيار قارئ واحد للختمة.' }; }
    else return { ok: false, error: 'عنصر غير صالح في قائمة القراءة.' };
    const k = `${kind}:${ref}`; if (!seen.has(k)) { seen.add(k); items.push({ kind, ref }); }
  }
  const gender: Gender = b.gender === 'f' || b.gender === 'pl' ? b.gender : 'm';
  const relation = clean(b.relation).replace(/\s+/g, ' ').slice(0, 40);
  if (relation && LINKISH.test(relation)) return { ok: false, error: 'لا تُقبل الروابط أو الأرقام في صلة القرابة.' };
  const died_on = typeof b.died_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.died_on) && b.died_on >= '1900-01-01' && b.died_on <= new Date().toISOString().slice(0, 10) ? b.died_on : null;
  const audio_set = typeof b.audio_set === 'string' && b.audio_set in AUDIO_SETS ? b.audio_set : 'od-dead';
  return { ok: true, value: { display_name, dedication, dua_text, items, listed: b.listed === true, gender, relation, died_on, audio_set } };
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

/** Directory search text: trimmed, bounded, no wildcards from the user. */
export function cleanQuery(q: unknown): string { return clean(q).replace(/[%_\\]/g, '').slice(0, 60); }
