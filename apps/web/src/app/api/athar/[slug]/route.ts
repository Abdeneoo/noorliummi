import { NextResponse } from 'next/server';
import { isSlug, validateAthar } from '@/lib/athar';
import { deletePage, updatePage } from '@/lib/athar-store';
import { rateLimited } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ slug: string }> };
const token = (req: Request) => req.headers.get('x-edit-token') ?? '';

export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isSlug(slug) || rateLimited(req, 'edit', 30, 3600_000)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
  let body: unknown; try { body = await req.json(); } catch { return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 }); }
  const v = validateAthar(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const u = await currentUser(req);
  return (await updatePage(slug, token(req), v.value, u?.id ?? null)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isSlug(slug) || rateLimited(req, 'edit', 30, 3600_000)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
  const u = await currentUser(req);
  return (await deletePage(slug, token(req), u?.id ?? null)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
}
