import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
  const d = db();
  const [daily, sections, totals] = await Promise.all([
    d.query("SELECT to_char(day, 'YYYY-MM-DD') AS day, sum(views) FILTER (WHERE section <> '_visit')::int AS views, coalesce(sum(views) FILTER (WHERE section = '_visit'), 0)::int AS visits FROM page_stats WHERE day > current_date - 30 GROUP BY day ORDER BY day"),
    d.query("SELECT section, sum(views) FILTER (WHERE day > current_date - 7)::int AS w, sum(views)::int AS m FROM page_stats WHERE day > current_date - 30 AND section <> '_visit' GROUP BY section ORDER BY m DESC"),
    d.query(`SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM users WHERE created_at > now() - interval '7 days')::int AS users_week,
      (SELECT count(*) FROM memorial_pages WHERE status = 'active')::int AS athar, (SELECT count(*) FROM memorial_pages WHERE status = 'active' AND visibility = 'listed')::int AS athar_listed,
      (SELECT count(*) FROM khatma_groups WHERE status = 'active' AND kind = 'quran')::int AS khatmas, (SELECT count(*) FROM khatma_groups WHERE status = 'active' AND kind <> 'quran')::int AS dhikr_pages,
      (SELECT count(*) FROM khatma_juz WHERE done)::int AS juz_done, (SELECT coalesce(sum(count), 0) FROM khatma_groups WHERE kind <> 'quran')::bigint AS group_count,
      (SELECT coalesce(sum(n), 0) FROM athar_activity)::bigint AS lantern`),
  ]);
  return NextResponse.json({ daily: daily.rows, sections: sections.rows, totals: totals.rows[0] }, { headers: { 'cache-control': 'no-store' } });
}
