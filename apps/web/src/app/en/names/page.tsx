import type { Metadata } from 'next';
import Link from 'next/link';
import names from '@/generated/names-of-allah.json';
import { SURAHS, arDigits, loadSurah } from '@/lib/quran';
export const metadata: Metadata = { title: 'The Names of Allah' };
type N = { id: number; name: string; refs: [number, number][]; page: number | null; url: string | null };
type En = { v: string; ayat: { tr: string; fn: string }[] };

export default async function Names() {
  const list = names as N[];
  const need = [...new Set(list.flatMap((n) => n.refs.slice(0, 2).map(([s]) => s)))];
  const ar = new Map(await Promise.all(need.map(async (s) => [s, await loadSurah(s)] as const)));
  const en = new Map(await Promise.all(need.map(async (s) => [s, (await import(`@/generated/en/quran/${s}.json`)).default as En] as const)));
  return (
    <article style={{ maxWidth: 860, margin: '24px auto' }}>
      <h1>The Most Beautiful Names of Allah</h1>
      <p className="meta"><span>The 99 names in the order of «Sharh Asma&apos; Allah al-Husna fi Daw&apos; al-Kitab wa al-Sunnah» by Dr Sa&apos;id ibn Ali ibn Wahf al-Qahtani</span></p>
      <p className="review-banner">Trial version awaiting review by scholars.</p>
      <ol className="grid" style={{ listStyle: 'none', padding: 0, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
        {list.map((n) => (
          <li key={n.id} className="card">
            <h2 lang="ar" dir="rtl" style={{ marginTop: 0, fontSize: '1.6rem' }}>{n.name}</h2>
            {n.refs.slice(0, 2).map(([s, a]) => (
              <div key={`${s}:${a}`}>
                <p lang="ar" dir="rtl" className="ayat" style={{ fontSize: '1.05rem', margin: '6px 0' }}>{ar.get(s)!.ayat[a - 1].t} <span className="ayah-end">﴿{arDigits(a)}﴾</span></p>
                <p className="en-tr"><Link href={`/en/quran/${s}#a${a}`}>{SURAHS[s - 1].tname} {s}:{a}</Link> — {en.get(s)!.ayat[a - 1].tr}</p>
                {en.get(s)!.ayat[a - 1].fn && <p className="en-fn">{en.get(s)!.ayat[a - 1].fn}</p>}
              </div>
            ))}
            {n.url && <p className="note"><a href={n.url} rel="noopener">Explanation in the book (Arabic){n.page ? `, p. ${n.page}` : ''}</a></p>}
          </li>
        ))}
      </ol>
    </article>
  );
}
