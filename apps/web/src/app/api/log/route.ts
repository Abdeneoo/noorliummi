import { appendFile, mkdir, stat, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/db';
/**
 * Self-hosted error log: visitors' browsers report script errors here (message, stack, page path only).
 * No IP address, user agent or other visitor data is stored. File: $NOOR_HOME/reports/client-errors.log (rotated at 1 MB).
 */
export const dynamic = 'force-dynamic';
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ⏎ ').slice(0, n) : '');
export async function POST(req: Request) {
  if (rateLimited(req, 'log', 30, 3600_000)) return new NextResponse(null, { status: 204 });
  let b: Record<string, unknown>; try { b = JSON.parse(await req.text()); } catch { return new NextResponse(null, { status: 204 }); }
  const path = clip(b.p, 200).replace(/[?#].*$/, '');
  const line = JSON.stringify({ t: new Date().toISOString(), p: path, m: clip(b.m, 300), s: clip(b.s, 800), k: clip(b.k, 20) }) + '\n';
  const dir = join(process.env.NOOR_HOME || '/tmp/noor', 'reports'); const f = join(dir, 'client-errors.log');
  try {
    await mkdir(dir, { recursive: true });
    try { if ((await stat(f)).size > 1_000_000) await rename(f, `${f}.1`); } catch { /* no file yet */ }
    await appendFile(f, line);
  } catch { /* never fail the visitor */ }
  return new NextResponse(null, { status: 204 });
}
