import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';
import { hashPassword, passwordProblem, verifyPassword } from './password';

/** Email + password accounts. A session cookie lasts 60 days. Passwords are kept only as scrypt hashes; session and reset tokens only as SHA-256 hashes. */
export const SESSION = 'noor_s';
const h = (t: string) => createHash('sha256').update(t).digest('hex');
const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9.-]{1,180}\.[a-z]{2,24}$/;
export function normEmail(e: unknown): string | null {
  const s = typeof e === 'string' ? e.trim().toLowerCase() : '';
  return s.length <= 254 && EMAIL.test(s) ? s : null;
}
type Result = { session: string } | { error: string; status: number };
async function openSession(userId: string | number): Promise<string> {
  const s = randomBytes(32).toString('hex');
  await db().query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '60 days')", [h(s), userId]);
  await db().query('UPDATE users SET last_login = now() WHERE id = $1', [userId]);
  return s;
}
/** New account. An address that already has an account cannot be registered again (sign in, or reset the password). */
export async function register(email: string, pw: string): Promise<Result> {
  const bad = passwordProblem(pw, email); if (bad) return { error: bad, status: 400 };
  const hash = await hashPassword(pw);
  const r = await db().query<{ id: string }>('INSERT INTO users (email, password_hash, password_set_at, last_login) VALUES ($1, $2, now(), now()) ON CONFLICT (email) DO NOTHING RETURNING id', [email, hash]);
  if (!r.rowCount) return { error: 'هذا البريد له حساب بالفعل. سجّل الدخول، أو استخدم «نسيت كلمة المرور».', status: 409 };
  return { session: await openSession(r.rows[0].id) };
}
const WRONG = 'البريد أو كلمة المرور غير صحيحة.';
/** Sign in. After 8 wrong passwords for one address in 15 minutes, that address waits 15 minutes. */
export async function signIn(email: string, pw: string): Promise<Result> {
  const f = await db().query("SELECT count(*)::int AS n FROM login_failures WHERE email = $1 AND at > now() - interval '15 minutes'", [email]);
  if (f.rows[0].n >= 8) return { error: 'محاولات خاطئة كثيرة لهذا البريد. انتظر 15 دقيقة أو استخدم «نسيت كلمة المرور».', status: 429 };
  const u = await db().query<{ id: string; password_hash: string | null; status: string }>('SELECT id, password_hash, status FROM users WHERE email = $1', [email]);
  const row = u.rows[0];
  const ok = await verifyPassword(typeof pw === 'string' ? pw : '', row?.password_hash);
  if (!ok || !row) {
    await db().query('INSERT INTO login_failures (email) VALUES ($1)', [email]);
    await db().query("DELETE FROM login_failures WHERE at < now() - interval '1 day'");
    return { error: row && !row.password_hash ? `${WRONG} إن كان حسابك قديمًا (قبل كلمات المرور) فاستخدم «نسيت كلمة المرور» لتعيين واحدة.` : WRONG, status: 401 };
  }
  if (row.status === 'blocked') return { error: 'هذا الحساب موقوف.', status: 403 };
  await db().query('DELETE FROM login_failures WHERE email = $1', [email]);
  return { session: await openSession(row.id) };
}
/** "Forgot password": a one-time link valid 30 minutes, only for an existing account; at most 3 per 15 minutes. */
export async function newResetToken(email: string): Promise<string | null> {
  const u = await db().query('SELECT 1 FROM users WHERE email = $1 AND status = \'active\'', [email]);
  if (!u.rowCount) return null;
  const r = await db().query("SELECT count(*)::int AS n FROM login_links WHERE email = $1 AND created_at > now() - interval '15 minutes'", [email]);
  if (r.rows[0].n >= 3) return null;
  const t = randomBytes(32).toString('hex');
  await db().query("INSERT INTO login_links (token_hash, email, expires_at, purpose) VALUES ($1, $2, now() + interval '30 minutes', 'reset')", [h(t), email]);
  await db().query("DELETE FROM login_links WHERE expires_at < now() - interval '1 day'");
  return t;
}
/** Uses a reset link: sets the new password, signs out every other device, and opens a session here. */
export async function useResetToken(t: string, pw: string): Promise<Result> {
  if (!/^[a-f0-9]{64}$/.test(t)) return { error: 'الرابط غير صالح.', status: 400 };
  const peek = await db().query<{ email: string }>("SELECT email FROM login_links WHERE token_hash = $1 AND purpose = 'reset' AND used_at IS NULL AND expires_at > now()", [h(t)]);
  if (!peek.rowCount) return { error: 'الرابط غير صالح أو انتهت مدته أو استُخدم من قبل. اطلب رابطًا جديدًا.', status: 400 };
  const bad = passwordProblem(pw, peek.rows[0].email); if (bad) return { error: bad, status: 400 };
  const used = await db().query<{ email: string }>("UPDATE login_links SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL RETURNING email", [h(t)]);
  if (!used.rowCount) return { error: 'استُخدم هذا الرابط من قبل.', status: 400 };
  const u = await db().query<{ id: string }>("UPDATE users SET password_hash = $2, password_set_at = now() WHERE email = $1 AND status = 'active' RETURNING id", [used.rows[0].email, await hashPassword(pw)]);
  if (!u.rowCount) return { error: 'الحساب غير متاح.', status: 400 };
  await db().query('DELETE FROM sessions WHERE user_id = $1', [u.rows[0].id]);
  await db().query('DELETE FROM login_failures WHERE email = $1', [used.rows[0].email]);
  return { session: await openSession(u.rows[0].id) };
}
/** Change password while signed in (the current one is required if the account has one). Other devices are signed out. */
export async function changePassword(req: Request, user: User, current: unknown, next: unknown): Promise<{ ok: true } | { error: string; status: number }> {
  const r = await db().query<{ password_hash: string | null }>('SELECT password_hash FROM users WHERE id = $1', [user.id]);
  const had = r.rows[0]?.password_hash;
  if (had && !(await verifyPassword(typeof current === 'string' ? current : '', had))) return { error: 'كلمة المرور الحالية غير صحيحة.', status: 400 };
  const bad = passwordProblem(next, user.email); if (bad) return { error: bad, status: 400 };
  await db().query('UPDATE users SET password_hash = $2, password_set_at = now() WHERE id = $1', [user.id, await hashPassword(next as string)]);
  const c = req.headers.get('cookie') ?? ''; const v = c.split(/;\s*/).find((x) => x.startsWith(`${SESSION}=`))?.slice(SESSION.length + 1) ?? '';
  await db().query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [user.id, h(v)]);
  return { ok: true };
}
export async function hasPassword(id: number) { const r = await db().query('SELECT password_hash IS NOT NULL AS p FROM users WHERE id = $1', [id]); return !!r.rows[0]?.p; }
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
