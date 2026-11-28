import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';

import { ALL_KEYS, REVIEW } from './review-items';
export { ALL_KEYS, REVIEW };
const hash = (t: string) => createHash('sha256').update(t).digest('hex');
export async function reviewerByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return null;
  const r = await db().query('SELECT id, name FROM reviewers WHERE token_hash = $1 AND active', [hash(token)]); return (r.rows[0] as { id: number; name: string } | undefined) ?? null;
}
export async function marksOf(id: number) { const r = await db().query('SELECT item_key, verdict, note, updated_at FROM review_marks WHERE reviewer_id = $1', [id]); return r.rows as { item_key: string; verdict: 'ok' | 'note'; note: string; updated_at: string }[]; }
export async function saveMark(id: number, key: string, verdict: 'ok' | 'note' | 'clear', note: string) {
  if (verdict === 'clear') { await db().query('DELETE FROM review_marks WHERE reviewer_id = $1 AND item_key = $2', [id, key]); return; }
  await db().query(`INSERT INTO review_marks (reviewer_id, item_key, verdict, note) VALUES ($1, $2, $3, $4)
    ON CONFLICT (reviewer_id, item_key) DO UPDATE SET verdict = EXCLUDED.verdict, note = EXCLUDED.note, updated_at = now()`, [id, key, verdict, note.slice(0, 4000)]);
}
export async function createReviewer(name: string) { const token = randomBytes(24).toString('base64url'); await db().query('INSERT INTO reviewers (name, token_hash) VALUES ($1, $2)', [name, hash(token)]); return token; }
export async function allReviews() {
  const rv = await db().query('SELECT id, name, active, created_at FROM reviewers ORDER BY id');
  const mk = await db().query('SELECT reviewer_id, item_key, verdict, note, updated_at FROM review_marks ORDER BY updated_at DESC');
  return { reviewers: rv.rows as { id: number; name: string; active: boolean; created_at: string }[], marks: mk.rows as { reviewer_id: number; item_key: string; verdict: string; note: string; updated_at: string }[] };
}
export async function setActive(id: number, active: boolean) { await db().query('UPDATE reviewers SET active = $2 WHERE id = $1', [id, active]); }
