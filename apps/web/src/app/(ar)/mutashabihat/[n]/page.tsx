import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS, arDigits, loadMutashabihat, loadSurah } from '@/lib/quran';

export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = SURAHS[Number((await params).n) - 1];
  return { title: s ? `متشابهات سورة ${s.name}` : 'المتشابهات' };
}

export default async function Mutashabihat({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const [{ meta, ayat }, map] = await Promise.all([loadSurah(n), loadMutashabihat(n)]);
  const cache = new Map<number, Awaited<ReturnType<typeof loadSurah>>>();
  const text = async (su: number, ay: number) => { if (!cache.has(su)) cache.set(su, await loadSurah(su)); return cache.get(su)!.ayat[ay - 1].t; };
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  const items = await Promise.all(keys.map(async (ay) => ({
    ay, text: ayat[ay - 1].t,
    others: await Promise.all(map[ay].map(async (rng) => ({ rng, texts: await Promise.all(rng.map(([su, a]) => text(su, a))) }))),
  })));
  return (
    <article className="reader">
      <h1>متشابهات سورة {meta.name}</h1>
      {items.length === 0 && <p>لا توجد مواضع مسجّلة في هذه السورة.</p>}
      <ul className="tafsir-list">
        {items.map((it) => (
          <li key={it.ay} className="tafsir-ayah card" id={`a${it.ay}`}>
            <p lang="ar" className="ayat">{it.text}<span className="ayah-end">﴿{arDigits(it.ay)}﴾</span></p>
            <p className="meta"><span>تشبهها:</span></p>
            <ul>
              {it.others.map((o, i) => (
                <li key={i}>
                  <Link href={`/quran/${o.rng[0][0]}#a${o.rng[0][1]}`}>سورة {SURAHS[o.rng[0][0] - 1].name}، آية {arDigits(o.rng[0][1])}{o.rng.length > 1 ? `–${arDigits(o.rng[o.rng.length - 1][1])}` : ''}</Link>
                  <p lang="ar" className="ayat">{o.texts.join(' ')}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <nav className="pager"><Link className="btn ghost" href={`/quran/${n}`}>رجوع إلى السورة</Link></nav>
    </article>
  );
}
