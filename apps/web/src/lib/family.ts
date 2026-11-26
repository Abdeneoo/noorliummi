import 'server-only';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db';
import { cleanName } from './circles';
import { AGE_BANDS, cleanAllowed, dayKey, periodKey, timeUp, validPin, type Allowed } from './family-rules';
export const KID = 'noor_kid';
const h = (s: string) => createHash('sha256').update(s).digest('hex');
const hashPin = (pin: string) => { const salt = randomBytes(16); return `${salt.toString('hex')}:${scryptSync(pin, salt, 32).toString('hex')}`; };
const checkPin = (pin: string, stored: string) => { const [s, k] = stored.split(':'); if (!s || !k) return false; const a = scryptSync(pin, Buffer.from(s, 'hex'), 32); const b = Buffer.from(k, 'hex'); return a.length === b.length && timingSafeEqual(a, b); };
export const kidCookie = (t: string) => `${KID}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${180 * 86400}`;
export const clearKid = `${KID}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const kidToken = (cookieHeader: string | null) => { const v = (cookieHeader ?? '').split(/;\s*/).find((x) => x.startsWith(`${KID}=`))?.slice(KID.length + 1); return v && /^[a-f0-9]{64}$/.test(v) ? v : null; };
export interface Kid { id: number; name: string; age_band: string; allowed: Allowed; daily_minutes: number | null; used: number; timeUp: boolean }
/** The child behind a child-session token, with today's usage. Null when the session no longer exists. */
export async function kidOf(token: string | null): Promise<Kid | null> {
  if (!token) return null;
  try {
    const r = await db().query<{ id: string; name: string; age_band: string; allowed: unknown; daily_minutes: number | null; used: number | null }>(
      `SELECT c.id, c.name, c.age_band, c.allowed, c.daily_minutes, u.minutes AS used FROM child_sessions s JOIN children c ON c.id = s.child_id
       LEFT JOIN child_usage u ON u.child_id = c.id AND u.day = $2 WHERE s.token_hash = $1`, [h(token), dayKey(new Date())]);
    if (!r.rowCount) return null; const x = r.rows[0]; const used = x.used ?? 0;
    return { id: Number(x.id), name: x.name, age_band: x.age_band, allowed: cleanAllowed(x.allowed), daily_minutes: x.daily_minutes, used, timeUp: timeUp(x.daily_minutes, used) };
  } catch { return null; }
}
export async function startKidSession(parent: number, child: number): Promise<string | null> {
  const c = await db().query('SELECT 1 FROM children WHERE id = $1 AND parent_id = $2', [child, parent]); if (!c.rowCount) return null;
  const t = randomBytes(32).toString('hex'); await db().query('INSERT INTO child_sessions (token_hash, child_id) VALUES ($1,$2)', [h(t), child]); return t;
}
/** Leaving child mode needs the parent's PIN. A session that no longer exists can always be cleared. */
export async function endKidSession(token: string, pin: unknown): Promise<'ok' | 'bad-pin' | 'gone'> {
  const r = await db().query<{ pin_hash: string }>('SELECT c.pin_hash FROM child_sessions s JOIN children c ON c.id = s.child_id WHERE s.token_hash = $1', [h(token)]);
  if (!r.rowCount) return 'gone'; if (!validPin(pin) || !checkPin(pin, r.rows[0].pin_hash)) return 'bad-pin';
  await db().query('DELETE FROM child_sessions WHERE token_hash = $1', [h(token)]); return 'ok';
}
/** One minute of use, counted at most once every 50 seconds per session. */
export async function tick(token: string) {
  const r = await db().query<{ child_id: string }>("UPDATE child_sessions SET last_tick = now() WHERE token_hash = $1 AND (last_tick IS NULL OR last_tick < now() - interval '50 seconds') RETURNING child_id", [h(token)]);
  if (r.rowCount) await db().query('INSERT INTO child_usage (child_id, day, minutes) VALUES ($1,$2,1) ON CONFLICT (child_id, day) DO UPDATE SET minutes = child_usage.minutes + 1', [r.rows[0].child_id, dayKey(new Date())]);
}
export async function kidTasks(child: number) {
  const now = new Date(); const r = await db().query<{ id: string; title: string; period: 'daily' | 'weekly' }>('SELECT id, title, period FROM child_tasks WHERE child_id = $1 ORDER BY period, id', [child]);
  if (!r.rowCount) return [];
  const d = await db().query<{ task_id: string; period_key: string }>('SELECT task_id, period_key FROM child_task_done WHERE task_id = ANY($1)', [r.rows.map((x) => x.id)]);
  const done = new Set(d.rows.map((x) => `${x.task_id}:${x.period_key}`));
  return r.rows.map((x) => ({ id: Number(x.id), title: x.title, period: x.period, done: done.has(`${x.id}:${periodKey(x.period, now)}`) }));
}
export async function setTaskDone(child: number, task: number, on: boolean): Promise<boolean> {
  const t = await db().query<{ period: 'daily' | 'weekly' }>('SELECT period FROM child_tasks WHERE id = $1 AND child_id = $2', [task, child]); if (!t.rowCount) return false;
  const key = periodKey(t.rows[0].period, new Date());
  if (on) await db().query('INSERT INTO child_task_done (task_id, period_key) VALUES ($1,$2) ON CONFLICT DO NOTHING', [task, key]); else await db().query('DELETE FROM child_task_done WHERE task_id = $1 AND period_key = $2', [task, key]);
  return true;
}
// ---- parent side ----
export async function myChildren(parent: number) {
  const r = await db().query<{ id: string; name: string; age_band: string; allowed: unknown; daily_minutes: number | null; used: number | null; devices: number }>(
    `SELECT c.id, c.name, c.age_band, c.allowed, c.daily_minutes, u.minutes AS used, (SELECT count(*) FROM child_sessions s WHERE s.child_id = c.id)::int AS devices
     FROM children c LEFT JOIN child_usage u ON u.child_id = c.id AND u.day = $2 WHERE c.parent_id = $1 ORDER BY c.id`, [parent, dayKey(new Date())]);
  return Promise.all(r.rows.map(async (x) => ({ id: Number(x.id), name: x.name, age_band: x.age_band, allowed: cleanAllowed(x.allowed), daily_minutes: x.daily_minutes, used: x.used ?? 0, devices: x.devices, tasks: await kidTasks(Number(x.id)) })));
}
const minutes = (v: unknown) => (v === null || v === '' || v === undefined ? null : Number.isInteger(Number(v)) && Number(v) >= 5 && Number(v) <= 600 ? Number(v) : undefined);
export async function familyAction(parent: number, b: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const bad = (error: string) => ({ ok: false, error }); const child = Number(b.child);
  const own = async () => Number.isInteger(child) && !!(await db().query('SELECT 1 FROM children WHERE id = $1 AND parent_id = $2', [child, parent])).rowCount;
  switch (b.action) {
    case 'create': {
      const name = cleanName(b.name, 40); const m = minutes(b.daily_minutes);
      if (!name) return bad('اكتب اسم الطفل.'); if (!AGE_BANDS.includes(b.age_band as never)) return bad('اختر الفئة العمرية.'); if (!validPin(b.pin)) return bad('الرقم السري من ٤ إلى ٨ أرقام.'); if (m === undefined) return bad('الوقت اليومي من ٥ إلى ٦٠٠ دقيقة.');
      const n = await db().query<{ n: number }>('SELECT count(*)::int AS n FROM children WHERE parent_id = $1', [parent]); if (n.rows[0].n >= 10) return bad('الحد عشرة أطفال.');
      await db().query('INSERT INTO children (parent_id, name, age_band, allowed, daily_minutes, pin_hash) VALUES ($1,$2,$3,$4,$5,$6)', [parent, name, b.age_band, JSON.stringify(cleanAllowed(b.allowed)), m, hashPin(b.pin)]); return { ok: true };
    }
    case 'update': {
      if (!(await own())) return bad('غير موجود.'); const name = cleanName(b.name, 40); const m = minutes(b.daily_minutes);
      if (!name || !AGE_BANDS.includes(b.age_band as never) || m === undefined) return bad('بيانات غير صحيحة.');
      await db().query('UPDATE children SET name = $2, age_band = $3, allowed = $4, daily_minutes = $5 WHERE id = $1', [child, name, b.age_band, JSON.stringify(cleanAllowed(b.allowed)), m]);
      if (b.pin !== undefined && b.pin !== '') { if (!validPin(b.pin)) return bad('الرقم السري من ٤ إلى ٨ أرقام.'); await db().query('UPDATE children SET pin_hash = $2 WHERE id = $1', [child, hashPin(b.pin)]); }
      return { ok: true };
    }
    case 'delete': if (!(await own())) return bad('غير موجود.'); await db().query('DELETE FROM children WHERE id = $1', [child]); return { ok: true };
    case 'signout-devices': if (!(await own())) return bad('غير موجود.'); await db().query('DELETE FROM child_sessions WHERE child_id = $1', [child]); return { ok: true };
    case 'task-add': {
      if (!(await own())) return bad('غير موجود.'); const title = cleanName(b.title, 120); if (!title || (b.period !== 'daily' && b.period !== 'weekly')) return bad('اكتب المهمة واختر يومية أو أسبوعية.');
      const n = await db().query<{ n: number }>('SELECT count(*)::int AS n FROM child_tasks WHERE child_id = $1', [child]); if (n.rows[0].n >= 30) return bad('الحد ثلاثون مهمة.');
      await db().query('INSERT INTO child_tasks (child_id, title, period) VALUES ($1,$2,$3)', [child, title, b.period]); return { ok: true };
    }
    case 'task-del': if (!(await own())) return bad('غير موجود.'); await db().query('DELETE FROM child_tasks WHERE id = $1 AND child_id = $2', [Number(b.task), child]); return { ok: true };
    default: return bad('طلب غير معروف.');
  }
}
