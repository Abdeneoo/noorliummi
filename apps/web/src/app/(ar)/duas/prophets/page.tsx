import type { Metadata } from 'next';
import Link from 'next/link';
import { PROPHETS, surahName } from '@/lib/duas';
import { loadSurah, arDigits } from '@/lib/quran';
import DuaNav from '@/components/DuaNav';
import { DuaAyahPlay, DuaReciterBar } from '@/components/DuaAyahPlayer';
export const metadata: Metadata = { title: 'أدعية الأنبياء في القرآن الكريم', description: 'أدعية الأنبياء عليهم السلام من القرآن الكريم، مع التفسير الميسر لكل آية، والاستماع بأصوات القراء.' };
const KIND = { said: 'قاله النبي', joint: 'دعا به أكثر من واحد', commanded: 'أُمر النبي ﷺ أن يقوله' } as const;
export default async function Page() {
  const items = await Promise.all(PROPHETS.map(async (p) => { const su = await loadSurah(p.s); return { ...p, ayat: Array.from({ length: p.to - p.from + 1 }, (_, k) => ({ s: p.s, a: p.from + k, t: su.ayat[p.from + k - 1].t, title: `${surahName(p.s)}: ${p.from + k}` })) }; }));
  const names = [...new Set(items.map((x) => x.prophet))];
  return (
    <article style={{ maxWidth: 880, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>أدعية الأنبياء في القرآن الكريم</h1><p>{arDigits(items.length)} موضعًا لـ{arDigits(names.length)} من الأنبياء عليهم السلام. صاحب كل دعاء ثابت من «التفسير الميسر» للآية نفسها أو لما قبلها في السياق، ونصه تحت الآية.</p></header>
      <DuaNav />
      <p className="review-banner">نص الآيات من المصحف (Tanzil)، والتفسير من «التفسير الميسر» (مجمع الملك فهد لطباعة المصحف الشريف) عبر موسوعة القرآن الكريم QuranEnc.com، كما هو دون تعديل.</p>
      <DuaReciterBar all={items.flatMap((x) => x.ayat)} />
      <ul className="chips even" style={{ margin: '12px 0' }}>{names.map((n, i) => <li key={n}><a href={`#p${i}`}>{n}</a></li>)}</ul>
      {names.map((n, i) => (
        <section key={n} id={`p${i}`} className="section"><h2>{n}{n.includes('محمد') ? '' : ' عليه السلام'}</h2>
          <ul className="dhikr-list">{items.filter((x) => x.prophet === n).map((x) => (
            <li key={`${x.s}-${x.from}`} className="card dhikr">
              <p className="eyebrow">{KIND[x.kind]} · سورة {surahName(x.s)}، {x.from === x.to ? `الآية ${arDigits(x.from)}` : `الآيات ${arDigits(x.from)}–${arDigits(x.to)}`}</p>
              <p className="dhikr-text" lang="ar" style={{ fontFamily: 'var(--font-quran)' }}>{x.ayat.map((a) => `${a.t} ﴿${arDigits(a.a)}﴾`).join(' ')}</p>
              <details><summary>التفسير الميسر</summary>{x.context && <p className="note">من سياق الآية {arDigits(x.context.a)}: {x.context.t}</p>}{x.tafsir.map((t) => <p key={t.a} className="ar">﴿{arDigits(t.a)}﴾ {t.t}</p>)}</details>
              <div className="row dhikr-tools"><DuaAyahPlay list={x.ayat} /><Link className="btn ghost small" href={`/quran/${x.s}#a${x.from}`}>في المصحف</Link><Link className="btn ghost small" href={`/tafsir/${x.s}#a${x.from}`}>تفسير الجلالين</Link></div>
            </li>))}</ul>
        </section>))}
      <p className="note">وأدعية النبي ﷺ من السنة في <Link href="/duas/sunnah">أدعية السنة</Link>.</p>
    </article>
  );
}
