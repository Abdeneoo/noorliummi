import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { rateLimited } from '@/lib/db';
import { familyAction, myChildren } from '@/lib/family';
export const dynamic = 'force-dynamic';
const no = { 'cache-control': 'no-store' };
export async function GET(req: Request) { const u = await currentUser(req); if (!u) return NextResponse.json({ anon: true, children: [] }, { headers: no }); return NextResponse.json({ children: await myChildren(u.id) }, { headers: no }); }
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
  const u = await currentUser(req); if (!u) return NextResponse.json({ error: 'سجّل الدخول أولًا.' }, { status: 401 });
  if (rateLimited(req, 'family', 60, 60_000)) return NextResponse.json({ error: 'محاولات كثيرة.' }, { status: 429 });
  let b: Record<string, unknown> = {}; try { b = await req.json(); } catch { /* empty */ }
  const r = await familyAction(u.id, b); return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
