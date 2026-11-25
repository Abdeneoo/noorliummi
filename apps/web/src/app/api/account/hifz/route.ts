import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseBackup, stats, parseKey } from '@/lib/hifz';
export const dynamic = 'force-dynamic';
const no = () => NextResponse.json({ error: 'سجّل الدخول أولًا.' }, { status: 401 });
/** The user's synced memorisation state (null if sync was never turned on). */
export async function GET(req: Request) {
  const u = await currentUser(req); if (!u) return no();
  const r = await db().query('SELECT data, updated_at FROM hifz_sync WHERE user_id = $1', [u.id]);
  return NextResponse.json(r.rowCount ? { data: r.rows[0].data, updated_at: r.rows[0].updated_at } : { data: null }, { headers: { 'cache-control': 'no-store' } });
}
export async function PUT(req: Request) {
  const u = await currentUser(req); if (!u || !sameSite(req)) return no();
  const text = await req.text(); if (text.length > 1_500_000) return NextResponse.json({ error: 'البيانات أكبر من المسموح.' }, { status: 413 });
  let st; try { st = parseBackup(text); } catch { return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 }); }
  const s = stats(st); const surahs = [...new Set(st.added.map((k) => parseKey(k)[0]))].slice(0, 114);
  await db().query(`INSERT INTO hifz_sync (user_id, data, total, learned, due, surahs, updated_at) VALUES ($1,$2,$3,$4,$5,$6, now())
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, total = EXCLUDED.total, learned = EXCLUDED.learned, due = EXCLUDED.due, surahs = EXCLUDED.surahs, updated_at = now()`, [u.id, JSON.stringify(st), s.total, s.review, s.dueNow, surahs]);
  return NextResponse.json({ ok: true });
}
/** Turns sync off and deletes the server copy. */
export async function DELETE(req: Request) {
  const u = await currentUser(req); if (!u || !sameSite(req)) return no();
  await db().query('DELETE FROM hifz_sync WHERE user_id = $1', [u.id]); return NextResponse.json({ ok: true });
}
