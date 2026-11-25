'use client';
import { useEffect, useState } from 'react';
import { NISAB_GOLD_G, NISAB_SILVER_G, zakat } from '@/lib/zakat';
const F = (v: number) => v.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
export default function ZakatCalc() {
  const [v, setV] = useState({ cash: 0, goldG: 0, silverG: 0, trade: 0, debtsDue: 0, goldPrice: 0, silverPrice: 0 }); const [by, setBy] = useState<'gold' | 'silver'>('gold');
  const [price, setPrice] = useState<{ gold: number; silver: number; at: string } | null>(null); const [perr, setPerr] = useState(false);
  useEffect(() => { fetch('/api/gold').then((r) => (r.ok ? r.json() : Promise.reject())).then(setPrice).catch(() => setPerr(true)); }, []);
  const num = (k: keyof typeof v, label: string, hint?: string) => (
    <div className="field"><label htmlFor={`z-${k}`}>{label}</label><input id={`z-${k}`} type="number" inputMode="decimal" min={0} step="any" value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} />{hint && <small className="note">{hint}</small>}</div>);
  const r = zakat({ ...v, nisabBy: by });
  return (
    <>
      <p className="review-banner"><strong>حسابات استرشادية للتعلم — والفتوى في الزكاة تُؤخذ من عالم.</strong> الحاسبة تطبّق القاعدة العامة فقط (النصاب وحولان الحول و٢٫٥٪)، ولا تغطي الأنعام والزروع والأسهم والديون المشكوك فيها وما فيه خلاف.</p>
      <section className="card"><h2 style={{ marginTop: 0 }}>سعر الجرام بعملتك</h2>
        <p className="note">{price ? `السعر العالمي الآن تقريبًا: الذهب ${F(price.gold)} دولارًا للجرام (عيار ٢٤)، والفضة ${F(price.silver)} دولار — من gold-api.com. حوّله إلى عملتك وسعر بلدك ثم اكتبه.` : perr ? 'تعذّر جلب السعر العالمي الآن؛ اكتب سعر الجرام في بلدك.' : 'جارٍ جلب السعر…'}</p>
        <div className="row">{num('goldPrice', 'سعر جرام الذهب (عيار ٢٤)')}{num('silverPrice', 'سعر جرام الفضة')}</div>
        {price && <button type="button" className="btn ghost small" onClick={() => setV({ ...v, goldPrice: price.gold, silverPrice: price.silver })}>احسب بالدولار بالسعر العالمي</button>}
      </section>
      <section className="card"><h2 style={{ marginTop: 0 }}>ما تملكه ومرّ عليه حول هجري</h2>
        <div className="row">{num('cash', 'النقود والأرصدة')}{num('trade', 'قيمة عروض التجارة', 'بسعر البيع اليوم')}</div>
        <div className="row">{num('goldG', 'الذهب بالجرام (عيار ٢٤)', 'عيار ٢١: اضرب الوزن في ٠٫٨٧٥، وعيار ١٨ في ٠٫٧٥')}{num('silverG', 'الفضة بالجرام')}</div>
        <div className="row">{num('debtsDue', 'ديون حالّة عليك (تُخصم)')}
          <div className="field"><label htmlFor="z-by">النصاب بقيمة</label><select id="z-by" value={by} onChange={(e) => setBy(e.target.value as 'gold' | 'silver')}><option value="gold">الذهب ({NISAB_GOLD_G.toLocaleString('ar-EG')} جرامًا)</option><option value="silver">الفضة ({NISAB_SILVER_G.toLocaleString('ar-EG')} جرامًا)</option></select><small className="note">اختلف أهل العلم بأيهما يُقدَّر نصاب النقود؛ اسأل عالمًا.</small></div></div>
      </section>
      <section className="card season" aria-live="polite"><h2 style={{ marginTop: 0 }}>النتيجة</h2>
        {r.nisab === 0 ? <p>اكتب سعر الجرام أولًا.</p> : <>
          <p>المجموع: <strong>{F(r.total)}</strong> · النصاب: <strong>{F(r.nisab)}</strong></p>
          {r.due ? <p style={{ fontSize: '1.3rem' }}>الزكاة التقديرية (٢٫٥٪): <strong>{F(r.amount)}</strong></p> : <p>المجموع أقل من النصاب بهذا التقدير.</p>}</>}
        <p className="note">نتيجة تقريبية للتعلم وليست فتوى. لا يُحفظ ما تكتبه ولا يُرسل.</p>
      </section>
    </>
  );
}
