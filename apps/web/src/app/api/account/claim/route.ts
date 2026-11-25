import { NextResponse } from 'next/server';
import { currentUser, sameSite } from '@/lib/auth';
import { isSlug } from '@/lib/athar';
import { claimPages } from '@/lib/athar-store';

export const dynamic = 'force-dynamic';
/** Moves this device's pages (proved by their edit tokens) into the signed-in account. */
export async function POST(req: Request) {
  const u = await currentUser(req);
  if (!u || !sameSite(req)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
  let b: { pages?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const pairs = (Array.isArray(b.pages) ? b.pages : []).map((x) => x as { slug?: unknown; token?: unknown })
    .filter((x) => typeof x.slug === 'string' && isSlug(x.slug) && typeof x.token === 'string' && /^[a-f0-9]{64}$/.test(x.token)) as { slug: string; token: string }[];
  return NextResponse.json({ claimed: await claimPages(u.id, pairs) });
}
