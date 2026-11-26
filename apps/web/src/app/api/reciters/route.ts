import { NextResponse } from 'next/server';
/**
 * Every reciter and every recording («صورة») MP3Quran lists, from its public API. Audio is streamed by the listener's
 * browser straight from MP3Quran's servers; nothing is re-hosted here.
 */
export const revalidate = 86400;
type M = { id: number; name: string; rewaya_id: number; server: string; surah_total: number; surah_list: string };
type R = { id: number; name: string; moshaf: M[] };
const get = async (lang: string) => { const r = await fetch(`https://www.mp3quran.net/api/v3/reciters?language=${lang}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new Error('mp3quran'); return ((await r.json()) as { reciters: R[] }).reciters; };
export async function GET() {
  try {
    const [ar, en] = await Promise.all([get('ar'), get('eng')]); const enBy = new Map(en.map((r) => [r.id, r]));
    const out = ar.map((r) => { const e = enBy.get(r.id); return { id: r.id, name: r.name, en: e?.name ?? r.name,
      versions: r.moshaf.filter((m) => /^https:\/\/[a-z0-9.-]*mp3quran\.net\//.test(m.server)).map((m) => ({ id: `mq:${r.id}:${m.id}`, name: m.name, en: e?.moshaf.find((x) => x.id === m.id)?.name ?? m.name, hafs: m.rewaya_id === 1, server: m.server, ...(m.surah_total === 114 ? {} : { list: m.surah_list })
      })) }; }).filter((r) => r.versions.length).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    return NextResponse.json({ reciters: out, source: 'MP3Quran.net' }, { headers: { 'cache-control': 'public, max-age=3600' } });
  } catch { return NextResponse.json({ reciters: [], source: 'MP3Quran.net' }, { headers: { 'cache-control': 'no-store' } }); }
}
