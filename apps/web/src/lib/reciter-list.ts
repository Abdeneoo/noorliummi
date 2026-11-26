import { RECITERS, ayahUrl, surahUrl, type Rec } from './reciters';
/** One reciter with all of their recordings («الصور»), merged from Islamic Network (built in) and MP3Quran (fetched). */
export interface Version { id: string; label: string; en: string; kind: 'surah' | 'ayah'; hafs: boolean; rec?: Rec; server?: string; list?: string }
export interface Person { key: string; name: string; en: string; versions: Version[] }
export interface ExtReciter { id: number; name: string; en: string; versions: { id: string; name: string; en: string; hafs: boolean; server: string; list?: string }[] }
export const personKey = (n: string) => n.replace(/\(.*?\)/g, '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, '').replace(/^ال/, '');
const paren = (n: string) => n.match(/\((.*?)\)/)?.[1] ?? '';
export function buildPersons(ext: ExtReciter[]): Person[] {
  const map = new Map<string, Person>();
  for (const e of ext) map.set(personKey(e.name), { key: personKey(e.name), name: e.name, en: e.en, versions: e.versions.map((v) => ({ id: v.id, label: v.name, en: v.en, kind: 'surah', hafs: v.hafs, server: v.server, list: v.list })) });
  for (const r of RECITERS) {
    const base = r.name.replace(/\s*\(.*?\)\s*/g, '').trim(); const k = personKey(base); const p = map.get(k) ?? { key: k, name: base, en: r.en.replace(/\s*\(.*?\)\s*/g, '').trim(), versions: [] }; map.set(k, p);
    const what = paren(r.name).replace('آية بآية', '').trim() || 'مرتّل'; const whatEn = paren(r.en).replace('ayah by ayah', '').trim() || 'murattal';
    p.versions.unshift(r.mode === 'ayah' ? { id: r.id, label: `حفص عن عاصم - ${what} — مع إبراز الآية المتلوّة`, en: `Hafs - ${whatEn} — highlights the ayah`, kind: 'ayah', hafs: true, rec: r } : { id: r.id, label: `حفص عن عاصم - ${what} (Islamic Network)`, en: `Hafs - ${whatEn} (Islamic Network)`, kind: 'surah', hafs: true, rec: r });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
export const hasSurah = (v: Version, n: number) => !v.list || v.list.split(',').includes(String(n));
/** The single audio file for a surah (not for ayah-by-ayah versions). */
export const fileUrl = (v: Version, surah: number) => (v.server ? `${v.server}${String(surah).padStart(3, '0')}.mp3` : v.rec ? surahUrl(v.rec, surah) : '');
export { ayahUrl };
export const AUDIO_CACHE = 'noor-quran-audio';
