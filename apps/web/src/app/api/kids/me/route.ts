import { NextResponse } from 'next/server';
import { kidOf, kidTasks, kidToken } from '@/lib/family';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const k = await kidOf(kidToken(req.headers.get('cookie'))); if (!k) return NextResponse.json({ error: 'لا جلسة.' }, { status: 401 });
  return NextResponse.json({ name: k.name, age_band: k.age_band, allowed: k.allowed, limit: k.daily_minutes, used: k.used, timeUp: k.timeUp, tasks: await kidTasks(k.id) }, { headers: { 'cache-control': 'no-store' } });
}
