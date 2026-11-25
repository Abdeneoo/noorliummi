/**
 * Parser for OpenITI mARkdown hadith texts (Musnad Ahmad – Shamela0025794, Sunan al-Darimi – JK000842).
 * Only technical markup is removed: line markers (#, ~~), page markers (PageV..P..), manuscript markers (ms..),
 * and footnote reference numbers "(1)" whose footnotes OpenITI already removed. No Arabic letter is dropped (tested).
 */
export type Item = { h: string } | { u: string } | { n: number; l?: string; m?: string; t: string };
export interface Parsed { items: Item[]; meta: Record<string, string>; empty: number[]; /** marker-only lines with no Arabic letters (e.g. "# (1)") */ skipped: string[]; body: string }

const PAGE = /\s*PageV\d+P\d+\s*/g;
const MS = /\s*\bms\d+[A-Za-z]?\b\s*/g;
const FOOTREF = /\s*\(\d+\)\s*/g;
const TAG = /<\/?[a-zA-Z][^>]*>/g;
export const clean = (s: string, footnoteRefs: boolean) => {
  let x = s.replace(PAGE, ' ').replace(MS, ' ').replace(TAG, ' ');
  if (footnoteRefs) x = x.replace(FOOTREF, ' ');
  return x.replace(/\s+([.،,:])/g, '$1').replace(/\s+/g, ' ').trim();
};

export function parseOpenITI(text: string, kind: 'ahmad' | 'darimi'): Parsed {
  const [head, body = ''] = text.split('#META#Header#End#');
  const meta: Record<string, string> = {};
  for (const l of head.split(/\r?\n/)) { const m = l.match(/^#META# \d+\.(\w+)\s*::\s*(.*)$/); if (m && m[2] !== 'NODATA') meta[m[1]] = m[2].trim(); }

  // Re-join continuation lines (~~) onto their paragraph.
  const paras: string[] = [];
  for (const raw of body.split(/\r?\n/)) {
    if (raw.startsWith('~~')) { if (paras.length) paras[paras.length - 1] += ` ${raw.slice(2)}`; continue; }
    if (raw.trim()) paras.push(raw);
  }

  const items: Item[] = []; const empty: number[] = []; const skipped: string[] = [];
  const startRe = kind === 'ahmad' ? /^# (?:\| )?(?:([•°*]+) )?(\d+)(\/\d+)? ?(?:ms\d+[A-Za-z]? )?- ?(.*)$/ : /^# (\d+) (.*)$/;
  let cur: { n: number; l?: string; m?: string; parts: string[] } | null = null;
  const flush = () => {
    if (!cur) return;
    const t = clean(cur.parts.join(' '), kind === 'ahmad');
    if (/[ء-ي]/.test(t)) items.push({ n: cur.n, ...(cur.l ? { l: cur.l } : {}), ...(cur.m ? { m: cur.m } : {}), t }); else empty.push(cur.n);
    cur = null;
  };
  for (const p of paras) {
    const header = kind === 'ahmad' ? p.match(/^### \|+ (.*)$/) : p.match(/^# \| (.*)$/);
    if (header) { flush(); const h = clean(header[1], kind === 'ahmad'); if (h) items.push({ h }); continue; }
    const st = p.match(startRe);
    if (st) {
      flush();
      cur = kind === 'ahmad' ? { n: Number(st[2]), l: st[3] ? `${st[2]}${st[3]}` : undefined, m: st[1] || undefined, parts: [st[4]] } : { n: Number(st[1]), parts: [st[2]] };
      continue;
    }
    if (cur) { cur.parts.push(p.replace(/^#+ ?/, '')); continue; }
    // Unnumbered text outside a hadith (basmala, the book's chains of transmission, notes between sections) is shown as is.
    const u = clean(p.replace(/^#+ ?(\| )?/, ''), kind === 'ahmad');
    if (!/[\u0621-\u064A]/.test(u)) { skipped.push(p); continue; } // marker-only lines such as "# (1)" or "# PageV03P048"
    const prev = items[items.length - 1];
    if (prev && 'h' in prev && TAG.test(p)) { TAG.lastIndex = 0; prev.h = `${prev.h} ${u}`.trim(); continue; } // header continued on the next line
    TAG.lastIndex = 0;
    items.push({ u });
  }
  flush();
  return { items, meta, empty, skipped, body };
}

/** Arabic letters only, for the "no letter dropped" check. */
export const arabicLetters = (s: string) => s.replace(/[^ء-ي]/g, '');
