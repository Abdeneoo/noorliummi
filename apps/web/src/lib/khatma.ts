import 'server-only';
import { db } from './db';
import { hashToken, newSlug, newToken } from './athar';
export { validateKhatma, cleanReader } from './khatma-rules';

export interface Juz { juz: number; reader: string; done: boolean; mine?: boolean }
export interface Khatma { slug: string; display_name: string; feminine: boolean; athar_slug: string | null; round: number; status: string; juz: Juz[]; rounds_done: number }

export async function createKhatma(v: { display_name: string; feminine: boolean; athar_slug: string | null }) {
  const token = newToken();
  for (let i = 0; i < 5; i++) {
    const slug = newSlug();
    const r = await db().query('INSERT INTO khatma_groups (slug, display_name, feminine, athar_slug, admin_token_hash) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING RETURNING id', [slug, v.display_name, v.feminine, v.athar_slug, hashToken(token)]);
    if (r.rowCount) return { slug, token };
  }
  throw new Error('slug collision');
}

export async function getKhatma(slug: string, claimTokens: string[] = []): Promise<Khatma | null> {
  const g = await db().query("SELECT id, slug, display_name, feminine, athar_slug, round, status FROM khatma_groups WHERE slug = $1 AND status <> 'removed'", [slug]);
  if (!g.rowCount) return null;
  const row = g.rows[0];
  const mine = new Set(claimTokens.slice(0, 30).map(hashToken));
  const j = await db().query<{ juz: number; reader: string; done: boolean; claim_token_hash: string }>('SELECT juz, reader, done, claim_token_hash FROM khatma_juz WHERE group_id = $1 AND round = $2', [row.id, row.round]);
  const juz: Juz[] = j.rows.map((r) => ({ juz: r.juz, reader: r.reader, done: r.done, mine: mine.has(r.claim_token_hash) }));
  return { slug: row.slug, display_name: row.display_name, feminine: row.feminine, athar_slug: row.athar_slug, round: row.round, status: row.status, juz, rounds_done: row.round - 1 };
}

/** Take a free juz'. Returns a claim token (kept on the reader's device) or null if already taken. */
export async function claimJuz(slug: string, juz: number, reader: string): Promise<string | null> {
  const token = newToken();
  const r = await db().query(
    `INSERT INTO khatma_juz (group_id, round, juz, reader, claim_token_hash)
     SELECT id, round, $2, $3, $4 FROM khatma_groups WHERE slug = $1 AND status = 'active'
     ON CONFLICT DO NOTHING`, [slug, juz, reader, hashToken(token)]);
  return r.rowCount ? token : null;
}

/** done=true marks the juz' read; done=false with release=true gives it back. Needs the claim token. */
export async function updateJuz(slug: string, juz: number, token: string, action: 'done' | 'release'): Promise<boolean> {
  const q = action === 'done'
    ? `UPDATE khatma_juz j SET done = true, done_at = now() FROM khatma_groups g WHERE g.slug = $1 AND j.group_id = g.id AND j.round = g.round AND j.juz = $2 AND j.claim_token_hash = $3`
    : `DELETE FROM khatma_juz j USING khatma_groups g WHERE g.slug = $1 AND j.group_id = g.id AND j.round = g.round AND j.juz = $2 AND j.claim_token_hash = $3 AND j.done = false`;
  const r = await db().query(q, [slug, juz, hashToken(token)]);
  return (r.rowCount ?? 0) > 0;
}

/** Starts a new round once all 30 are read (anyone may do it: the previous round is complete). */
export async function newRound(slug: string): Promise<boolean> {
  const r = await db().query(
    `UPDATE khatma_groups g SET round = round + 1 WHERE slug = $1 AND status = 'active'
     AND (SELECT count(*) FROM khatma_juz j WHERE j.group_id = g.id AND j.round = g.round AND j.done) = 30`, [slug]);
  return (r.rowCount ?? 0) > 0;
}

/** The creator (admin token) can free a juz' someone took and never read, or delete the khatma. */
export async function adminAction(slug: string, token: string, action: 'free' | 'delete', juz?: number): Promise<boolean> {
  const g = await db().query('SELECT id, round FROM khatma_groups WHERE slug = $1 AND admin_token_hash = $2', [slug, hashToken(token)]);
  if (!g.rowCount) return false;
  if (action === 'delete') { await db().query("UPDATE khatma_groups SET status = 'removed' WHERE id = $1", [g.rows[0].id]); return true; }
  await db().query('DELETE FROM khatma_juz WHERE group_id = $1 AND round = $2 AND juz = $3', [g.rows[0].id, g.rows[0].round, juz]);
  return true;
}
