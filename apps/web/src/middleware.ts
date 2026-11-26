import { NextResponse, type NextRequest } from 'next/server';
import { kidGate } from '@/lib/family-rules';
/**
 * 1) Child mode: a device holding a child-session cookie can reach only the child area (/kids and /api/kids). Every other page is sent
 *    back to /kids and every other API answers 403. What the child may open inside that area is checked against the database there.
 * 2) Canonical link (HTTP Link header) for every page, built from SITE_URL without the query string.
 * 3) Until the owner approves launch (NOOR_PUBLIC=1), every response also carries X-Robots-Tag: noindex.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (req.cookies.has('noor_kid')) {
    const g = kidGate(path);
    if (g === 'deny') return NextResponse.json({ error: 'غير متاح في وضع الطفل.' }, { status: 403 });
    if (g === 'redirect') return NextResponse.redirect(new URL('/kids', req.url));
  }
  const res = NextResponse.next();
  if (path.startsWith('/api/')) return res;
  const base = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  res.headers.set('Link', `<${base}${path}>; rel="canonical"`);
  if (process.env.NOOR_PUBLIC !== '1' || path.startsWith('/kids')) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
export const config = { matcher: ['/((?!_next/|audio/|brand/|fonts/|favicon|sw.js|manifest|icon|apple-touch).*)'] };
