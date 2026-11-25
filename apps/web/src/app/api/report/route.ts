import { NextResponse } from 'next/server';
import { db, rateLimited } from '@/lib/db';
export const dynamic = 'force-dynamic';
// eslint-disable-next-line no-control-regex
const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, n) : '');
export async function POST(req: Request) {
  if (req.headers.get('x-noor') !== '1') return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (rateLimited(req, 'report', 5, 3600_000)) return NextResponse.json({ error: 'بلاغات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  if (b.website) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  const path = clean(b.path, 200).replace(/[?#].*$/, ''); const wrong = clean(b.wrong, 1000); const correct = clean(b.correct, 1000); const source = clean(b.source, 300);
  if (!path.startsWith('/') || wrong.length < 5) return NextResponse.json({ error: 'اكتب موضع الخطأ ووصفه.' }, { status: 400 });
  try { await db().query('INSERT INTO content_reports (path, wrong, correct, source) VALUES ($1,$2,$3,$4)', [path, wrong, correct, source]); return NextResponse.json({ ok: true }, { status: 201 }); }
  catch { return NextResponse.json({ error: 'تعذّر الحفظ الآن.' }, { status: 503 }); }
}
