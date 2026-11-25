/**
 * Generates read-only JSON for the reader from the verbatim Tanzil XML.
 * Text is copied character-for-character; this script only changes the container format.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTanzilMetadata, parseTanzilText, sha256File } from '../../../packages/islamic-core/src/index';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../database/sources/tanzil');
const out = resolve(here, '../src/generated');
mkdirSync(`${out}/surah`, { recursive: true });

const sums = Object.fromEntries(readFileSync(`${src}/SHA256SUMS`, 'utf8').trim().split('\n').map((l) => l.split(/\s+/).reverse() as [string, string]));
for (const f of ['uthmani.xml', 'quran-data.xml']) {
  if (sha256File(`${src}/${f}`) !== sums[f]) throw new Error(`Checksum mismatch for ${f} — refusing to build`);
}
const meta = parseTanzilMetadata(readFileSync(`${src}/quran-data.xml`, 'utf8'));
const ayat = parseTanzilText(readFileSync(`${src}/uthmani.xml`, 'utf8'));
if (meta.length !== 114 || ayat.length !== 6236) throw new Error('Quran structure check failed — refusing to build');

writeFileSync(`${out}/surahs.json`, JSON.stringify(meta));
for (const m of meta) {
  const rows = ayat.filter((a) => a.sura === m.index);
  if (rows.length !== m.ayas) throw new Error(`Ayah count mismatch in sura ${m.index}`);
  writeFileSync(`${out}/surah/${m.index}.json`, JSON.stringify({ meta: m, bismillah: rows[0].bismillah ?? null, ayat: rows.map((a) => ({ n: a.aya, t: a.text })) }));
}
console.log(`Quran JSON generated: ${meta.length} suras, ${ayat.length} ayat (checksums verified)`);
