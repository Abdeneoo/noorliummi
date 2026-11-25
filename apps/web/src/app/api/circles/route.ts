import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { cleanName, createCircle, myCircles } from '@/lib/circles';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) { const u = await currentUser(req); if (!u) return NextResponse.json({ user: false, circles: [] }); return NextResponse.json({ user: true, circles: await myCircles(u.id) }, { headers: { 'cache-control': 'no-store' } }); }
export async function POST(req: Request) {
  const u = await currentUser(req); if (!u || !sameSite(req)) return NextResponse.json({ error: 'سجّل الدخول أولًا.' }, { status: 401 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  const name = cleanName(b.name); if (!name) return NextResponse.json({ error: 'اكتب اسم الحلقة.' }, { status: 400 });
  const slug = await createCircle(u.id, name, b.kind === 'family' ? 'family' : 'halaqa');
  return slug ? NextResponse.json({ slug }, { status: 201 }) : NextResponse.json({ error: 'بلغت الحد الأقصى من الحلقات (١٠).' }, { status: 400 });
}
