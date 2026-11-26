import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { listRights } from '@/lib/rights';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); return NextResponse.json({ rights: await listRights() }, { headers: { 'cache-control': 'no-store' } }); }
const STATUS = ['not_requested', 'requested', 'approved', 'partial', 'refused']; const PUB = ['held', 'link_only', 'embed_only', 'stream', 'published'];
/** Update one record: status, request date, approval document (link or note), publish status, notes. */
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: Record<string, unknown> = {}; try { b = await req.json(); } catch { /* empty */ }
  const key = String(b.key ?? ''); if (!/^[a-z0-9-]{2,40}$/.test(key)) return NextResponse.json({ error: 'مفتاح غير صحيح.' }, { status: 400 });
  const status = STATUS.includes(String(b.status)) ? String(b.status) : null; const pub = PUB.includes(String(b.publish_status)) ? String(b.publish_status) : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.requested_on ?? '')) ? String(b.requested_on) : null;
  if ((pub === 'published' || pub === 'stream') && status !== 'approved' && status !== 'partial') return NextResponse.json({ error: 'لا يُنشر ولا يُبث قبل تسجيل الموافقة.' }, { status: 400 });
  if (pub === 'stream' && key === 'islamweb-dua') return NextResponse.json({ error: 'إسلام ويب يمنع تشغيل ملفاته من مواقع أخرى؛ البث يحتاج موافقة وإتاحة تقنية منهم.' }, { status: 400 });
  await db().query(`UPDATE content_rights SET status = COALESCE($2, status), publish_status = COALESCE($3, publish_status), requested_on = COALESCE($4::date, requested_on),
    approval = COALESCE($5, approval), notes = COALESCE($6, notes), contact = COALESCE($7, contact), updated_at = now() WHERE key = $1`,
    [key, status, pub, date, typeof b.approval === 'string' ? b.approval.slice(0, 2000) : null, typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null, typeof b.contact === 'string' ? b.contact.slice(0, 300) : null]);
  return NextResponse.json({ ok: true });
}
