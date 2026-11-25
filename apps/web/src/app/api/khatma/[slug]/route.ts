import { NextResponse } from 'next/server';
import { isSlug } from '@/lib/athar';
import { rateLimited } from '@/lib/db';
import { addCount, adminAction, claimJuz, cleanReader, getKhatma, newRound, updateJuz } from '@/lib/khatma';
export const dynamic = 'force-dynamic';
const bad = (error = 'طلب غير صالح.', status = 400) => NextResponse.json({ error }, { status });

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug)) return bad('غير موجودة', 404);
  const tokens = (new URL(req.url).searchParams.get('t') ?? '').split(',').filter((t) => /^[A-Za-z0-9_-]{20,64}$/.test(t));
  const k = await getKhatma(slug, tokens); if (!k) return bad('غير موجودة', 404);
  return NextResponse.json(k, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!isSlug(slug)) return bad('غير موجودة', 404);
  if (req.headers.get('x-noor') !== '1') return bad();
  if (rateLimited(req, `khatma:${slug}`, 40, 3600_000)) return bad('محاولات كثيرة. حاول لاحقًا.', 429);
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return bad(); }
  const juz = Number(b.juz); const token = typeof b.token === 'string' ? b.token : '';
  const okJuz = Number.isInteger(juz) && juz >= 1 && juz <= 30;
  try {
    switch (b.action) {
      case 'claim': { if (!okJuz) return bad(); const t = await claimJuz(slug, juz, cleanReader(b.reader)); return t ? NextResponse.json({ token: t }) : bad('سبقك أحد إلى هذا الجزء؛ اختر جزءًا آخر.', 409); }
      case 'done': case 'release': if (!okJuz || !token) return bad(); return (await updateJuz(slug, juz, token, b.action)) ? NextResponse.json({ ok: true }) : bad('لا يمكن تعديل هذا الجزء من هذا الجهاز.', 403);
      case 'add': { const n = Number(b.n); if (!Number.isInteger(n) || n < 1 || n > 100) return bad(); const c = await addCount(slug, n); return c == null ? bad() : NextResponse.json({ count: c }); }
      case 'round': return (await newRound(slug)) ? NextResponse.json({ ok: true }) : bad('لم تكتمل الختمة بعد.', 409);
      case 'free': case 'delete': if (!token || (b.action === 'free' && !okJuz)) return bad(); return (await adminAction(slug, token, b.action, juz)) ? NextResponse.json({ ok: true }) : bad('رابط الإدارة غير صحيح.', 403);
      default: return bad();
    }
  } catch (e) { console.error('khatma action failed', e); return bad('تعذّر الحفظ الآن.', 503); }
}
