import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { modAction, modQueue } from '@/lib/athar-store';

export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  return NextResponse.json(await modQueue(), { headers: { 'cache-control': 'no-store' } });
}
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { id?: unknown; action?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const id = Number(b.id); const action = b.action;
  if (!Number.isInteger(id) || !['approve', 'remove', 'dismiss'].includes(action as string)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  return (await modAction(id, action as 'approve' | 'remove' | 'dismiss')) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'غير موجود.' }, { status: 404 });
}
