import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROPHETS, prophetAyat } from '@/lib/prophets';
import { SURAHS, arDigits } from '@/lib/quran';
import { ayat as count } from '@/lib/arnum';
export const dynamicParams = false;
export function generateStaticParams() { return PROPHETS.map((p) => ({ id: p.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const p = PROPHETS.find((x) => x.id === id); return { title: p ? `ذكر ${p.name} في القرآن` : 'الأنبياء' }; }
export default async function ProphetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const p = PROPHETS.find((x) => x.id === id); if (!p) notFound();
  const list = await prophetAyat(p); const bySurah = new Map<number, typeof list>();
  for (const x of list) bySurah.set(x.s, [...(bySurah.get(x.s) ?? []), x]);
  return (
    <article className="reader">
      <header><p className="eyebrow"><Link href="/prophets">ذكر الأنبياء في القرآن</Link></p><h1>{p.name}{p.id === 'muhammad' ? '' : ' عليه السلام'}</h1><div className="meta"><span>ورد الاسم {arDigits(p.count)} مرة</span><span>في {count(list.length)}</span><span>{arDigits(bySurah.size)} سورة</span></div></header>
      <p className="note">الآيات التي ورد فيها الاسم بلفظه، بترتيب المصحف. اقرأ ما قبل الآية وما بعدها في المصحف لتمام السياق.</p>
      {[...bySurah.entries()].map(([s, ay]) => (
        <section key={s} className="section"><h2>سورة {SURAHS[s - 1].name}</h2>
          <ol className="tafsir-list" style={{ listStyle: 'none', padding: 0 }}>{ay.map((x) => <li key={x.a} className="card"><p className="tafsir-ayah" lang="ar">{x.text} <span className="ayah-end">﴿{arDigits(x.a)}﴾</span></p>
            <p className="meta" style={{ justifyContent: 'flex-start' }}><Link href={`/quran/${x.s}#a${x.a}`}>في المصحف</Link><Link href={`/tafsir/${x.s}#a${x.a}`}>التفسير</Link></p></li>)}</ol></section>
      ))}
    </article>
  );
}
