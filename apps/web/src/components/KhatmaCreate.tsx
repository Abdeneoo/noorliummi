'use client';
import { useState } from 'react';
import { PHRASES, TARGETS } from '@/lib/dhikr-phrases';
export default function KhatmaCreate({ athar }: { athar?: { slug: string; name: string } }) {
  const [name, setName] = useState(athar?.name ?? ''); const [fem, setFem] = useState(false); const [err, setErr] = useState(''); const [kind, setKind] = useState<'quran' | 'dhikr' | 'dua'>('quran'); const [phrase, setPhrase] = useState(4); const [target, setTarget] = useState(1000); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setErr('');
    const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement)?.value;
    const r = await fetch('/api/khatma', { method: 'POST', headers: { 'content-type': 'application/json', 'x-noor': '1' }, body: JSON.stringify({ display_name: name, feminine: fem, athar_slug: athar?.slug, website, kind, phrase, target }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) { setErr(j.error ?? 'تعذّر الإنشاء.'); return; }
    try { localStorage.setItem(`noor.khatma.admin.${j.slug}`, JSON.stringify(j.token)); const mine = JSON.parse(localStorage.getItem('noor.khatma.mine') || '[]'); mine.unshift({ slug: j.slug, name }); localStorage.setItem('noor.khatma.mine', JSON.stringify(mine.slice(0, 20))); } catch { /* ignore */ }
    location.href = `/khatma/${j.slug}`;
  };
  return (
    <form className="card" onSubmit={submit}>
      <fieldset style={{ border: 0, padding: 0, margin: '0 0 12px' }}><legend className="note">ماذا تُهدي؟</legend>
        <ul className="chips lib-groups" style={{ margin: 0 }}>
          {([['quran', 'ختمة قرآن (٣٠ جزءًا)'], ['dhikr', 'ذكر جماعي بعدد'], ['dua', 'دعاء']] as const).map(([k, l]) => <li key={k}><button type="button" className={kind === k ? 'on' : ''} aria-pressed={kind === k ? 'true' : 'false'} onClick={() => setKind(k)}>{l}</button></li>)}
        </ul></fieldset>
      {kind === 'dhikr' && <div className="row" style={{ marginTop: 0 }}>
        <div className="field"><label htmlFor="kp">الذكر</label><select id="kp" value={phrase} onChange={(e) => setPhrase(Number(e.target.value))}>{PHRASES.map((p, i) => <option key={i} value={i}>{p.ar}</option>)}</select></div>
        <div className="field"><label htmlFor="kt">العدد المستهدف</label><select id="kt" value={target} onChange={(e) => setTarget(Number(e.target.value))}>{TARGETS.map((x) => <option key={x} value={x}>{x ? x.toLocaleString('ar-EG') : 'بلا حد'}</option>)}</select></div></div>}
      <div className="field"><label htmlFor="kn">مُهداة إلى</label><input id="kn" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلًا: أمي الغالية" /></div>
      <fieldset className="row" style={{ border: 0, padding: 0 }}><legend className="note">صيغة الدعاء</legend>
        <label><input type="radio" name="g" checked={!fem} onChange={() => setFem(false)} /> له</label>
        <label><input type="radio" name="g" checked={fem} onChange={() => setFem(true)} /> لها</label></fieldset>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {err && <p className="note" role="alert">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? 'جارٍ الإنشاء…' : 'أنشئ الصفحة وشارك رابطها'}</button>
      <p className="note">لا يلزم حساب. يُحفظ على جهازك حق إدارة الختمة (إتاحة جزء حجزه أحد ولم يقرأه).</p>
    </form>
  );
}
