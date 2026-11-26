import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { db } from '@/lib/db';
import { lessonControl, resetLessonControl } from '@/lib/islamhouse';
export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
export async function GET(req: Request) { if (!isAdmin(req)) return deny(); resetLessonControl(); const c = await lessonControl(); return NextResponse.json({ off: c.off, hidden: [...c.hidden] }, { headers: { 'cache-control': 'no-store' } }); }
/** { off: boolean } closes/opens the section; { action: 'hide' | 'show', id } hides or restores an item, category or author by its IslamHouse id. */
export async function POST(req: Request) {
  if (!isAdmin(req) || !sameOrigin(req)) return deny();
  let b: { off?: boolean; action?: string; id?: number } = {}; try { b = await req.json(); } catch { /* empty */ }
  const set = (k: string, v: string) => db().query('INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()', [k, v]);
  if (typeof b.off === 'boolean') await set('lessons.off', b.off ? '1' : '0');
  else if ((b.action === 'hide' || b.action === 'show') && Number.isInteger(b.id) && (b.id as number) > 0) {
    resetLessonControl(); const h = (await lessonControl()).hidden; if (b.action === 'hide') { if (h.size >= 2000) return NextResponse.json({ error: 'القائمة ممتلئة.' }, { status: 400 }); h.add(b.id as number); } else h.delete(b.id as number);
    await set('lessons.hidden', [...h].join(','));
  } else return NextResponse.json({ error: 'طلب غير صحيح.' }, { status: 400 });
  resetLessonControl(); return NextResponse.json({ ok: true });
}
