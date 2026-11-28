import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { allReviews, createReviewer, setActive } from '@/lib/review-board';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); return NextResponse.json(await allReviews(), { headers: { 'cache-control': 'no-store' } }); }
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  const b = await req.json().catch(() => null) as { name?: string; id?: number; active?: boolean } | null;
  if (b?.id && typeof b.active === 'boolean') { await setActive(b.id, b.active); return NextResponse.json({ ok: true }); }
  const name = String(b?.name ?? '').trim().slice(0, 80); if (name.length < 2) return NextResponse.json({ error: 'اكتب اسم المراجع.' }, { status: 400 });
  return NextResponse.json({ token: await createReviewer(name) });
}
