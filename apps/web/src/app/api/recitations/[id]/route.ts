import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { deleteRecitation, noteRecitation, readRecitation } from '@/lib/recitations';
export const dynamic = 'force-dynamic';
const no = (status = 404) => NextResponse.json({ error: 'غير متاح.' }, { status });
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(req); const id = Number((await params).id); if (!u || !Number.isInteger(id)) return no(401);
  const r = await readRecitation(id, u.id); if (!r) return no();
  return new NextResponse(new Uint8Array(r.data), { headers: { 'content-type': r.mime, 'cache-control': 'private, no-store', 'content-disposition': 'inline', 'x-robots-tag': 'noindex' } });
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(req); const id = Number((await params).id); if (!u || !sameSite(req) || !Number.isInteger(id)) return no(401);
  return (await deleteRecitation(id, u.id)) ? NextResponse.json({ ok: true }) : no(403);
}
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(req); const id = Number((await params).id); if (!u || !sameSite(req) || !Number.isInteger(id)) return no(401);
  let b: { note?: string } = {}; try { b = await req.json(); } catch { /* empty */ }
  return (await noteRecitation(id, u.id, String(b.note ?? '').trim())) ? NextResponse.json({ ok: true }) : no(403);
}
