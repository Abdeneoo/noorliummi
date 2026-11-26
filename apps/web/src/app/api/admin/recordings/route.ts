import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { REC_DIR, RIGHTS, listOwn } from '@/lib/own-rec';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
const bad = (e: string) => NextResponse.json({ error: e }, { status: 400 });
const MIME: Record<string, string> = { 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'webm' };
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); return NextResponse.json({ items: await listOwn(), dir: REC_DIR }, { headers: { 'cache-control': 'no-store' } }); }
/** Upload a recording (multipart): file + reciter_ar, reciter_en, title, dua_text, dua_source, consent, consent_date, rights[]. Lands in «review». */
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  const fd = await req.formData().catch(() => null); if (!fd) return bad('بيانات غير صالحة.');
  const f = fd.get('file'); if (!(f instanceof File)) return bad('أرفق ملف التسجيل.');
  const ext = MIME[f.type]; if (!ext) return bad('صيغة غير مدعومة (mp3, m4a, ogg, wav, webm).');
  if (f.size > 60 * 1024 * 1024) return bad('الملف أكبر من 60 ميجابايت.');
  const s = (k: string, n: number) => String(fd.get(k) ?? '').trim().slice(0, n);
  const reciter_ar = s('reciter_ar', 80), title = s('title', 160); if (reciter_ar.length < 2 || title.length < 2) return bad('اكتب اسم القارئ وعنوان التسجيل.');
  const consent = s('consent', 2000); if (consent.length < 10) return bad('سجّل نص الموافقة الكتابية أو رابطها قبل الرفع.');
  const rights = fd.getAll('rights').map(String).filter((r) => (RIGHTS as readonly string[]).includes(r));
  const buf = Buffer.from(await f.arrayBuffer()); const sha = createHash('sha256').update(buf).digest('hex'); const name = `${sha.slice(0, 32)}.${ext}`;
  await mkdir(REC_DIR, { recursive: true }); await writeFile(join(REC_DIR, name), buf);
  try {
    const r = await db().query<{ id: string }>(`INSERT INTO own_recordings (reciter_ar, reciter_en, title, dua_text, dua_source, file_name, sha256, bytes, mime, consent, consent_date, rights) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [reciter_ar, s('reciter_en', 80), title, s('dua_text', 4000), s('dua_source', 300), name, sha, buf.length, f.type, consent, /^\d{4}-\d{2}-\d{2}$/.test(s('consent_date', 10)) ? s('consent_date', 10) : null, rights]);
    return NextResponse.json({ ok: true, id: Number(r.rows[0].id) });
  } catch (e) { if (String(e).includes('duplicate')) return bad('هذا الملف مرفوع من قبل (البصمة نفسها).'); await unlink(join(REC_DIR, name)).catch(() => undefined); throw e; }
}
/** Review: status (review/approved/published/rejected), notes, rights. Publishing needs approved first and the «stream» right. */
export async function PATCH(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>; const id = Number(b.id); if (!Number.isInteger(id)) return bad('رقم غير صحيح.');
  const st = ['review', 'approved', 'published', 'rejected'].includes(String(b.status)) ? String(b.status) : null;
  const cur = (await db().query<{ status: string; rights: string[] }>('SELECT status, rights FROM own_recordings WHERE id = $1', [id])).rows[0]; if (!cur) return bad('غير موجود.');
  const rights = Array.isArray(b.rights) ? (b.rights as string[]).filter((r) => (RIGHTS as readonly string[]).includes(r)) : cur.rights;
  if (st === 'published' && (cur.status !== 'approved' && cur.status !== 'published')) return bad('اعتمد التسجيل بعد مراجعته قبل نشره.');
  if (st === 'published' && !rights.includes('stream')) return bad('لا يُنشر دون حق البث في الموافقة.');
  await db().query('UPDATE own_recordings SET status = COALESCE($2, status), review_notes = COALESCE($3, review_notes), rights = $4, updated_at = now() WHERE id = $1', [id, st, typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null, rights]);
  return NextResponse.json({ ok: true });
}
