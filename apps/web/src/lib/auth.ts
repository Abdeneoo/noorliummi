import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';

/** Passwordless accounts: a one-time link (20 minutes) creates a 60-day session cookie. Tokens are stored only as hashes. */
export const SESSION = 'noor_s';
const h = (t: string) => createHash('sha256').update(t).digest('hex');
const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9.-]{1,180}\.[a-z]{2,24}$/;
export function normEmail(e: unknown): string | null {
  const s = typeof e === 'string' ? e.trim().toLowerCase() : '';
  return s.length <= 254 && EMAIL.test(s) ? s : null;
}
/** Creates a login link token; returns null when this address asked too often (3 per 15 minutes). */
export async function newLoginToken(email: string): Promise<string | null> {
  const r = await db().query("SELECT count(*)::int AS n FROM login_links WHERE email = $1 AND created_at > now() - interval '15 minutes'", [email]);
  if (r.rows[0].n >= 3) return null;
  const t = randomBytes(32).toString('hex');
  await db().query("INSERT INTO login_links (token_hash, email, expires_at) VALUES ($1, $2, now() + interval '20 minutes')", [h(t), email]);
  await db().query("DELETE FROM login_links WHERE expires_at < now() - interval '1 day'");
  return t;
}
/** Consumes a login link and opens a session. Returns the session token, or null if the link is invalid/used/expired. */
export async function useLoginToken(t: string): Promise<string | null> {
  if (!/^[a-f0-9]{64}$/.test(t)) return null;
  const r = await db().query<{ email: string }>("UPDATE login_links SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING email", [h(t)]);
  if (!r.rowCount) return null;
  const u = await db().query<{ id: string }>('INSERT INTO users (email, last_login) VALUES ($1, now()) ON CONFLICT (email) DO UPDATE SET last_login = now() RETURNING id, status', [r.rows[0].email]);
  if ((u.rows[0] as { status?: string }).status === 'blocked') return null;
  const s = randomBytes(32).toString('hex');
  await db().query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '60 days')", [h(s), u.rows[0].id]);
  return s;
}
export interface User { id: number; email: string }
export async function currentUser(req: Request): Promise<User | null> {
  const c = req.headers.get('cookie') ?? '';
  const v = c.split(/;\s*/).find((x) => x.startsWith(`${SESSION}=`))?.slice(SESSION.length + 1);
  if (!v || !/^[a-f0-9]{64}$/.test(v)) return null;
  try {
    const r = await db().query<{ id: string; email: string }>('SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = \'active\'', [h(v)]);
    return r.rowCount ? { id: Number(r.rows[0].id), email: r.rows[0].email } : null;
  } catch { return null; }
}
export async function endSession(req: Request) {
  const c = req.headers.get('cookie') ?? ''; const v = c.split(/;\s*/).find((x) => x.startsWith(`${SESSION}=`))?.slice(SESSION.length + 1);
  if (v) await db().query('DELETE FROM sessions WHERE token_hash = $1', [h(v)]);
}
export const sessionCookie = (s: string) => `${SESSION}=${s}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 86400}`;
export const clearCookie = `${SESSION}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
/** State-changing account requests must come from our own pages. */
export const sameSite = (req: Request) => req.headers.get('x-noor') === '1';
