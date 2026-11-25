/**
 * Generates read-only JSON for the reader from the verbatim Tanzil XML.
 * Text is copied character-for-character; this script only changes the container format.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normDhikr } from '../src/lib/dhikr-norm';
import { parseOpenITI } from '../src/lib/openiti';
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
  // OpenITI (CC BY-NC-SA 4.0): Musnad Ahmad, Sunan al-Darimi — edition read from each file's own #META# header.
  const odir = resolve(here, '../../../database/sources/hadith-openiti');
  const AR: Record<string, { ar: string; author: string }> = { ahmad: { ar: 'مسند الإمام أحمد', author: 'أحمد بن حنبل (ت 241هـ)' }, darimi: { ar: 'سنن الدارمي', author: 'عبد الله بن عبد الرحمن الدارمي (ت 255هـ)' } };
  for (const line of readFileSync(`${odir}/FILES`, 'utf8').trim().split('\n')) {
    const [sum, key, path] = line.split(/\s+/);
    const f = `${odir}/files/${key}.txt`;
    if (!existsSync(f)) throw new Error(`Missing ${key} — run infrastructure/fetch-hadith.sh`);
    if (sha256File(f) !== sum) throw new Error(`Checksum mismatch for OpenITI ${key} — refusing to build`);
    const p = parseOpenITI(readFileSync(f, 'utf8'), key as 'ahmad' | 'darimi');
    const m = p.meta;
    const edition = [m.EdEDITOR && `تحقيق ${m.EdEDITOR}`, m.EdPUBLISHER, m.EdPLACE, m.EdNUMBER && `الطبعة ${m.EdNUMBER}`, m.EdYEAR && `${m.EdYEAR}هـ`].filter(Boolean).join('، ');
    mkdirSync(`${out}/hadith/${key}`, { recursive: true });
    const sections: { s: number; en: string; count: number; from: number; to: number }[] = [];
    let chunk: unknown[] = []; let pending: unknown[] = []; let n = 0; let first = 0; let last = 0;
    const flushChunk = () => {
      if (!n) return; const s = sections.length + 1;
      writeFileSync(`${out}/hadith/${key}/${s}.json`, JSON.stringify(chunk));
      sections.push({ s, en: '', count: n, from: first, to: last }); chunk = []; n = 0;
    };
    for (const it of p.items) {
      if (!('n' in it)) { pending.push(it); continue; }
      if (n === 0) first = it.n;
      chunk.push(...pending, { n: it.n, an: it.n, t: it.t, ...(it.l ? { l: it.l } : {}), ...(it.m ? { m: it.m } : {}) }); pending = []; n++; last = it.n;
      if (n >= 200) flushChunk();
    }
    flushChunk();
    const count = sections.reduce((t, x) => t + x.count, 0); total += count;
    books.push({ key, en: m.BookTITLE ?? key, count, empty: p.empty.length, sections, doc: {
      ...AR[key], source: 'openiti', source_uri: path.split('/').pop(), license: 'CC BY-NC-SA 4.0', edition,
      numbering: 'ترقيم الطبعة المذكورة', collated: null, agreement: null, report: null,
      ...(key === 'ahmad' ? { marks: '• زيادات عبد الله ابن الإمام أحمد، ° وجاداته، * روايته عن أبيه أو شيخ أبيه (رموز طبعة الرسالة، كما شرحها توثيق open-hadith-data)' } : {}),
    } });
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

// ---- Quranic Arabic Corpus v0.4 (GPL, verbatim file): per-word POS, root, features aligned to our Tanzil words ----
{
  const dir = resolve(here, '../../../database/sources/quranic-corpus');
  const file = `${dir}/quranic-corpus-morphology-0.4.txt`;
  if (sha256File(file) !== readFileSync(`${dir}/SHA256SUMS`, 'utf8').trim().split(/\s+/)[0]) throw new Error('Checksum mismatch for Quranic Arabic Corpus — refusing to build');
  type Seg = { tag: string; f: string[] };
  const byAyah = new Map<string, Seg[][]>();
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith('(')) continue;
    const [loc, , tag, feats] = line.split('\t');
    const [s1, a1, w1] = loc.slice(1, -1).split(':').map(Number);
    const k = `${s1}:${a1}`; if (!byAyah.has(k)) byAyah.set(k, []);
    const words = byAyah.get(k)!; (words[w1 - 1] ??= []).push({ tag, f: feats.split('|') });
  }
  mkdirSync(`${out}/morph`, { recursive: true });
  let aligned = 0; const skipped: string[] = [];
  for (const m of meta) {
    const res: Record<number, unknown> = {};
    for (const a of ayat.filter((x) => x.sura === m.index)) {
      const words = byAyah.get(`${m.index}:${a.aya}`) ?? [];
      if (words.length !== a.text.split(' ').length) { res[a.aya] = null; skipped.push(`${m.index}:${a.aya}`); continue; }
      aligned++;
      res[a.aya] = words.map((segs) => {
        const stem = segs.find((x) => x.f[0] === 'STEM') ?? segs[0];
        const val = (key: string) => stem.f.find((x) => x.startsWith(`${key}:`))?.slice(key.length + 1) ?? '';
        const pre = segs.filter((x) => x.f[0] === 'PREFIX').map((x) => x.tag);
        const suf = segs.filter((x) => x.f[0] === 'SUFFIX').map((x) => [x.tag, x.f.find((y) => y.startsWith('PRON:'))?.slice(5) ?? ''].filter(Boolean).join(':'));
        return { p: stem.tag, r: val('ROOT'), f: stem.f.filter((x) => !/^(STEM|POS|LEM|ROOT):?/.test(x)), pre, suf };
      });
    }
    writeFileSync(`${out}/morph/${m.index}.json`, JSON.stringify(res));
  }
  console.log(`Quranic Arabic Corpus: ${aligned} ayat aligned, not aligned: ${skipped.join(' ')}`);
}
