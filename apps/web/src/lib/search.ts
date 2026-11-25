import 'server-only';
import { SURAHS, loadSurah } from './quran';
import { ADHKAR, loadAdhkar } from './adhkar';
import names from '@/generated/names-of-allah.json';
/** One search over the site's own texts: Quran ayat, Hisn al-Muslim adhkar, surah names, the Names. Literal word search, no AI. */
export const fold = (s: string) => s.replace(/ٰ/g, 'ا').replace(/[ؐ-ًؚ-ٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^ء-ي0-9a-zA-Z ]/g, ' ').replace(/\s+/g, ' ').trim();
// Uthmani spelling omits some alefs; a second key without alef/waw/ya lets «الصلاة» find «ٱلصَّلَوٰةَ».
const bare = (s: string) => s.replace(/[اوي]/g, '');
type Ayah = { s: number; a: number; t: string; k: string; b: string }; type Dh = { c: number; n: number; t: string; k: string; title: string };
let quran: Promise<Ayah[]> | null = null; let adhkar: Promise<Dh[]> | null = null;
const buildQuran = async () => { const out: Ayah[] = []; for (const s of SURAHS) for (const a of (await loadSurah(s.index)).ayat) { const k = fold(a.t); out.push({ s: s.index, a: a.n, t: a.t, k: ` ${k} `, b: ` ${bare(k)} ` }); } return out; };
const buildAdhkar = async () => { const out: Dh[] = []; for (const c of ADHKAR) for (const d of (await loadAdhkar(c.id)).items) out.push({ c: c.id, n: d.n, t: d.t, k: fold(d.t), title: c.title }); return out; };

export async function searchAll(raw: string) {
  const q = fold(raw).slice(0, 80); const terms = q.split(' ').filter((t) => t.length >= 2).slice(0, 6);
  if (!terms.length || q.length < 3) return null;
  const Q = await (quran ??= buildQuran()); const A = await (adhkar ??= buildAdhkar());
  const exact = Q.filter((x) => terms.every((t) => x.k.includes(t)));
  const seen = new Set(exact.map((x) => `${x.s}:${x.a}`)); const bt = terms.map(bare).filter((t) => t.length >= 3);
  const loose = bt.length === terms.length ? Q.filter((x) => !seen.has(`${x.s}:${x.a}`) && bt.every((t) => x.b.includes(t))) : [];
  const ayat = [...exact, ...loose];
  return {
    q, ayatTotal: ayat.length, ayat: ayat.slice(0, 40).map(({ s, a, t }) => ({ s, a, t })),
    surahs: SURAHS.filter((s) => terms.every((t) => fold(s.name).includes(t))).map((s) => ({ index: s.index, name: s.name })),
    adhkar: A.filter((x) => terms.every((t) => x.k.includes(t) || fold(x.title).includes(t))).slice(0, 20).map(({ c, n, t, title }) => ({ c, n, t, title })),
    names: (names as { id: number; name: string }[]).filter((n) => terms.some((t) => fold(n.name).includes(t))).slice(0, 8).map((n) => n.name),
  };
}
