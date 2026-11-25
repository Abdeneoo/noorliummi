'use client';
import { useState } from 'react';
import { inherit, type Heirs } from '@/lib/inheritance';
const ar = (n: number) => n.toLocaleString('ar-EG');
const fr = ([n, d]: [number, number]) => (d === 1 ? ar(n) : `${ar(n)}/${ar(d)}`);
export default function InheritanceCalc() {
  const [h, setH] = useState<Heirs>({ husband: false, wives: 0, father: false, mother: false, sons: 0, daughters: 0, siblings: 0, others: false }); const [estate, setEstate] = useState(0);
  const [sp, setSp] = useState<'none' | 'husband' | 'wives'>('none');
  const num = (k: 'wives' | 'sons' | 'daughters' | 'siblings', label: string, max = 30) => <div className="field"><label htmlFor={`i-${k}`}>{label}</label><input id={`i-${k}`} type="number" min={0} max={max} value={h[k] || ''} onChange={(e) => setH({ ...h, [k]: Math.max(0, Math.min(max, Math.floor(Number(e.target.value) || 0))) })} /></div>;
  const chk = (k: 'father' | 'mother' | 'others', label: string) => <label className="listed-opt"><input type="checkbox" checked={h[k]} onChange={(e) => setH({ ...h, [k]: e.target.checked })} /> <span>{label}</span></label>;
  const r = inherit(h);
  return (
    <>
      <p className="review-banner"><strong>غير معتمدة: لم يراجعها متخصص في الفرائض بعد. حسابات استرشادية للتعلم — والفتوى في الميراث تُؤخذ من عالم أو محكمة شرعية.</strong> الحاسبة تغطي أبسط الحالات المتفق عليها فقط: الزوج أو الزوجة، والأب، والأم، والأبناء والبنات. وتُقسم التركة بعد تجهيز الميت وسداد ديونه وتنفيذ وصيته، وهذه لا تحسبها الحاسبة.</p>
      <section className="card"><h2 style={{ marginTop: 0 }}>الورثة الأحياء</h2>
        <div className="row"><div className="field"><label htmlFor="i-sp">الزوج / الزوجة</label><select id="i-sp" value={sp} onChange={(e) => { const v = e.target.value as typeof sp; setSp(v); setH({ ...h, husband: v === 'husband', wives: v === 'wives' ? Math.max(1, h.wives) : 0 }); }}><option value="none">لا يوجد</option><option value="husband">زوج (المتوفاة امرأة)</option><option value="wives">زوجة أو أكثر (المتوفى رجل)</option></select></div>
          {sp === 'wives' && num('wives', 'عدد الزوجات', 4)}</div>
        <div className="row">{chk('father', 'الأب حي')}{chk('mother', 'الأم حية')}</div>
        <div className="row">{num('sons', 'عدد الأبناء')}{num('daughters', 'عدد البنات')}{num('siblings', 'عدد إخوة وأخوات المتوفى')}</div>
        {chk('others', 'يوجد أقارب آخرون أحياء (جد، جدة، أولاد ابن، أعمام…)')}
        <div className="field" style={{ maxWidth: 260 }}><label htmlFor="i-e">قيمة التركة الصافية (اختياري)</label><input id="i-e" type="number" min={0} step="any" value={estate || ''} onChange={(e) => setEstate(Number(e.target.value) || 0)} /></div>
      </section>
      <section className="card season" aria-live="polite"><h2 style={{ marginTop: 0 }}>الأنصبة</h2>
        {!r.ok ? <p>{r.reason}</p> : <>
          <div style={{ overflowX: 'auto' }}><table className="admin-table"><thead><tr><th>الوارث</th><th>النصيب</th><th>لكل واحد</th>{estate > 0 && <th>المبلغ لكل واحد</th>}<th>السبب</th></tr></thead>
            <tbody>{r.shares.map((s) => <tr key={s.who}><td>{s.who}{s.count > 1 ? ` (${ar(s.count)})` : ''}</td><td>{fr(s.total)}</td><td>{fr(s.each)}</td>{estate > 0 && <td>{((estate * s.each[0]) / s.each[1]).toLocaleString('ar-EG', { maximumFractionDigits: 2 })}</td>}<td>{s.basis}</td></tr>)}</tbody></table></div>
          {r.note && <p>{r.note}</p>}</>}
        <p className="note">نتيجة للتعلم وليست حكمًا ولا فتوى. لا يُحفظ ما تدخله ولا يُرسل.</p>
      </section>
    </>
  );
}
