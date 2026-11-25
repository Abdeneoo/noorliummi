import type { Metadata } from 'next';
import Link from 'next/link';
import names from '@/generated/names-of-allah.json';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';
export const metadata: Metadata = { title: 'أسماء الله الحسنى' };
type N = { id: number; name: string; refs: [number, number][]; page: number | null; url: string | null };

export default async function Names() {
  const list = names as N[];
  const need = [...new Set(list.flatMap((n) => n.refs.map(([s]) => s)))];
  const surahs = new Map(await Promise.all(need.map(async (s) => [s, await loadSurah(s)] as const)));
  return (
    <article style={{ maxWidth: 860, margin: '24px auto' }}>
      <h1>أسماء الله الحسنى</h1>
      <p className="meta"><span>التسعة والتسعون بترتيب كتاب «شرح أسماء الله الحسنى في ضوء الكتاب والسنة»</span><span>د. سعيد بن علي بن وهف القحطاني</span></p>
      <p className="review-banner">نسخة تجريبية بانتظار مراجعة أهل العلم.</p>
      <ol className="grid" style={{ listStyle: 'none', padding: 0, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
        {list.map((n) => (
          <li key={n.id} id={`n${n.id}`} className="card">
            <h2 lang="ar" style={{ marginTop: 0, fontSize: '1.6rem' }}>{n.name}</h2>
            {n.refs.slice(0, 3).map(([s, a]) => (
              <p key={`${s}:${a}`} lang="ar" className="ayat" style={{ fontSize: '1.05rem', margin: '6px 0' }}>
                {surahs.get(s)!.ayat[a - 1].t} <Link className="ayah-end" href={`/quran/${s}#a${a}`}>﴿{SURAHS[s - 1].name}: {arDigits(a)}﴾</Link>
              </p>
            ))}
            {n.refs.length > 3 && <p className="note">و{arDigits(n.refs.length - 3)} مواضع أخرى يذكرها الكتاب.</p>}
            {n.url && <p className="note"><a href={n.url} rel="noopener">الشرح في الكتاب{n.page ? ` (ص ${arDigits(n.page)})` : ''}</a></p>}
          </li>
        ))}
      </ol>
      <p className="note">قائمة الأسماء وإحالات الآيات من <a href="https://github.com/rn0x/Names_Of_Allah_Json" rel="noopener">rn0x/Names_Of_Allah_Json</a> (MIT لبنية البيانات). تحقّقنا آليًا من أن كل آية معروضة هي الموضع المذكور في الكتاب.</p>
    </article>
  );
}
