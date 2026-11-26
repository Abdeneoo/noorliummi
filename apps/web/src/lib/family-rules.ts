/** Pure rules of family content management (no database) — tested in test/family.test.ts. */
export const AGE_BANDS = ['4-6', '7-9', '10-12', '13-15'] as const;
export const KID_SECTIONS = { quran: 'القرآن', adhkar: 'الأذكار', lessons: 'الدروس', tasbeeh: 'المسبحة' } as const;
export type KidSection = keyof typeof KID_SECTIONS;
export interface Allowed { sections: KidSection[]; surahs: number[]; adhkar: number[]; lessons: number[] }
const ints = (v: unknown, min: number, max: number, cap: number) => [...new Set((Array.isArray(v) ? v : []).map(Number).filter((n) => Number.isInteger(n) && n >= min && n <= max))].slice(0, cap);
/** Anything the parent did not list is not allowed. Unknown keys and out-of-range values are dropped. */
export function cleanAllowed(v: unknown): Allowed {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  return { sections: [...new Set((Array.isArray(o.sections) ? o.sections : []).filter((s): s is KidSection => typeof s === 'string' && s in KID_SECTIONS))], surahs: ints(o.surahs, 1, 114, 114), adhkar: ints(o.adhkar, 1, 500, 200), lessons: ints(o.lessons, 1, 99999999, 100) };
}
export function allows(a: Allowed, kind: KidSection, id?: number): boolean {
  if (!a.sections.includes(kind)) return false;
  if (kind === 'tasbeeh') return true;
  if (id == null) return true;
  return (kind === 'quran' ? a.surahs : kind === 'adhkar' ? a.adhkar : a.lessons).includes(id);
}
/** In a child session, only the child area is reachable. Everything else is sent back to it (pages) or refused (API). */
export function kidGate(path: string): 'ok' | 'redirect' | 'deny' {
  if (path === '/kids' || path.startsWith('/kids/') || path.startsWith('/api/kids/')) return 'ok';
  return path.startsWith('/api/') ? 'deny' : 'redirect';
}
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export function weekKey(d: Date) { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y = t.getUTCFullYear(); const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7); return `${y}-W${String(w).padStart(2, '0')}`; }
export const periodKey = (period: 'daily' | 'weekly', d: Date) => (period === 'daily' ? dayKey(d) : weekKey(d));
export const validPin = (p: unknown): p is string => typeof p === 'string' && /^\d{4,8}$/.test(p);
export const timeUp = (limit: number | null, used: number) => limit != null && used >= limit;
/** Suggested starting set per age band (short surahs first); the parent can change everything. */
export const PRESET_SURAHS: Record<(typeof AGE_BANDS)[number], number[]> = { '4-6': [1, 112, 113, 114], '7-9': [1, ...Array.from({ length: 10 }, (_, i) => 105 + i)], '10-12': [1, ...Array.from({ length: 37 }, (_, i) => 78 + i)], '13-15': [1, 18, 36, 55, 56, 67, ...Array.from({ length: 37 }, (_, i) => 78 + i)] };
