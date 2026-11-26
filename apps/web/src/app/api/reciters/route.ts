import { NextResponse } from 'next/server';
/**
 * Complete Hafs recitations listed by MP3Quran's public API. Audio is streamed by the listener's browser straight from
 * MP3Quran's servers (nothing is re-hosted here). Only the Hafs riwaya is listed because the text shown is Hafs.
 */
export const revalidate = 86400;
type M = { id: number; name: string; rewaya_id: number; server: string; surah_total: number };
type R = { id: number; name: string; moshaf: M[] };
const get = async (lang: string) => { const r = await fetch(`https://www.mp3quran.net/api/v3/reciters?language=${lang}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new Error('mp3quran'); return ((await r.json()) as { reciters: R[] }).reciters; };
export async function GET() {
  try {
    const [ar, en] = await Promise.all([get('ar'), get('eng')]); const enName = new Map(en.map((r) => [r.id, r.name]));
    const out = ar.flatMap((r) => r.moshaf.filter((m) => m.surah_total === 114 && m.rewaya_id === 1 && /^https:\/\/[a-z0-9.-]*mp3quran\.net\//.test(m.server))
      .map((m) => ({ id: `mq:${r.id}:${m.id}`, name: r.name, en: enName.get(r.id) ?? r.name, kind: m.name.replace(/^حفص عن عاصم\s*-\s*/, ''), server: m.server })))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    return NextResponse.json({ reciters: out, source: 'MP3Quran.net' }, { headers: { 'cache-control': 'public, max-age=3600' } });
  } catch { return NextResponse.json({ reciters: [], source: 'MP3Quran.net' }, { status: 200, headers: { 'cache-control': 'no-store' } }); }
}
