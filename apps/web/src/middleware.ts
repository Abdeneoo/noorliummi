import { NextResponse, type NextRequest } from 'next/server';
/**
 * Canonical link (HTTP Link header, read by search engines) for every page, built from SITE_URL without the query string.
 * Until the owner approves launch (NOOR_PUBLIC=1), every response also carries X-Robots-Tag: noindex.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const base = (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
  res.headers.set('Link', `<${base}${req.nextUrl.pathname}>; rel="canonical"`);
  if (process.env.NOOR_PUBLIC !== '1') res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
export const config = { matcher: ['/((?!_next/|api/|audio/|brand/|fonts/|favicon|sw.js|manifest).*)'] };
