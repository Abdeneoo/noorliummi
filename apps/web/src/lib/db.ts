import 'server-only';
import { Pool } from 'pg';

let pool: Pool | null = null;
/** Connection pool for the noorliummi database only. DATABASE_URL comes from the server's secrets file. */
export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  return (pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30000 }));
}

// Simple per-IP rate limit (single process). Caddy sets X-Forwarded-For.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, bucket: string, max: number, windowMs: number): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  const key = `${bucket}:${ip}`; const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return false;
}
