import { NextResponse } from 'next/server';
import { isSlug } from '@/lib/athar';
import { currentUser, sameSite } from '@/lib/auth';
import { circleAction, circleView } from '@/lib/circles';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug)) return NextResponse.json({}, { status: 404 });
  const u = await currentUser(req); const v = await circleView(slug, u?.id ?? null);
  return v ? NextResponse.json({ ...v, signedIn: !!u }, { headers: { 'cache-control': 'no-store' } }) : NextResponse.json({}, { status: 404 });
}
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const u = await currentUser(req);
  if (!isSlug(slug) || !u || !sameSite(req)) return NextResponse.json({ error: 'سجّل الدخول أولًا.' }, { status: 401 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  return (await circleAction(slug, u.id, b)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'تعذّر تنفيذ الطلب.' }, { status: 400 });
}
