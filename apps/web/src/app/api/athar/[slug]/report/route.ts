import { NextResponse } from 'next/server';
import { isSlug, validateReason } from '@/lib/athar';
import { reportPage } from '@/lib/athar-store';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) return NextResponse.json({ error: 'غير موجود.' }, { status: 404 });
  if (rateLimited(req, 'report', 5, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة.' }, { status: 429 });
  // One report per address per page per day, so a single person cannot freeze a page alone.
  if (rateLimited(req, `report:${slug}`, 1, 86_400_000)) return NextResponse.json({ ok: true });
  let body: unknown; try { body = await req.json(); } catch { body = null; }
  const r = validateReason(body);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return (await reportPage(slug, r.value)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'غير موجود.' }, { status: 404 });
}
