import 'server-only';
import { db } from './db';
import { FREEZE_AT, hashToken, newSlug, newToken, type AtharInput, type AtharItem } from './athar';

export interface AtharPage { id: number; slug: string; display_name: string; dedication: string; dua_text: string; status: 'active' | 'frozen'; items: AtharItem[] }

export async function createPage(v: AtharInput): Promise<{ slug: string; token: string }> {
  const token = newToken(); const c = await db().connect();
  try {
    await c.query('BEGIN');
    for (let attempt = 0; ; attempt++) {
      const slug = newSlug();
      const r = await c.query<{ id: string }>(
        'INSERT INTO memorial_pages (slug, display_name, dedication, dua_text, edit_token_hash) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING RETURNING id',
        [slug, v.display_name, v.dedication, v.dua_text, hashToken(token)]);
      if (r.rowCount) { await writeItems(c, Number(r.rows[0].id), v.items); await c.query('COMMIT'); return { slug, token }; }
      if (attempt > 4) throw new Error('slug collision');
    }
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

async function writeItems(c: { query: (q: string, p: unknown[]) => Promise<unknown> }, id: number, items: AtharItem[]) {
  await c.query('DELETE FROM memorial_page_content WHERE page_id = $1', [id]);
  for (const [i, it] of items.entries()) await c.query('INSERT INTO memorial_page_content (page_id, kind, ref, sort) VALUES ($1,$2,$3,$4)', [id, it.kind, it.ref, i]);
}

export async function getPage(slug: string): Promise<AtharPage | null> {
  const r = await db().query("SELECT id, slug, display_name, dedication, dua_text, status FROM memorial_pages WHERE slug = $1 AND status <> 'removed'", [slug]);
  if (!r.rowCount) return null;
  const p = r.rows[0];
  const items = await db().query<{ kind: 'surah' | 'dhikr' | 'reciter'; ref: number }>('SELECT kind, ref FROM memorial_page_content WHERE page_id = $1 ORDER BY sort', [p.id]);
  return { ...p, id: Number(p.id), items: items.rows };
}

/** Owner actions need the edit token; returns false if slug/token do not match. */
export async function updatePage(slug: string, token: string, v: AtharInput): Promise<boolean> {
  const c = await db().connect();
  try {
    await c.query('BEGIN');
    const r = await c.query<{ id: string }>("UPDATE memorial_pages SET display_name=$3, dedication=$4, dua_text=$5, updated_at=now() WHERE slug=$1 AND edit_token_hash=$2 AND status <> 'removed' RETURNING id",
      [slug, hashToken(token), v.display_name, v.dedication, v.dua_text]);
    if (!r.rowCount) { await c.query('ROLLBACK'); return false; }
    await writeItems(c, Number(r.rows[0].id), v.items); await c.query('COMMIT'); return true;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/** Deletion clears the text immediately (privacy) and hides the page. */
export async function deletePage(slug: string, token: string): Promise<boolean> {
  const r = await db().query("UPDATE memorial_pages SET status='removed', display_name='-', dedication='', dua_text='', deleted_at=now(), updated_at=now() WHERE slug=$1 AND edit_token_hash=$2 AND status <> 'removed' RETURNING id", [slug, hashToken(token)]);
  if (r.rowCount) await db().query('DELETE FROM memorial_page_content WHERE page_id = $1', [r.rows[0].id]);
  return !!r.rowCount;
}

/** A report is recorded; after FREEZE_AT reports the page is frozen until a human reviews it. */
export async function reportPage(slug: string, reason: string): Promise<boolean> {
  const r = await db().query<{ id: string }>(
    "UPDATE memorial_pages SET report_count = report_count + 1, status = CASE WHEN report_count + 1 >= $2 THEN 'frozen' ELSE status END WHERE slug=$1 AND status <> 'removed' RETURNING id", [slug, FREEZE_AT]);
  if (!r.rowCount) return false;
  await db().query("INSERT INTO content_reports (target_type, target_id, reason) VALUES ('memorial_page', $1, $2)", [r.rows[0].id, reason]);
  return true;
}

// ---- Moderation (admin only; routes check the admin cookie before calling these) ----
export interface ModRow { id: number; slug: string; display_name: string; dedication: string; dua_text: string; status: string; report_count: number; created_at: string; reasons: string[] }
export async function modQueue(): Promise<{ rows: ModRow[]; counts: Record<string, number>; openReports: number }> {
  const rows = await db().query<ModRow>(`
    SELECT p.id, p.slug, p.display_name, p.dedication, p.dua_text, p.status, p.report_count, p.created_at::text,
           COALESCE(array_agg(r.reason ORDER BY r.created_at DESC) FILTER (WHERE r.id IS NOT NULL), '{}') AS reasons
    FROM memorial_pages p
    LEFT JOIN content_reports r ON r.target_type = 'memorial_page' AND r.target_id = p.id AND r.status = 'open'
    WHERE p.status = 'frozen' OR r.id IS NOT NULL
    GROUP BY p.id ORDER BY (p.status = 'frozen') DESC, p.report_count DESC, p.id DESC LIMIT 200`);
  const c = await db().query<{ status: string; n: string }>('SELECT status, count(*)::text AS n FROM memorial_pages GROUP BY status');
  const o = await db().query<{ n: string }>("SELECT count(*)::text AS n FROM content_reports WHERE status = 'open'");
  return { rows: rows.rows.map((r) => ({ ...r, id: Number(r.id) })), counts: Object.fromEntries(c.rows.map((x) => [x.status, Number(x.n)])), openReports: Number(o.rows[0].n) };
}
/** approve: reactivate and clear reports · remove: hide and erase text · dismiss: close reports, keep status */
export async function modAction(id: number, action: 'approve' | 'remove' | 'dismiss'): Promise<boolean> {
  const c = await db().connect();
  try {
    await c.query('BEGIN');
    let r;
    if (action === 'approve') r = await c.query("UPDATE memorial_pages SET status='active', report_count=0, updated_at=now() WHERE id=$1 AND status<>'removed'", [id]);
    else if (action === 'remove') {
      r = await c.query("UPDATE memorial_pages SET status='removed', display_name='-', dedication='', dua_text='', deleted_at=now(), updated_at=now() WHERE id=$1 AND status<>'removed'", [id]);
      await c.query('DELETE FROM memorial_page_content WHERE page_id=$1', [id]);
    } else r = await c.query('SELECT 1 FROM memorial_pages WHERE id=$1', [id]);
    await c.query("UPDATE content_reports SET status='closed' WHERE target_type='memorial_page' AND target_id=$1 AND status='open'", [id]);
    await c.query('COMMIT');
    return !!r.rowCount;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}
