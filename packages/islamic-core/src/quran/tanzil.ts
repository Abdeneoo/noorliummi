/**
 * Read-only loader for the verbatim Tanzil Quran XML files (CC BY 3.0, verbatim only).
 * The original text is NEVER modified. Search-normalised text is derived separately
 * (see normalizeForSearch) and must never be displayed as Quran text.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export interface Ayah { sura: number; aya: number; text: string; bismillah?: string }
export interface SuraMeta { index: number; ayas: number; name: string; tname: string; ename: string; type: 'Meccan' | 'Medinan'; order: number }

const attr = (tag: string, name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function parseTanzilText(xml: string): Ayah[] {
  const out: Ayah[] = [];
  const suraRe = /<sura\b([^>]*)>([\s\S]*?)<\/sura>/g;
  let s: RegExpExecArray | null;
  while ((s = suraRe.exec(xml))) {
    const sura = Number(attr(s[1], 'index'));
    const ayaRe = /<aya\b([^>]*?)\/>/g;
    let a: RegExpExecArray | null;
    while ((a = ayaRe.exec(s[2]))) {
      const text = attr(a[1], 'text');
      if (text === undefined) throw new Error(`Missing text at ${sura}`);
      const bismillah = attr(a[1], 'bismillah');
      out.push({ sura, aya: Number(attr(a[1], 'index')), text, ...(bismillah ? { bismillah } : {}) });
    }
  }
  return out;
}

export function parseTanzilMetadata(xml: string): SuraMeta[] {
  const block = /<suras\b[^>]*>([\s\S]*?)<\/suras>/.exec(xml)?.[1] ?? '';
  return [...block.matchAll(/<sura\b([^>]*)\/>/g)].map(([, t]) => ({
    index: Number(attr(t, 'index')), ayas: Number(attr(t, 'ayas')), name: attr(t, 'name')!, tname: attr(t, 'tname')!,
    ename: attr(t, 'ename')!, type: attr(t, 'type') as SuraMeta['type'], order: Number(attr(t, 'order')),
  }));
}

/** Copyright block that MUST be kept with any copy (Tanzil terms). */
export function extractCopyrightBlock(xml: string): string {
  return /<!--([\s\S]*?)-->/.exec(xml)?.[1].trim() ?? '';
}

/**
 * Search-only normalisation: strips tashkeel and Quranic annotation marks, unifies alef/ya/ta-marbuta forms.
 * Output is for indexing ONLY — never display it as Quran text.
 */
export function normalizeForSearch(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}
