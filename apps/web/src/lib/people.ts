import catalog from '@/generated/tvquran/catalog.json';
import iha from '@/generated/duas/ih-audio.json';
import { RECITERS } from './reciters';
import { EA } from './everyayah';

/**
 * One record per reciter/sheikh across every audio source we use, so a person is never duplicated:
 * Quran recitations (Islamic Network), TVQuran selections (official embed), IslamHouse audio (direct, per its published policy).
 * Matching is by name only (first + last name after normalising); ambiguous names are not merged.
 */
export type TvItem = { id: number; title: string; scholar_id: number | null; cat: number; plays: number };
export type TvCat = { id: number; title: string };
export const TVC = catalog as { categories: TvCat[]; scholars: { id: number; ar: string; en: string }[]; items: TvItem[]; embed: string; fetched: string };
export const TV_ITEMS = TVC.items;
export const tvCat = (id: number) => TVC.categories.find((c) => c.id === id)?.title ?? '';
/** Categories that hold duas, adhkar, ruqyah and adhan/takbeer (the rest are Quran recitation clips). */
export const TV_DUA_CATS = [4, 6, 8, 9];

type Ih = { id: number; title: string; by: { id: number; title: string; kind: string }[]; attachments: { type: string; size: string; url: string; desc: string | null }[]; url: string };
const IH = iha as Ih[];

export function norm(s: string) {
  return s.replace(/\([^)]*\)/g, ' ').replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/(^|\s)(الشيخ|القارئ|الامام|المقرئ|د\.)\s+/g, ' ').replace(/عبد\s+/g, 'عبد').replace(/\s+بن\s+/g, ' ').replace(/\s+/g, ' ').trim();
}
const key = (s: string) => { const t = norm(s).split(' ').filter(Boolean); return t.length < 2 ? t.join(' ') : `${t[0]} ${t[t.length - 1]}`; };

export interface Person { slug: string; ar: string; en: string; quran: number[]; ea: string[]; tv: number[]; ih: number[]; tvItems: number }
const slugify = (en: string, fb: string) => (en.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fb);

function build(): Person[] {
  const m = new Map<string, Person>();
  const names = new Map<Person, { tv?: string; q?: string; ea?: string; fb: string }>();
  const get = (ar: string, en: string, fb: string) => {
    const k = key(ar); let p = m.get(k);
    if (!p) { p = { slug: '', ar: ar.replace(/\s*\([^)]*\)/g, '').replace(/^(الشيخ|القارئ|المقرئ)\s+/, '').trim(), en, quran: [], ea: [], tv: [], ih: [], tvItems: 0 }; m.set(k, p); names.set(p, { fb }); }
    if (!p.en && en) p.en = en;
    return p;
  };
  RECITERS.forEach((r, i) => { const p = get(r.name, r.en.replace(/\s*\([^)]*\)/g, ''), `q${i}`); p.quran.push(i); names.get(p)!.q ??= r.en.replace(/\s*\([^)]*\)/g, ''); });
  EA.forEach((e) => { const p = get(e.name, e.en, `ea-${e.f}`); p.ea.push(e.f); names.get(p)!.ea ??= e.en; });
  for (const s of TVC.scholars) { const p = get(s.ar, s.en, `t${s.id}`); names.get(p)!.tv ??= s.en; p.tv.push(s.id); p.tvItems += TV_ITEMS.filter((x) => x.scholar_id === s.id).length; }
  for (const it of IH) for (const b of it.by) if (b.kind === 'author') { const p = get(b.title, '', `i${b.id}`); if (!p.ih.includes(it.id)) p.ih.push(it.id); }
  const seen = new Set<string>();
  // Slug from the most stable name: TVQuran's English name, then Islamic Network's, then EveryAyah's, else an id.
  for (const p of m.values()) { const nm = names.get(p)!; p.slug = slugify(nm.tv || nm.q || nm.ea || '', nm.fb); if (nm.tv) p.en = nm.tv; }
  for (const p of m.values()) { let s = p.slug; let n = 2; while (seen.has(s)) s = `${p.slug}-${n++}`; p.slug = s; seen.add(s); }
  return [...m.values()].sort((a, b) => b.tvItems + b.ih.length * 5 + b.quran.length * 3 - (a.tvItems + a.ih.length * 5 + a.quran.length * 3));
}
export const PEOPLE = build();
export const person = (slug: string) => PEOPLE.find((p) => p.slug === slug);
export const personOfTv = (sid: number | null) => (sid == null ? undefined : PEOPLE.find((p) => p.tv.includes(sid)));
export const ihItem = (id: number) => IH.find((x) => x.id === id);
/** Priority voices named by the project owner, shown first. */
export const PRIORITY = ['العفاسي', 'السديس', 'المعيقلي', 'الدوسري', 'ابكر', 'القطامي', 'الجليل', 'جبريل', 'النفيس', 'اللحيدان', 'مسعد', 'صبحي', 'عبدالباسط', 'المنشاوي', 'الحصري', 'الغامدي'];
export const isPriority = (p: Person) => PRIORITY.some((w) => norm(p.ar).includes(w));
