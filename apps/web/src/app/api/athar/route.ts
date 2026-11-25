import { NextResponse } from 'next/server';
import { validateAthar } from '@/lib/athar';
import { createPage } from '@/lib/athar-store';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  if (rateLimited(req, 'create', 5, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let body: Record<string, unknown>; try { body = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  if (body.website) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); // honeypot
  const v = validateAthar(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  try { return NextResponse.json(await createPage(v.value), { status: 201 }); }
  catch (e) { console.error('athar create failed', e); return NextResponse.json({ error: 'تعذّر الحفظ الآن. حاول لاحقًا.' }, { status: 503 }); }
}
