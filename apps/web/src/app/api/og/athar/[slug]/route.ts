import { NextResponse } from 'next/server';
import { isSlug } from '@/lib/athar';
import { getPage } from '@/lib/athar-store';
import { atharSvg, renderPng } from '@/lib/og';
import { ogLine, ogVersion } from '@/lib/og-meta';
export const dynamic = 'force-dynamic';
const cache = new Map<string, Buffer>();
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const fallback = () => new NextResponse(null, { status: 302, headers: { location: '/brand/og-cover.jpg', 'cache-control': 'no-store' } }); // relative: behind the proxy req.url is the internal address
  if (!isSlug(slug)) return fallback();
  let p; try { p = await getPage(slug); } catch { return fallback(); }
  if (!p || p.status !== 'active') return fallback(); // missing, frozen or removed pages never expose a name
  const key = `${slug}:${ogVersion(p.display_name, p.dedication)}`; let png = cache.get(key);
  if (!png) { try { png = renderPng(atharSvg(p.display_name, ogLine(p.dedication))); } catch (e) { console.error('og render failed', e); return fallback(); } if (cache.size > 300) cache.clear(); cache.set(key, png); }
  // The URL carries ?v=<hash of the name and line>, so an edited page gets a new URL and previews refresh.
  return new NextResponse(new Uint8Array(png), { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=604800, immutable', 'x-robots-tag': 'noindex' } });
}
