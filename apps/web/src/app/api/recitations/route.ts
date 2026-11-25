import { NextResponse } from 'next/server';
import { isSlug } from '@/lib/athar';
import { currentUser, sameSite } from '@/lib/auth';
import { MAX_BYTES, cleanMime, listRecitations, saveRecitation } from '@/lib/recitations';
import { SURAHS } from '@/lib/quran';
export const dynamic = 'force-dynamic';
const no = (error = 'سجّل الدخول أولًا.', status = 401) => NextResponse.json({ error }, { status });
export async function GET(req: Request) {
  const u = await currentUser(req); if (!u) return no(); const slug = new URL(req.url).searchParams.get('circle') ?? ''; if (!isSlug(slug)) return no('طلب غير صالح.', 400);
  const l = await listRecitations(slug, u.id); return l ? NextResponse.json(l, { headers: { 'cache-control': 'no-store' } }) : no('غير مسموح.', 403);
}
/** Body = the audio bytes; circle, surah, from, to in the query string. The client sends `x-consent: 1` after the user agreed. */
export async function POST(req: Request) {
  const u = await currentUser(req); if (!u || !sameSite(req)) return no();
  if (req.headers.get('x-consent') !== '1') return no('يلزم قبول شروط التسجيل أولًا.', 400);
  const q = new URL(req.url).searchParams; const slug = q.get('circle') ?? ''; const surah = Number(q.get('surah')); const from = Number(q.get('from')); const to = Number(q.get('to'));
  const mime = cleanMime(req.headers.get('content-type'));
  if (!isSlug(slug) || !mime || !Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > SURAHS[surah - 1].ayas) return no('طلب غير صالح.', 400);
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BYTES) return no('التسجيل أطول من المسموح (٥ دقائق تقريبًا).', 413);
  const data = Buffer.from(await req.arrayBuffer()); if (data.length < 2000 || data.length > MAX_BYTES) return no('تسجيل غير صالح أو أطول من المسموح.', 413);
  const r = await saveRecitation(slug, u.id, { surah, from, to, mime }, data);
  return r === 'ok' ? NextResponse.json({ ok: true }, { status: 201 }) : r === 'limit' ? no('بلغت حد التسجيلات اليومي (٢٠).', 429) : no('لست عضوًا في هذه الحلقة.', 403);
}
