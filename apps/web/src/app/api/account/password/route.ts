import { NextResponse } from 'next/server';
import { changePassword, currentUser, sameSite } from '@/lib/auth';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const u = await currentUser(req);
  if (!u || !sameSite(req)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
  if (rateLimited(req, 'password', 10, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: { current?: unknown; password?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const r = await changePassword(req, u, b.current, b.password);
  return 'error' in r ? NextResponse.json({ error: r.error }, { status: r.status }) : NextResponse.json({ ok: true });
}
