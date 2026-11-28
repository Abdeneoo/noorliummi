'use client';
import { useState } from 'react';
type M = Record<string, { v: 'ok' | 'note'; n: string }>;
type G = { group: string; items: { key: string; title: string; href: string; what: string }[] }[];
/** The reviewer's checklist: open each page, then mark it «سليم» or «فيه ملاحظة» with a note. Saved per item. */
export default function ReviewBoard({ token, name, groups, marks }: { token: string; name: string; groups: G; marks: M }) {
  const [m, setM] = useState<M>(marks); const [draft, setDraft] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(''); const [err, setErr] = useState('');
  const total = groups.reduce((s, g) => s + g.items.length, 0); const done = Object.keys(m).length; const notes = Object.values(m).filter((x) => x.v === 'note').length;
  const save = async (key: string, verdict: 'ok' | 'note' | 'clear', note = '') => {
    setBusy(key); setErr('');
    const r = await fetch('/api/review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, key, verdict, note }) });
    setBusy(''); if (!r.ok) { setErr((await r.json().catch(() => ({}))).error ?? 'تعذّر الحفظ.'); return; }
    setM((x) => { const y = { ...x }; if (verdict === 'clear') delete y[key]; else y[key] = { v: verdict, n: note }; return y; });
  };
  return (
    <article className="rv" style={{ maxWidth: 860, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">مراجعة المحتوى</p><h1>أهلًا {name}</h1>
        <p>افتح كل صفحة، ثم اختر «سليم» أو «فيه ملاحظة» واكتب ملاحظتك. يُحفظ كل اختيار فورًا، ويمكنك العودة بنفس الرابط في أي وقت. هذا الرابط خاص بك، فلا تشاركه.</p></header>
      <div className="um-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}><span style={{ width: `${(done / total) * 100}%` }} /></div>
      <p className="note">راجعت {done.toLocaleString('ar-EG')} من {total.toLocaleString('ar-EG')}{notes ? ` · ${notes.toLocaleString('ar-EG')} بملاحظات` : ''}</p>
      {err && <p className="note" role="alert">{err}</p>}
      {groups.map((g) => (
        <section key={g.group} className="section" style={{ marginTop: 28 }}><h2>{g.group}</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>{g.items.map((it) => {
            const cur = m[it.key]; const open = draft[it.key] !== undefined;
            return (
              <li key={it.key} className={`card rv-item${cur ? ` rv-${cur.v}` : ''}`} style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div><strong>{it.title}</strong><p className="note" style={{ margin: '4px 0 0' }}>{it.what}</p></div>
                  <a className="btn ghost small" href={it.href} target="_blank" rel="noopener">افتح الصفحة</a>
                </div>
                {cur?.v === 'note' && !open && <p style={{ whiteSpace: 'pre-line', margin: '10px 0 0' }}>ملاحظتك: {cur.n}</p>}
                {open && <textarea rows={4} style={{ width: '100%', marginTop: 10 }} value={draft[it.key]} onChange={(e) => setDraft((d) => ({ ...d, [it.key]: e.target.value }))} placeholder="اكتب الملاحظة: الموضع، والصواب، والمرجع إن وُجد." />}
                <div className="row" style={{ marginTop: 10, gap: 6 }}>
                  {open ? <>
                    <button type="button" className="btn small" disabled={busy === it.key || !draft[it.key]?.trim()} onClick={async () => { await save(it.key, 'note', draft[it.key]); setDraft((d) => { const x = { ...d }; delete x[it.key]; return x; }); }}>احفظ الملاحظة</button>
                    <button type="button" className="btn ghost small" onClick={() => setDraft((d) => { const x = { ...d }; delete x[it.key]; return x; })}>إلغاء</button>
                  </> : <>
                    <button type="button" className={`btn small${cur?.v === 'ok' ? '' : ' ghost'}`} disabled={busy === it.key} onClick={() => save(it.key, 'ok')} aria-pressed={cur?.v === 'ok'}>✓ سليم</button>
                    <button type="button" className={`btn small${cur?.v === 'note' ? '' : ' ghost'}`} onClick={() => setDraft((d) => ({ ...d, [it.key]: cur?.n ?? '' }))} aria-pressed={cur?.v === 'note'}>✎ فيه ملاحظة</button>
                    {cur && <button type="button" className="btn ghost small" disabled={busy === it.key} onClick={() => save(it.key, 'clear')}>إلغاء الاختيار</button>}
                  </>}
                </div>
              </li>
            );
          })}</ul>
        </section>
      ))}
      <p className="note" style={{ marginTop: 24 }}>جزاك الله خيرًا على وقتك.</p>
    </article>
  );
}
