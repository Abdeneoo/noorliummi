import { NextResponse } from 'next/server';
import { db, rateLimited } from '@/lib/db';
import { sectionOf } from '@/lib/stats';
export const dynamic = 'force-dynamic';
/** Counts one page open for a section (and one visit for the first page of a browser session). Stores no visitor data. */
export async function POST(req: Request) {
  if (rateLimited(req, 'hit', 300, 3600_000)) return new NextResponse(null, { status: 204 });
  let b: { p?: string; f?: boolean }; try { b = JSON.parse(await req.text()); } catch { return new NextResponse(null, { status: 204 }); }
  const s = sectionOf(b.p ?? ''); if (!s) return new NextResponse(null, { status: 204 });
  try {
    const q = 'INSERT INTO page_stats (day, section, views) VALUES (current_date, $1, 1) ON CONFLICT (day, section) DO UPDATE SET views = page_stats.views + 1';
    await db().query(q, [s]); if (b.f === true) await db().query(q, ['_visit']);
  } catch { /* never fail the visitor */ }
  return new NextResponse(null, { status: 204 });
}
