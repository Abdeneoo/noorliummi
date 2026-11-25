import { NextResponse } from 'next/server';
/** Gold and silver spot price in USD per gram, from gold-api.com (free, no key). Cached for an hour; the calculator also accepts a manual price. */
export const revalidate = 3600;
const OZ = 31.1034768;
export async function GET() {
  try {
    const [g, s] = await Promise.all(['XAU', 'XAG'].map(async (m) => { const r = await fetch(`https://api.gold-api.com/price/${m}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) }); if (!r.ok) throw new Error('price'); return Number((await r.json()).price); }));
    if (!(g > 0 && s > 0)) throw new Error('price');
    return NextResponse.json({ gold: +(g / OZ).toFixed(2), silver: +(s / OZ).toFixed(3), currency: 'USD', at: new Date().toISOString(), source: 'gold-api.com' });
  } catch { return NextResponse.json({ error: 'unavailable' }, { status: 503 }); }
}
