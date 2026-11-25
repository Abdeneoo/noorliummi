import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
/** The last 200 entries of the self-hosted error log (script errors and missing pages). */
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'غير مسموح.' }, { status: 401 });
  const f = join(process.env.NOOR_HOME || '/tmp/noor', 'reports', 'client-errors.log');
  const lines = (await readFile(f, 'utf8').catch(() => '')).trim().split('\n').filter(Boolean).slice(-200).reverse();
  return NextResponse.json({ rows: lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) }, { headers: { 'cache-control': 'no-store' } });
}
