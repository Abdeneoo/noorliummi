import { NextResponse } from 'next/server';
import { sameSite } from '@/lib/auth';
import { kidOf, kidToken, tick } from '@/lib/family';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const t = kidToken(req.headers.get('cookie')); if (!t || !sameSite(req)) return NextResponse.json({ error: 'لا جلسة.' }, { status: 401 });
  await tick(t); const k = await kidOf(t); if (!k) return NextResponse.json({ error: 'لا جلسة.' }, { status: 401 });
  return NextResponse.json({ used: k.used, limit: k.daily_minutes, timeUp: k.timeUp }, { headers: { 'cache-control': 'no-store' } });
}
