import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { LIVE_DEFAULTS, SETTING_KEYS, liveSettings, validLiveId } from '@/lib/settings';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); return NextResponse.json({ values: await liveSettings(), defaults: LIVE_DEFAULTS }, { headers: { 'cache-control': 'no-store' } }); }
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { key?: string; value?: string } = {}; try { b = await req.json(); } catch { /* empty */ }
  const key = String(b.key ?? ''); const value = String(b.value ?? '').trim();
  if (!SETTING_KEYS.includes(key as never)) return NextResponse.json({ error: 'مفتاح غير معروف.' }, { status: 400 });
  if (value === '') { await db().query('DELETE FROM site_settings WHERE key = $1', [key]); return NextResponse.json({ ok: true }); }
  if (!validLiveId(value)) return NextResponse.json({ error: 'اكتب معرّف قناة (UC…) أو معرّف فيديو (١١ حرفًا) فقط.' }, { status: 400 });
  await db().query('INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()', [key, value]);
  return NextResponse.json({ ok: true });
}
