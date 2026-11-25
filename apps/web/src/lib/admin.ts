import 'server-only';
import { timingSafeEqual } from 'node:crypto';

/** Admin access: ADMIN_TOKEN lives only in the server's secrets file. Without it, the admin area is disabled. */
export const COOKIE = 'noor_admin';
export const adminEnabled = () => (process.env.ADMIN_TOKEN ?? '').trim().length >= 32;
export function tokenOk(t: string | undefined | null): boolean {
  const want = (process.env.ADMIN_TOKEN ?? '').trim(); if (want.length < 32 || !t) return false;
  const a = Buffer.from(t); const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function isAdmin(req: Request): boolean {
  const c = req.headers.get('cookie') ?? '';
  const v = c.split(/;\s*/).find((x) => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  return tokenOk(v ? decodeURIComponent(v) : null);
}
/** State-changing admin requests must come from our own page (cookie is SameSite=Strict as well). */
export const sameOrigin = (req: Request) => req.headers.get('x-noor-admin') === '1';
