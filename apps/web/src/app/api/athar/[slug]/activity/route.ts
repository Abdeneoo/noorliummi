import { NextResponse } from 'next/server';
import { isSlug } from '@/lib/athar';
import { addActivity, getActivity, type ActivityKind } from '@/lib/athar-store';
import { rateLimited } from '@/lib/db';
export const dynamic = 'force-dynamic';
const KINDS: ActivityKind[] = ['dua', 'read', 'tasbeeh'];
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug)) return NextResponse.json({}, { status: 404 });
  try { return NextResponse.json(await getActivity(slug), { headers: { 'cache-control': 'no-store' } }); } catch { return NextResponse.json({ dua: 0, read: 0, tasbeeh: 0 }); }
}
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug) || req.headers.get('x-noor') !== '1') return NextResponse.json({}, { status: 400 });
  let b: { kind?: string }; try { b = await req.json(); } catch { return NextResponse.json({}, { status: 400 }); }
  const kind = b.kind as ActivityKind; if (!KINDS.includes(kind)) return NextResponse.json({}, { status: 400 });
  // One visitor adds at most a handful per hour per page and kind, so the light reflects many people, not one script.
  if (rateLimited(req, `act:${slug}:${kind}`, kind === 'tasbeeh' ? 20 : 6, 3600_000)) return NextResponse.json({ ok: false }, { status: 429 });
  try { await addActivity(slug, kind); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ ok: false }, { status: 503 }); }
}
