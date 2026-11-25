import { NextResponse } from 'next/server';
import { clearCookie, endSession, sameSite } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  await endSession(req);
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': clearCookie } });
}
