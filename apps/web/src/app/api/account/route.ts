import { NextResponse } from 'next/server';
import { clearCookie, currentUser, sameSite } from '@/lib/auth';
import { ownedPages } from '@/lib/athar-store';
import { db } from '@/lib/db';
import { deleteFilesOf } from '@/lib/recitations';
import { mailEnabled } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const u = await currentUser(req);
  if (!u) return NextResponse.json({ user: null, mail: mailEnabled() }, { headers: { 'cache-control': 'no-store' } });
  return NextResponse.json({ user: { email: u.email }, pages: await ownedPages(u.id), mail: true }, { headers: { 'cache-control': 'no-store' } });
}
/** Deletes the account (email and sessions). Pages stay online and remain editable with their edit links. */
export async function DELETE(req: Request) {
  const u = await currentUser(req);
  if (!u || !sameSite(req)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 403 });
  await deleteFilesOf(u.id);
  await db().query('DELETE FROM users WHERE id = $1', [u.id]);
  await db().query('DELETE FROM login_links WHERE email = $1', [u.email]);
  return NextResponse.json({ ok: true }, { headers: { 'set-cookie': clearCookie } });
}
