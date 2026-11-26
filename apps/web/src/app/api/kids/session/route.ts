import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { kidCookie, startKidSession } from '@/lib/family';
export const dynamic = 'force-dynamic';
/** The signed-in parent switches THIS device to a child's mode. (Reachable only before the child cookie exists — see middleware.) */
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
  const u = await currentUser(req); if (!u) return NextResponse.json({ error: 'سجّل الدخول أولًا.' }, { status: 401 });
  let b: { child?: number } = {}; try { b = await req.json(); } catch { /* empty */ }
  const t = Number.isInteger(b.child) ? await startKidSession(u.id, b.child as number) : null; if (!t) return NextResponse.json({ error: 'غير موجود.' }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': kidCookie(t) } });
}
