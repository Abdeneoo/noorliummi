import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';
import { POS, featureLabels, rootArabic } from '@/lib/morph';

export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = SURAHS[Number((await params).n) - 1]; return { title: s ? `كلمات سورة ${s.name}` : 'كلمات القرآن' };
}
type W = { p: string; r: string; f: string[]; pre: string[]; suf: string[] };
const PNG_AR: Record<string, string> = { '1S': 'للمتكلم', '1P': 'للمتكلمين', '2MS': 'للمخاطب', '2FS': 'للمخاطبة', '2D': 'للمخاطبَين', '2MP': 'للمخاطبين', '2FP': 'للمخاطبات', '3MS': 'للغائب', '3FS': 'للغائبة', '3D': 'للغائبَين', '3MP': 'للغائبين', '3FP': 'للغائبات' };
const sufLabel = (x: string) => { const [t, png] = x.split(':'); return t === 'PRON' ? `ضمير متصل${png && PNG_AR[png] ? ` ${PNG_AR[png]}` : ''}` : POS[t] ?? t; };

export default async function Words({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n); if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const [{ meta, ayat }, morph] = await Promise.all([loadSurah(n), import(`@/generated/morph/${n}.json`).then((m) => m.default as Record<string, W[] | null>)]);
  return (
    <article className="reader">
      <header><h1>كلمات سورة {meta.name}</h1><div className="meta"><span>نوع كل كلمة وجذرها وخصائصها</span></div></header>
      <ol className="tafsir-list">
        {ayat.map((a) => {
          const words = a.t.split(' '); const m = morph[a.n];
          return (
            <li key={a.n} id={`a${a.n}`} className="card">
              <p className="meta"><span>الآية {arDigits(a.n)}</span></p>
              {!m ? <><p lang="ar" className="ayat">{a.t}</p><p className="note">تقسيم الكلمات في نصنا يختلف عن المدوّنة في هذه الآية، فلا نعرض تحليلها حتى لا ننسب لكلمة تحليل غيرها.</p></> : (
                <table className="words">
                  <tbody>
                    {words.map((w, i) => {
                      const x = m[i]; const root = rootArabic(x.r);
                      return (
                        <tr key={i}>
                          <th scope="row" lang="ar">{w}</th>
                          <td><strong>{POS[x.p] ?? x.p}</strong>{root && <> · الجذر: <span lang="ar">{root}</span></>}
                            {[...featureLabels(x.f, x.p), ...x.pre.map((t) => `سابقة: ${POS[t] ?? t}`), ...x.suf.map((t) => `لاحقة: ${sufLabel(t)}`)].length > 0 &&
                              <div className="note" style={{ margin: 0 }}>{[...featureLabels(x.f, x.p), ...x.pre.map((t) => `سابقة: ${POS[t] ?? t}`), ...x.suf.map((t) => `لاحقة: ${sufLabel(t)}`)].join('، ')}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </li>
          );
        })}
      </ol>
      <nav className="pager"><Link className="btn ghost" href={`/quran/${n}`}>رجوع إلى السورة</Link></nav>
    </article>
  );
}
