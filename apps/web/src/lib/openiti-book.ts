/**
 * Reader for whole books from OpenITI mARkdown (Riyad as-Salihin, al-Adhkar). Only technical markup is removed or
 * converted; no Arabic letter is dropped (tested). Page marks keep the printed edition's page numbers.
 */
export type Block = { p: string } | { h: string } | { n: string } | { pg: string } | { v: string };
export interface Section { title: string; group?: string; blocks: Block[] }
export interface Book { meta: Record<string, string>; sections: Section[]; body: string }
const clean = (s: string) => s.replace(/\bms\d+[A-Za-z]?\b/g, ' ').replace(/@QB@\s*/g, '﴿').replace(/\s*@QE@/g, '﴾').replace(/\s*%~%\s*/g, '   *   ').replace(/\s+([.،,:؛])/g, '$1').replace(/\s+/g, ' ').trim();

export type BookKind = 'riyad' | 'adhkar-nawawi' | 'qisas' | 'fusul' | 'bidaya' | 'lataif' | 'lubab' | 'wahidi';
/** Where the author's own text starts (anything before it is the modern editor's introduction, which is not imported). */
const START: Partial<Record<BookKind, string>> = { qisas: '### | باب ما ورد في خلق آدم' };
export function parseBook(text: string, kind: BookKind): Book {
  const [head, full = ''] = text.split('#META#Header#End#');
  const st = START[kind]; const at = st ? full.indexOf(st) : -1; if (st && at < 0) throw new Error(`${kind}: start of the author's text not found`);
  const body = at >= 0 ? full.slice(at) : full;
  const meta: Record<string, string> = {};
  for (const l of head.split(/\r?\n/)) { const m = l.match(/^#META# \d+\.(\w+)\s*::\s*(.*)$/); if (m && m[2].trim() && !/^(NODATA|NOTGIVEN|NOCODE)$/.test(m[2].trim())) meta[m[1]] = m[2].trim(); }
  // Join continuation lines; a page mark inside a paragraph stays in place as a token.
  const paras: string[] = [];
  for (const raw of body.split(/\r?\n/)) {
    if (raw.startsWith('~~')) { if (paras.length) paras[paras.length - 1] += ` ${raw.slice(2)}`; continue; }
    if (/^PageV\d+P\d+\s*$/.test(raw) && paras.length) { paras[paras.length - 1] += ` ${raw.trim()}`; continue; }
    if (raw.trim()) paras.push(raw);
  }
  const sections: Section[] = []; let cur: Section | null = null; let group = ''; let pagesInSection = 0;
  const open = (title: string) => { cur = { title, ...(group ? { group } : {}), blocks: [] }; sections.push(cur); pagesInSection = 0; };
  const pushText = (kindOf: 'p' | 'h' | 'v', s: string) => {
    // Split on page marks so each mark becomes its own block.
    const parts = s.split(/\s*PageV(\d+)P(\d+)\s*/);
    for (let i = 0; i < parts.length; i += 3) {
      const t = clean(parts[i]); if (t && /[ء-ي]/.test(t)) cur!.blocks.push(kindOf === 'p' ? { p: t } : kindOf === 'h' ? { h: t } : { v: t });
      if (parts[i + 2] !== undefined) { cur!.blocks.push({ pg: String(Number(parts[i + 2])) }); pagesInSection++; if (kind === 'adhkar-nawawi' && pagesInSection >= 10) open(''); }
    }
  };
  for (const p of paras) {
    let m: RegExpMatchArray | null;
    if (kind === 'riyad') {
      if ((m = p.match(/^### \| (.*)$/))) { group = clean(m[1].replace(/PageV\d+P\d+/g, '')); open(group); continue; }
      if ((m = p.match(/^### \|\| (.*)$/))) { if (group.startsWith('[')) group = ''; open(clean(m[1].replace(/PageV\d+P\d+/g, ''))); continue; }
      if ((m = p.match(/^### \|\|\| ?(.*)$/))) { if (!cur) open('—'); const num = m[1].match(/(\d+)\s*\/\s*(\d+)/); cur!.blocks.push({ n: num ? num[2] : clean(m[1]) }); const rest = m[1].replace(/^\s*\d+\s*\/\s*\d+\s*-?\s*/, ''); if (rest.trim()) pushText('p', rest); continue; }
    }
    if (kind === 'bidaya') {
      // «بداية المجتهد»: each «[كتاب …]» heading starts a group; every heading inside it opens a section.
      if ((m = p.match(/^### \| ?(.*)$/))) { const t = clean(m[1].replace(/PageV\d+P\d+/g, '')).replace(/^\[|\]$/g, '').trim(); if (/^كتاب /.test(t)) group = t; open(t || '—'); continue; }
    }
    if (kind === 'lataif') {
      // «لطائف المعارف»: «وظائف شهر …» / «وظيفة شهر …» start a month (group); each «مجلس»/«فصل» heading opens a section.
      if ((m = p.match(/^### \|{1,3} ?(.*)$/))) { const t = clean(m[1].replace(/PageV\d+P\d+/g, '')); if (/^(وظائف|وظيفة|فصل ويلتحق)/.test(t)) group = t; open(t || '—'); continue; }
    }
    if (kind === 'lubab' || kind === 'wahidi') { // one section per heading: introduction, then one per surah
      if ((m = p.match(/^### \|{1,3} ?(.*)$/))) { open(clean(m[1].replace(/PageV\d+P\d+/g, '')) || '—'); continue; }
    }
    if (kind === 'qisas' || kind === 'fusul') {
      if ((m = p.match(/^### \|{1,3} ?(.*)$/))) { open(clean(m[1].replace(/PageV\d+P\d+/g, '')) || '—'); continue; }
      // In «قصص الأنبياء» several stories begin inside a paragraph ("قصة نوح عليه السلام ..."): that paragraph opens a new section
      // titled by the book's own words, and stays as the section's first paragraph.
      if (kind === 'qisas' && (m = p.match(/^# (?:مدين )?(قصة (?:[إا]براهيم الخليل|قوم شعيب عليه السلام|الذبيح|ذي الكفل|قوم يس|عيسى بن مريم))/))) open(clean(m[1]));
      else if (kind === 'qisas' && (m = p.match(/^# (قصة [^:،.()"«]{2,60}?(?:عليه|عليهما|عليهم) السلام)/))) open(clean(m[1]));
    }
    if (!cur) open(kind === 'adhkar-nawawi' ? '' : '—');
    if (kind === 'adhkar-nawawi' && (m = p.match(/^# \| (.*)$/))) { pushText('h', m[1]); continue; }
    const t = p.replace(/^#+ ?/, '');
    pushText(t.includes('%~%') ? 'v' : 'p', t);
  }
  const out = sections.filter((s) => s.blocks.some((b) => 'p' in b || 'h' in b || 'v' in b || 'n' in b));
  if (kind === 'adhkar-nawawi') { // title each chunk by its printed pages
    let last = 1;
    for (const s of out) { const pgs = s.blocks.filter((b): b is { pg: string } => 'pg' in b).map((b) => Number(b.pg)); const from = last; const to = pgs.length ? Math.max(...pgs) : last; s.title = `${from}–${to}`; last = to + 1; }
  }
  return { meta, sections: out, body };
}
export const letters = (s: string) => s.replace(/[^ء-ي]/g, '');
