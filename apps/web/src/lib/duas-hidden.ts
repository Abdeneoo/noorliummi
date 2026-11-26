import 'server-only';
import { db } from './db';
/** Moderator control: ids of duas/recordings hidden from the dua section (site_settings 'duas.hidden'). Cached one minute. */
let cache: { set: Set<string>; at: number } | null = null;
export async function hiddenDuas(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < 60000) return cache.set;
  let set = new Set<string>();
  try { const r = await db().query<{ value: string }>("SELECT value FROM site_settings WHERE key = 'duas.hidden'"); set = new Set((r.rows[0]?.value ?? '').split(',').filter(Boolean)); } catch { /* no db at build */ }
  cache = { set, at: Date.now() }; return set;
}
export const resetHidden = () => { cache = null; };
