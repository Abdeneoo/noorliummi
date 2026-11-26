import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
/** Published translations of one Hisn al-Muslim chapter (IslamHouse, verbatim), keyed by language. Empty when none was verified. */
export type AdhkarTr = { book: number; title: string; items: { ar: string; t: string }[] };
export function adhkarTranslations(id: number): Partial<Record<'ur' | 'tr' | 'id', AdhkarTr>> {
  const out: Partial<Record<'ur' | 'tr' | 'id', AdhkarTr>> = {};
  for (const l of ['ur', 'tr', 'id'] as const) { const f = join(process.cwd(), 'src/generated/adhkar-tr', l, `${id}.json`); if (existsSync(f)) out[l] = JSON.parse(readFileSync(f, 'utf8')); }
  return out;
}
