import { NextResponse } from 'next/server';
import { sameSite } from '@/lib/auth';
import { kidOf, kidToken, setTaskDone } from '@/lib/family';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const k = await kidOf(kidToken(req.headers.get('cookie'))); if (!k || !sameSite(req)) return NextResponse.json({ error: 'لا جلسة.' }, { status: 401 });
  if (k.timeUp) return NextResponse.json({ error: 'انتهى وقت اليوم.' }, { status: 403 });
  let b: { task?: number; done?: boolean } = {}; try { b = await req.json(); } catch { /* empty */ }
  const ok = Number.isInteger(b.task) && (await setTaskDone(k.id, b.task as number, b.done !== false)); return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
