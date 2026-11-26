import { NextResponse } from 'next/server';
import { sameSite } from '@/lib/auth';
import { rateLimited } from '@/lib/db';
import { transcribe } from '@/lib/tarteel';
export const dynamic = 'force-dynamic';
const MAX = 2_600_000; // ≈ 80 seconds of 16 kHz mono 16-bit WAV
/** Body: a 16 kHz mono WAV made in the browser. Returns the recognised text only; the audio is not kept. */
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
  if (rateLimited(req, 'tasmee', 12, 60_000)) return NextResponse.json({ error: 'محاولات كثيرة. انتظر دقيقة.' }, { status: 429 });
  const len = Number(req.headers.get('content-length') || 0); if (len > MAX) return NextResponse.json({ error: 'التسجيل أطول من المسموح (٨٠ ثانية).' }, { status: 413 });
  const buf = await req.arrayBuffer(); if (buf.byteLength < 1000 || buf.byteLength > MAX) return NextResponse.json({ error: 'تسجيل غير صالح.' }, { status: 400 });
  const h = new Uint8Array(buf, 0, 12); if (String.fromCharCode(...h.slice(0, 4)) !== 'RIFF' || String.fromCharCode(...h.slice(8, 12)) !== 'WAVE') return NextResponse.json({ error: 'تسجيل غير صالح.' }, { status: 400 });
  const r = await transcribe(buf);
  if ('error' in r) return NextResponse.json({ error: r.error === 'busy' ? 'الخادم مشغول بتسميع آخر. حاول بعد قليل.' : 'خدمة التسميع غير متاحة الآن.' }, { status: r.error === 'busy' ? 429 : 503 });
  return NextResponse.json({ text: r.text }, { headers: { 'cache-control': 'no-store' } });
}
