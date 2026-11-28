import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SURAHS, arDigits } from '@/lib/quran';
let SAMIN: Record<string, string[]> | null = null;
const samin = (r: string) => { SAMIN ??= JSON.parse(readFileSync(join(process.cwd(), 'src/generated/gharib-root/samin.json'), 'utf8')); const k = r.replace(/\s+/g, '').replace(/[ءأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  // Weak roots: the corpus and al-Samin may spell the weak letter differently (غشو / غشي).
  const alt = [k, k.replace(/و$/, 'ي'), k.replace(/ي$/, 'و'), k.replace(/^(.)و/, '$1ي'), k.replace(/^(.)ي/, '$1و')];
  for (const x of alt) if (SAMIN![x]) return SAMIN![x]; return []; };
export const metadata: Metadata = { title: 'غريب القرآن', description: 'معاني الكلمات الغريبة في القرآن من «غريب القرآن» لابن قتيبة و«نزهة القلوب» للسجستاني، بالبحث بالكلمة والجذر والسورة والآية، مع المقارنة بين المؤلفين.' };
export const dynamic = 'force-dynamic';
type E = { q: string; t: string; b?: 's'; r?: string[] };
const BOOK = { q: 'ابن قتيبة', s: 'السجستاني' } as const;
const norm = (t: string) => t.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
async function search(o: { q: string; root: string; s: number; a: number; b: string }) {
  const nq = norm(o.q); const nr = o.root.replace(/\s+/g, ''); const hits: { s: number; a: string; e: E }[] = [];
  for (const su of SURAHS) {
    if (o.s && su.index !== o.s) continue;
    const g = (await import(`@/generated/gharib/${su.index}.json`).catch(() => ({ default: {} }))).default as Record<string, E[]>;
    for (const [a, es] of Object.entries(g)) { if (o.a && Number(a) !== o.a) continue;
      for (const e of es) { if (o.b && (e.b ?? 'q') !== o.b) continue; if (nr && !(e.r ?? []).some((r) => norm(r) === norm(nr))) continue; if (nq && !(norm(e.q).includes(nq) || norm(e.t).includes(nq))) continue; hits.push({ s: su.index, a, e }); } }
    if (hits.length > 200) break;
  }
  return hits;
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams; const q = String(p.q ?? '').trim().slice(0, 60); const root = String(p.root ?? '').trim().slice(0, 8);
  const s = Math.max(0, Math.min(114, Number(p.s) || 0)); const a = Math.max(0, Number(p.a) || 0); const b = p.b === 'q' || p.b === 's' ? p.b : '';
  const active = q.length > 1 || root.length >= 2 || s > 0; const hits = active ? await search({ q, root, s, a, b }) : [];
  const groups = new Map<string, { s: number; a: string; es: E[] }>(); for (const h of hits) { const k = `${h.s}:${h.a}`; const g = groups.get(k) ?? { s: h.s, a: h.a, es: [] }; g.es.push(h.e); groups.set(k, g); }
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">القرآن</p><h1>غريب القرآن</h1>
        <p>من «غريب القرآن» لابن قتيبة الدينوري (ت 276هـ، تحقيق أحمد صقر) و«نزهة القلوب» لأبي بكر السجستاني (ت 330هـ، تحقيق محمد أديب عبد الواحد جمران)، بنصّيهما كما في نسخ OpenITI. في المصحف: الكلمات المسطّرة تفتح معناها عند المؤلفَين معًا للمقارنة.</p></header>
      <form className="row" role="search" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input type="search" name="q" defaultValue={q} placeholder="كلمة: غشاوة، الصمد…" aria-label="بحث بالكلمة" style={{ flex: '1 1 180px' }} />
        <input name="root" defaultValue={root} placeholder="الجذر: غشو" aria-label="بحث بالجذر" style={{ width: 110 }} />
        <select name="s" defaultValue={s || ''} aria-label="السورة"><option value="">كل السور</option>{SURAHS.map((x) => <option key={x.index} value={x.index}>{x.index}. {x.name}</option>)}</select>
        <input name="a" type="number" min={1} defaultValue={a || ''} placeholder="الآية" aria-label="رقم الآية" style={{ width: 80 }} />
        <select name="b" defaultValue={b} aria-label="المؤلف"><option value="">المؤلفان</option><option value="q">ابن قتيبة</option><option value="s">السجستاني</option></select>
        <button className="btn">بحث</button></form>
      {active && <p className="note">{hits.length ? `${arDigits(hits.length)} شرحًا في ${arDigits(groups.size)} موضعًا` : 'لا نتائج'}</p>}
      {root.length >= 2 && (() => { const sm = samin(root); return sm.length ? <section className="card" style={{ marginBottom: 12 }}><h2 style={{ marginTop: 0 }}>الجذر «{root}» في «عمدة الحفاظ» للسمين الحلبي (ت 756هـ)</h2>{sm.map((t, k) => <details key={k} open={k === 0}><summary>المادة {arDigits(k + 1)}</summary><p style={{ whiteSpace: 'pre-line', lineHeight: 2 }}>{t}</p></details>)}</section> : <p className="note">لا مادة لهذا الجذر في «عمدة الحفاظ».</p>; })()}
      {[...groups.values()].map((g) => <section key={`${g.s}:${g.a}`} className="card" style={{ marginBottom: 8 }}><p><Link href={`/gharib/${g.s}#a${g.a}`}><strong>{SURAHS[g.s - 1].name}: {arDigits(Number(g.a))}</strong></Link> · <Link href={`/quran/${g.s}#a${g.a}`}>في المصحف</Link></p>
        {g.es.map((e, k) => <div key={k}><p style={{ whiteSpace: 'pre-line', marginTop: 2 }}>{e.t.length > 500 ? `${e.t.slice(0, 500)}…` : e.t}</p></div>)}</section>)}
      <ul className="surah-list">{SURAHS.map((x) => <li key={x.index}><Link href={`/gharib/${x.index}`}><span className="num">{arDigits(x.index)}</span><span className="nm">{x.name}</span></Link></li>)}</ul>
    </article>
  );
}
