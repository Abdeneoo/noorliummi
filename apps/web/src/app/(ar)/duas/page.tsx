import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import { ADHKAR, loadAdhkar } from '@/lib/adhkar';
import { loadSurah, SURAHS, arDigits } from '@/lib/quran';
import ShareImageButton from '@/components/ShareImageButton';
import { HISN_GROUPS } from '@/lib/duas-groups';
import DuaNav from '@/components/DuaNav';

export const metadata: Metadata = { title: 'الأدعية', description: 'أدعية من القرآن الكريم ومن «حصن المسلم» بتخريجها: للمتوفى والوالدين والمريض والهم والكرب والاستخارة والسفر وغيرها.', openGraph: og('/duas', 'ar', 'الأدعية', 'أدعية من القرآن الكريم ومن «حصن المسلم» بتخريجها: للمتوفى والوالدين والمريض والهم والكرب والاستخارة والسفر وغيرها.') };
/**
 * A library of sourced duas grouped by need. Every text comes as-is from Hisn al-Muslim (with its takhrij) or is a
 * Quran ayah quoted by reference. Nothing is composed here.
 */
const QURAN: { title: string; refs: [number, number][] }[] = [
  { title: 'للوالدين من القرآن', refs: [[17, 24], [14, 41], [71, 28], [46, 15]] },
];
const GROUPS: { title: string; ids: number[] }[] = [
  { title: 'للمتوفى', ids: [56, 57, 59, 60, 61, 55] },
  { title: 'للمريض', ids: [50, 52] },
  { title: 'عند المصيبة والهم والكرب', ids: [54, 35, 36, 42] },
  { title: 'التعزية', ids: [58] },
];
export default async function Duas() {
  const quran = await Promise.all(QURAN.map(async (g) => ({ ...g, ayat: await Promise.all(g.refs.map(async ([s, a]) => ({ s, a, t: (await loadSurah(s)).ayat[a - 1].t }))) })));
  const groups = await Promise.all(GROUPS.map(async (g) => ({ ...g, cats: await Promise.all(g.ids.map(async (id) => ({ id, title: ADHKAR.find((c) => c.id === id)!.title, items: (await loadAdhkar(id)).items }))) })));
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">الأدعية</p><h1>الأدعية</h1>
        <p>أدعية من القرآن الكريم ومن «حصن المسلم» بتخريجها، مرتبة حسب الحاجة. أضف ما تريد إلى صفحة أثر، أو شاركه كصورة.</p></header>
      <DuaNav />
      <nav className="card" aria-label="أقسام هذه الصفحة"><ul className="chips even">{[...QURAN.map((g, i) => [`q${i}`, g.title]), ...GROUPS.map((g, i) => [`g${i}`, g.title])].map(([id, t]) => <li key={id}><a href={`#${id}`}>{t}</a></li>)}{HISN_GROUPS.map((g) => <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>)}</ul></nav>
      {quran.map((g, gi) => (
        <section key={g.title} id={`q${gi}`} className="section"><h2>{g.title}</h2>
          <ul className="dhikr-list">{g.ayat.map((x) => (
            <li key={`${x.s}:${x.a}`} className="card dhikr">
              <p className="dhikr-text" lang="ar" style={{ fontFamily: 'var(--font-quran)' }}>{x.t} ﴿{arDigits(x.a)}﴾</p>
              <p className="dhikr-ref">سورة {SURAHS[x.s - 1].name}، الآية {arDigits(x.a)}</p>
              <div className="row dhikr-tools"><Link className="btn ghost small" href={`/quran/${x.s}#a${x.a}`}>في المصحف</Link>
                <Link className="btn ghost small" href={`/athar?add=surah:${x.s}#new`}>أضف السورة إلى صفحة أثر</Link>
                <ShareImageButton story={{ text: `${x.t} ﴿${arDigits(x.a)}﴾`, caption: `سورة ${SURAHS[x.s - 1].name}، الآية ${arDigits(x.a)}`, quran: true, path: `/quran/${x.s}#a${x.a}` }} /></div>
            </li>))}</ul>
        </section>
      ))}
      {groups.map((g, gi) => (
        <section key={g.title} id={`g${gi}`} className="section"><h2>{g.title}</h2>
          {g.cats.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 12 }}>
              <h3 style={{ marginTop: 0 }} lang="ar">{c.title}</h3>
              {c.items.map((d) => <div key={d.n} style={{ borderTop: '1px solid var(--line)', padding: '10px 0' }}>
                <p className="dhikr-text" lang="ar">{d.t}</p>{d.r && <p className="dhikr-ref">{d.r}</p>}
                <ShareImageButton story={{ text: d.t, caption: d.r ? `${d.r} — حصن المسلم` : 'حصن المسلم', path: `/adhkar/${c.id}` }} /></div>)}
              <div className="row"><Link className="btn ghost small" href={`/adhkar/${c.id}`}>في الأذكار</Link><Link className="btn small" href={`/athar?add=dhikr:${c.id}#new`}>أضف إلى صفحة أثر</Link></div>
            </div>
          ))}
        </section>
      ))}
      <h2 className="section">كل أدعية «حصن المسلم» حسب الحاجة</h2>
      {HISN_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="section"><h3>{g.title}</h3>
          <ul className="athar-dir">{g.ids.map((id) => ADHKAR.find((c) => c.id === id)).filter(Boolean).map((c) => <li key={c!.id}><Link href={`/adhkar/${c!.id}`}><strong lang="ar">{c!.title}</strong><small>{arDigits(c!.count)} {c!.count === 1 ? 'دعاء' : 'من الأدعية'}</small></Link></li>)}</ul>
        </section>
      ))}
    </article>
  );
}
