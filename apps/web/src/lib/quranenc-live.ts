import 'server-only';
/** QuranEnc (written approval from IslamHouse, 26 Nov 2026): every translation, fetched at its latest version, shown unmodified. */
export interface QeT { key: string; direction: 'ltr' | 'rtl'; language_iso_code: string; version: string; last_update: number; title: string; description: string }
const BASE = 'https://quranenc.com/api/v1';
export async function qeList(): Promise<QeT[]> {
  try { const r = await fetch(`${BASE}/translations/list`, { next: { revalidate: 86400 } }); if (!r.ok) return []; return ((await r.json()).translations ?? []) as QeT[]; } catch { return []; }
}
export async function qeSura(key: string, s: number): Promise<{ aya: number; t: string; fn: string }[] | null> {
  if (!/^[a-z0-9_]{2,60}$/.test(key) || !(s >= 1 && s <= 114)) return null;
  try { const r = await fetch(`${BASE}/translation/sura/${key}/${s}`, { next: { revalidate: 86400 } }); if (!r.ok) return null;
    return ((await r.json()).result ?? []).map((x: { aya: string; translation: string; footnotes: string | null }) => ({ aya: Number(x.aya), t: x.translation, fn: x.footnotes ?? '' })); } catch { return null; }
}
