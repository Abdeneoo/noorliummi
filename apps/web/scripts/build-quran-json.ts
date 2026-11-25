/**
 * Generates read-only JSON for the reader from the verbatim Tanzil XML.
 * Text is copied character-for-character; this script only changes the container format.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normDhikr } from '../src/lib/dhikr-norm';
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

// ---- Adhkar (Hisn al-Muslim): container conversion only, text untouched ----
{
  const dir = resolve(here, '../../../database/sources/hisn-al-muslim');
  const [sum] = readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split(/\s+/);
  if (sha256File(`${dir}/hisn.json`) !== sum) throw new Error('Checksum mismatch for hisn.json — refusing to build');
  const raw = JSON.parse(readFileSync(`${dir}/hisn.json`, 'utf8')) as Record<string, { Adhkar: { Text: string; Count: number; Reference?: string }[] }>;
  // OpenDua recordings (CC BY 4.0) attached only on an exact match of the Arabic text after removing diacritics/punctuation.
  const od = resolve(here, '../../../database/sources/opendua');
  if (sha256File(`${od}/catalogue.json`) !== readFileSync(`${od}/SHA256SUMS`, 'utf8').trim().split(/\s+/)[0]) throw new Error('Checksum mismatch for opendua catalogue.json — refusing to build');
  const cat = JSON.parse(readFileSync(`${od}/catalogue.json`, 'utf8')) as { entries: { variations?: { steps: { items?: { dua?: { arabic: string } }[]; recordings?: { url: string }[] }[] }[] }[] };
  const audio = new Map<string, string>();
  for (const e of cat.entries) for (const v of e.variations ?? []) for (const st of v.steps) {
    if (st.items?.length === 1 && st.items[0].dua && st.recordings?.length === 1) audio.set(normDhikr(st.items[0].dua.arabic), st.recordings[0].url.split('/').pop()!);
  }
  let withAudio = 0;
  const cats = Object.entries(raw).map(([title, v], i) => ({
    id: i + 1,
    title,
    items: v.Adhkar.map((d, j) => {
      const a = audio.get(normDhikr(d.Text)); if (a) withAudio++;
      return { n: j + 1, t: d.Text.replace(/\r\n/g, '\n'), c: d.Count, r: d.Reference ?? '', ...(a ? { a } : {}) };
    }),
  }));
  console.log(`Adhkar with OpenDua audio: ${withAudio}`);
  mkdirSync(`${out}/adhkar`, { recursive: true });
  writeFileSync(`${out}/adhkar/index.json`, JSON.stringify(cats.map((c) => ({ id: c.id, title: c.title, count: c.items.length }))));
  for (const c of cats) writeFileSync(`${out}/adhkar/${c.id}.json`, JSON.stringify(c));
  console.log(`Adhkar JSON generated: ${cats.length} categories, ${cats.reduce((n, c) => n + c.items.length, 0)} entries`);
}

// ---- Adhan audio registry: only entries marked publish:true whose file exists ----
{
  const reg = JSON.parse(readFileSync(resolve(here, '../../../database/sources/adhan/registry.json'), 'utf8')) as Record<string, any>[];
  const pub = reg.filter((r) => r.publish && r.local_file_path && existsSync(resolve(here, '../public' + r.local_file_path)) && r.redistribution_allowed && r.self_hosting_allowed)
    .map((r) => ({ id: r.audio_id, title: r.title, by: r.copyright_holder, license: r.license_name, licenseUrl: r.license_url, source: r.source_page_url, kind: r.adhan_type, file: r.local_file_path, duration: r.duration, note: r.modification_notes || undefined }));
  writeFileSync(`${out}/adhan-registry.json`, JSON.stringify(pub));
  console.log(`Adhan registry: ${pub.length} published of ${reg.length} registered`);
}

// ---- Tafsir al-Jalalayn: verified by checksum, re-keyed by ayah, text untouched ----
{
  const dir = resolve(here, '../../../database/sources/tafsir-jalalayn');
  const sums = Object.fromEntries(readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split('\n').map((l) => l.split(/\s+/).reverse() as [string, string]));
  mkdirSync(`${out}/tafsir/jalalayn`, { recursive: true });
  let n = 0;
  for (let i = 1; i <= 114; i++) {
    if (sha256File(`${dir}/${i}.json`) !== sums[`${i}.json`]) throw new Error(`Checksum mismatch for tafsir ${i}.json — refusing to build`);
    const rows = JSON.parse(readFileSync(`${dir}/${i}.json`, 'utf8')) as { text: string; ayah: number; surah: number }[];
    const map: Record<number, string> = {};
    for (const r of rows) { if (r.surah !== i) throw new Error(`Tafsir surah mismatch in ${i}.json`); map[r.ayah] = r.text; n++; }
    writeFileSync(`${out}/tafsir/jalalayn/${i}.json`, JSON.stringify(map));
  }
  console.log(`Tafsir al-Jalalayn generated: ${n} entries`);
}

// ---- Mutashabihat (CC0): verified by checksum, absolute ayah numbers re-keyed to sura:ayah ----
{
  const dir = resolve(here, '../../../database/sources/mutashabihat');
  if (sha256File(`${dir}/mutashabiha_data.json`) !== readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split(/\s+/)[0]) throw new Error('Checksum mismatch for mutashabiha_data.json — refusing to build');
  const raw = JSON.parse(readFileSync(`${dir}/mutashabiha_data.json`, 'utf8')) as Record<string, { src: { ayah: number | number[] }; muts: { ayah: number | number[] }[] }[]>;
  const ref = (abs: number) => { const a = ayat[abs - 1]; if (!a) throw new Error(`Bad absolute ayah ${abs}`); return [a.sura, a.aya] as [number, number]; };
  const group = (v: number | number[]) => (Array.isArray(v) ? v : [v]).map(ref);
  type Ref = [number, number][];
  const bySura: Record<number, Record<number, Ref[]>> = {};
  let groups = 0;
  for (const list of Object.values(raw)) for (const e of list) {
    const members: Ref[] = [group(e.src.ayah), ...e.muts.map((m) => group(m.ayah))]; groups++;
    members.forEach((mem, i) => {
      const others = members.filter((_, j) => j !== i);
      for (const [su, ay] of mem) { ((bySura[su] ??= {})[ay] ??= []).push(...others); }
    });
  }
  mkdirSync(`${out}/mutashabihat`, { recursive: true });
  for (let i = 1; i <= 114; i++) writeFileSync(`${out}/mutashabihat/${i}.json`, JSON.stringify(bySura[i] ?? {}));
  console.log(`Mutashabihat generated: ${groups} groups`);
}

// ---- Forty Hadith of an-Nawawi (verbatim) ----
{
  const dir = resolve(here, '../../../database/sources/hadith-nawawi');
  if (sha256File(`${dir}/ara-nawawi.json`) !== readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split(/\s+/)[0]) throw new Error('Checksum mismatch for ara-nawawi.json — refusing to build');
  const raw = JSON.parse(readFileSync(`${dir}/ara-nawawi.json`, 'utf8')) as { hadiths: { hadithnumber: number; text: string }[] };
  if (raw.hadiths.length !== 42) throw new Error('Nawawi hadith count check failed');
  mkdirSync(`${out}/hadith`, { recursive: true });
  writeFileSync(`${out}/hadith/nawawi.json`, JSON.stringify(raw.hadiths.map((h) => ({ n: h.hadithnumber, t: h.text }))));
  console.log('Nawawi 40 generated: 42 hadith');
}

// ---- Hadith books (fawazahmed0, Unlicense): verbatim matn+isnad text only. No grades/notes are written out. ----
{
  const dir = resolve(here, '../../../database/sources/hadith-fawazahmed0');
  const docs = JSON.parse(readFileSync(`${dir}/editions.json`, 'utf8')).books as Record<string, Record<string, string | null>>;
  const sums = readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split('\n').map((l) => l.split(/\s+/) as [string, string]);
  mkdirSync(`${out}/hadith`, { recursive: true });
  const books: unknown[] = []; let total = 0;
  for (const [sum, file] of sums) {
    const key = file.replace(/^ara-|\.json$/g, '');
    const path = `${dir}/files/${file}`;
    if (!existsSync(path)) throw new Error(`Missing ${file} — run infrastructure/fetch-hadith.sh`);
    if (sha256File(path) !== sum) throw new Error(`Checksum mismatch for ${file} — refusing to build`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { metadata: { name: string; sections: Record<string, string>; section_details: Record<string, { hadithnumber_first: number; hadithnumber_last: number }> }; hadiths: { hadithnumber: number; arabicnumber: number; text: string }[] };
    const secs = Object.entries(raw.metadata.section_details).map(([k, v]) => ({ s: Number(k), en: raw.metadata.sections[k] ?? '', first: v.hadithnumber_first, last: v.hadithnumber_last })).filter((x) => x.s > 0 && x.en).sort((a, b) => a.s - b.s);
    const bySec = new Map<number, { n: number; an: number; t: string }[]>();
    let empty = 0;
    for (const h of raw.hadiths) {
      if (!h.text.trim()) { empty++; continue; }
      const sec = secs.find((x) => h.hadithnumber >= x.first && h.hadithnumber <= x.last)?.s ?? 0;
      if (!bySec.has(sec)) bySec.set(sec, []);
      bySec.get(sec)!.push({ n: h.hadithnumber, an: h.arabicnumber, t: h.text });
    }
    mkdirSync(`${out}/hadith/${key}`, { recursive: true });
    const sections = [...bySec.keys()].sort((a, b) => a - b).map((s) => {
      writeFileSync(`${out}/hadith/${key}/${s}.json`, JSON.stringify(bySec.get(s)));
      const meta = secs.find((x) => x.s === s);
      return { s, en: meta?.en ?? 'Unassigned', count: bySec.get(s)!.length };
    });
    const count = sections.reduce((t, x) => t + x.count, 0); total += count;
    books.push({ key, en: raw.metadata.name, count, empty, sections, doc: docs[key] });
  }
  writeFileSync(`${out}/hadith/books.json`, JSON.stringify(books));
  console.log(`Hadith books generated: ${books.length} books, ${total} hadith with text`);
}

// ---- Names of Allah: names + Quran refs verified against Tanzil (explanations are not used) ----
{
  const dir = resolve(here, '../../../database/sources/names-of-allah');
  if (sha256File(`${dir}/asma_allah_alhusna_saeed_alqahtani.json`) !== readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split(/\s+/)[0]) throw new Error('Checksum mismatch for names of Allah — refusing to build');
  const raw = JSON.parse(readFileSync(`${dir}/asma_allah_alhusna_saeed_alqahtani.json`, 'utf8')) as { id: number; name_arabic: string; quran_evidence: { text: string; source: string }[]; book_reference?: { page: number; url: string } }[];
  const digits = (x: string) => Number(x.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))));
  const key = (x: string) => normDhikr(x).replace(/ال/g, '');
  const sura = new Map(meta.map((m) => [key(m.name), m.index]));
  if (sha256File(`${src}/simple-clean.xml`) !== sums['simple-clean.xml']) throw new Error('Checksum mismatch for simple-clean.xml — refusing to build');
  const simple = parseTanzilText(readFileSync(`${src}/simple-clean.xml`, 'utf8')); // matching only; display stays Uthmani
  let kept = 0, dropped = 0;
  const names = raw.map((n) => {
    const refs: [number, number][] = [];
    for (const q of n.quran_evidence ?? []) {
      const m = (q.source ?? '').match(/سورة\s+(.+?)[،,]?\s*(?:ال)?[آا]ي(?:ة|تان|ات)\s*:?\s*([٠-٩0-9]+)/);
      const su = m ? sura.get(key(m[1])) : undefined; const ay = m ? digits(m[2]) : 0;
      const row = su ? simple.find((a) => a.sura === su && a.aya === ay) : undefined;
      const snippet = normDhikr(q.text ?? '').replace(/ /g, ''); const verse = row ? normDhikr(row.text).replace(/ /g, '') : '';
      if (row && snippet.length > 3 && verse.includes(snippet.slice(0, Math.min(25, snippet.length)))) { if (!refs.some(([a, b]) => a === su && b === ay)) refs.push([su!, ay]); kept++; } else dropped++;
    }
    return { id: n.id, name: n.name_arabic, refs, page: n.book_reference?.page ?? null, url: n.book_reference?.url ?? null };
  });
  if (names.length !== 99) throw new Error('Names of Allah: expected 99');
  writeFileSync(`${out}/names-of-allah.json`, JSON.stringify(names));
  console.log(`Names of Allah generated: 99 names, ${kept} verified Quran refs, ${dropped} unverified refs dropped`);
}
