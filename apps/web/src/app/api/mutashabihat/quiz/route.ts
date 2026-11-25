import { NextResponse } from 'next/server';
import { dailyQuiz } from '@/lib/mquiz';
export async function GET(req: Request) {
  const d = new URL(req.url).searchParams.get('d') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: 'date' }, { status: 400 });
  return NextResponse.json(await dailyQuiz(d), { headers: { 'cache-control': 'public, max-age=86400' } });
}
