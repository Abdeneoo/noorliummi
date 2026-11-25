import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/db';
import { createKhatma, validateKhatma } from '@/lib/khatma';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (req.headers.get('x-noor') !== '1') return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (rateLimited(req, 'khatma-create', 5, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  if (b.website) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  const v = validateKhatma(b); if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  try { return NextResponse.json(await createKhatma(v.v), { status: 201 }); }
  catch (e) { console.error('khatma create failed', e); return NextResponse.json({ error: 'تعذّر الحفظ الآن.' }, { status: 503 }); }
}
