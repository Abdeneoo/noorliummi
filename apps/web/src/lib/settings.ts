import 'server-only';
import { db } from './db';
/** Official channels (verified 2026-11-26): KSA Qur'an TV (@SaudiQuranTv) and قناة السنة النبوية (@SaudiSunnahTv). */
export const LIVE_DEFAULTS = { 'live.makkah': 'UCos52azQNBgW63_9uDJoPDA', 'live.madinah': 'UCROKYPep-UuODNwyipe6JMw' } as const;
export const SETTING_KEYS = Object.keys(LIVE_DEFAULTS) as (keyof typeof LIVE_DEFAULTS)[];
/** A YouTube channel id (UC + 22 chars) or a video id (11 chars); nothing else is accepted. */
export const validLiveId = (v: string) => /^UC[A-Za-z0-9_-]{22}$/.test(v) || /^[A-Za-z0-9_-]{11}$/.test(v);
export async function liveSettings(): Promise<Record<string, string>> {
  const out: Record<string, string> = { ...LIVE_DEFAULTS };
  try { const r = await db().query<{ key: string; value: string }>('SELECT key, value FROM site_settings WHERE key = ANY($1)', [SETTING_KEYS]); for (const x of r.rows) if (validLiveId(x.value)) out[x.key] = x.value; } catch { /* defaults */ }
  return out;
}
