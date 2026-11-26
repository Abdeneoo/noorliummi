import Link from 'next/link';
import { bab } from '@/lib/fiqh';
import { loadSurah, arDigits } from '@/lib/quran';
import { hadithRef } from '@/lib/hadith-ref';
import { kidHere } from '@/lib/kid-page';
import PrintButton from '@/components/PrintButton';
export const dynamic = 'force-dynamic';
/**
 * How to make wudu — text only for now (illustrations will come after review). Every line is quoted from its source:
 * al-Ma'ida 6 (Tanzil), the wudu chapter of «الفقه الميسر» (its obligations and sunnahs, verbatim), and Sahih al-Bukhari 159.
 */
export default async function KidsWudu() {
  const k = await kidHere(); if (k?.timeUp) return null;
  const ayah = (await loadSurah(5)).ayat[5].t;
  const b = bab(5)!; const at = (t: string) => b.blocks.findIndex((x) => x.tag === 'h3' && x.ar.startsWith(t));
  const fard = b.blocks.slice(at('المسألة الرابعة'), at('المسألة الخامسة')); const sunan = b.blocks.slice(at('المسألة الخامسة'), at('المسألة السادسة'));
  const h = await hadithRef('bukhari', 4, 159);
  const show = (xs: typeof fard) => xs.map((x, i) => x.tag === 'h3' ? <h2 key={i}>{x.ar.replace(/^المسألة \S+: /, '').replace(/:$/, '')}</h2> : x.tag === 'ref' ? <p key={i} className="fiqh-ref">[{x.ar.replace(/\.$/, '')}]</p> : <p key={i}>{x.tag === 'lead' ? <strong>{x.ar}</strong> : x.ar}</p>);
  return (
    <article className="kid-wudu">
      <h1>كيف أتوضأ؟</h1>
      <PrintButton label="اطبع دليل الوضوء" />
      <section className="card"><h2>قال الله تعالى</h2><p className="ayat" lang="ar" style={{ fontFamily: 'var(--font-quran)' }}>{ayah} ﴿{arDigits(6)}﴾</p><p className="note">سورة المائدة، الآية ٦</p></section>
      <section className="card">{show(fard)}</section>
      <section className="card">{show(sunan)}</section>
      <section className="card"><h2>صفة وضوء النبي ﷺ كما رواها عثمان رضي الله عنه</h2><p lang="ar">{h.t}</p><p className="note">صحيح البخاري، رقم {arDigits(159)}{k ? '' : <> — <Link href={h.href}>في كتاب الحديث</Link></>}</p></section>
      <p className="note">المصادر: المصحف (Tanzil)، و«الفقه الميسر» (مجمع الملك فهد)، وصحيح البخاري. الرسوم التوضيحية قيد الإعداد وستُعرض بعد مراجعتها. لم يراجع هذه الصفحة مراجع شرعي أو تربوي بعد.</p>
    </article>
  );
}
