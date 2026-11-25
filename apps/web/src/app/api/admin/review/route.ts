import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { REVIEW_SECTIONS, REVIEW_STATES } from '@/lib/review';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); const r = await db().query("SELECT section, status, reviewer, note, to_char(reviewed_at, 'YYYY-MM-DD') AS reviewed_at FROM review_status"); return NextResponse.json({ rows: r.rows }, { headers: { 'cache-control': 'no-store' } }); }
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: Record<string, unknown> = {}; try { b = await req.json(); } catch { /* empty */ }
  const section = String(b.section ?? ''); const status = String(b.status ?? ''); const reviewer = String(b.reviewer ?? '').trim().slice(0, 120); const note = String(b.note ?? '').trim().slice(0, 1000);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.reviewed_at ?? '')) ? String(b.reviewed_at) : null;
  if (!REVIEW_SECTIONS.some((s) => s.id === section) || !(status in REVIEW_STATES)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (status === 'reviewed' && (!reviewer || !date)) return NextResponse.json({ error: '«راجعه متخصص» تحتاج اسم المراجع وتاريخ المراجعة.' }, { status: 400 });
  await db().query(`INSERT INTO review_status (section, status, reviewer, note, reviewed_at) VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (section) DO UPDATE SET status = EXCLUDED.status, reviewer = EXCLUDED.reviewer, note = EXCLUDED.note, reviewed_at = EXCLUDED.reviewed_at, updated_at = now()`, [section, status, reviewer, note, date]);
  return NextResponse.json({ ok: true });
}
