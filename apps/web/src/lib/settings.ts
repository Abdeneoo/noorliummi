import 'server-only';
import { db } from './db';
/**
 * Official channels (verified 2026-11-26): KSA Qur'an TV (@SaudiQuranTv) and قناة السنة النبوية (@SaudiSunnahTv).
 * The defaults are the channels' continuous live videos («Makkah Live» / «Madinah Live HD»); embedding by channel id
 * (live_stream?channel=) showed "video unavailable", so a video id is used. The moderator can replace an id when a channel restarts its stream.
 */
export const CHANNELS = { 'live.makkah': 'UCos52azQNBgW63_9uDJoPDA', 'live.madinah': 'UCROKYPep-UuODNwyipe6JMw' } as const;
export const LIVE_DEFAULTS = { 'live.makkah': 'IsJTAdC3-Jw', 'live.madinah': 'yq-zVNR3muo' } as const;
export const SETTING_KEYS = Object.keys(LIVE_DEFAULTS) as (keyof typeof LIVE_DEFAULTS)[];
/** A YouTube channel id (UC + 22 chars) or a video id (11 chars); nothing else is accepted. */
export const validLiveId = (v: string) => /^UC[A-Za-z0-9_-]{22}$/.test(v) || /^[A-Za-z0-9_-]{11}$/.test(v);
export async function liveSettings(): Promise<Record<string, string>> {
  const out: Record<string, string> = { ...LIVE_DEFAULTS }; const stored = new Set<string>();
  try { const r = await db().query<{ key: string; value: string }>('SELECT key, value FROM site_settings WHERE key = ANY($1)', [SETTING_KEYS]); for (const x of r.rows) if (validLiveId(x.value)) { out[x.key] = x.value; stored.add(x.key); } } catch { /* defaults */ }
  // Best effort: ask YouTube which video is live on each channel now (cached 30 minutes). Falls back to the stored id.
  for (const k of SETTING_KEYS) { const id = await currentLive(CHANNELS[k]); if (id && !stored.has(k)) out[k] = id; }
  return out;
}
const cache = new Map<string, { id: string | null; at: number }>();
async function currentLive(channel: string): Promise<string | null> {
  const c = cache.get(channel); if (c && Date.now() - c.at < 30 * 60_000) return c.id;
  let id: string | null = null;
  try {
    const r = await fetch(`https://www.youtube.com/channel/${channel}/live`, { headers: { 'accept-language': 'en', 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36' }, signal: AbortSignal.timeout(6000), cache: 'no-store' });
    const html = r.ok ? await r.text() : '';
    // Only trusted when the page is the live video's own watch page (canonical link) and says it is live.
    const m = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/);
    if (m && /"isLiveNow":true/.test(html)) id = m[1];
  } catch { /* blocked or offline */ }
  cache.set(channel, { id, at: Date.now() }); return id;
}
