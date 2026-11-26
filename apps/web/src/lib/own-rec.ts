import 'server-only';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { db } from './db';
/** Where uploaded recordings live on the server (outside the repository). Set NOOR_REC_DIR to change it. */
export const REC_DIR = process.env.NOOR_REC_DIR || join(homedir(), 'noor-recordings');
export const RIGHTS = ['stream', 'host', 'download'] as const;
export interface OwnRec { id: number; reciter_ar: string; reciter_en: string; title: string; dua_text: string; dua_source: string; file_name: string; sha256: string; bytes: number; mime: string; consent: string; consent_date: string | null; rights: string[]; status: string; review_notes: string; created_at: string }
export async function listOwn(onlyPublished = false): Promise<OwnRec[]> {
  try { const r = await db().query<OwnRec>(`SELECT id::int, reciter_ar, reciter_en, title, dua_text, dua_source, file_name, sha256, bytes::int, mime, consent, consent_date::text, rights, status, review_notes, created_at::text FROM own_recordings ${onlyPublished ? "WHERE status = 'published'" : ''} ORDER BY reciter_ar, id`); return r.rows; } catch { return []; }
}
