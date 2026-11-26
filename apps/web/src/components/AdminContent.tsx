'use client';
import { useEffect, useState } from 'react';
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
type Src = { id: string; name: string; items: number; detail: string; license: string };
/** Content & imports: inventory, link check, IslamHouse update check, hide/show a dua or recording. */
export default function AdminContent() {
  const [d, setD] = useState<{ sources: Src[]; hidden: string[] } | null>(null); const [out, setOut] = useState(''); const [busy, setBusy] = useState(''); const [id, setId] = useState('');
  const load = async () => setD(await (await fetch('/api/admin/content', { cache: 'no-store' })).json());
  useEffect(() => { void load(); }, []);
  const act = async (body: object, label: string) => { setBusy(label); setOut(''); const r = await fetch('/api/admin/content', { method: 'POST', headers: H, body: JSON.stringify(body) }); const j = await r.json(); setBusy(''); setOut(JSON.stringify(j, null, 1)); void load(); };
  if (!d) return <p className="note">…</p>;
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>المحتوى والاستيراد</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th>المصدر</th><th>العدد</th><th>تفاصيل</th><th>الترخيص</th></tr></thead>
        <tbody>{d.sources.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.items}</td><td>{s.detail}</td><td><small>{s.license}</small></td></tr>)}</tbody></table>
      <div className="row">
        <button type="button" className="btn small" disabled={!!busy} onClick={() => act({ action: 'check' }, 'check')}>{busy === 'check' ? 'جارٍ الفحص…' : 'افحص روابط الصوتيات'}</button>
        <button type="button" className="btn ghost small" disabled={!!busy} onClick={() => act({ action: 'updates' }, 'updates')}>{busy === 'updates' ? '…' : 'تحقق من تحديثات IslamHouse'}</button>
      </div>
      <div className="row"><input value={id} onChange={(e) => setId(e.target.value.trim())} placeholder="معرّف: q12 أو ih263352-5 أو tv69" dir="ltr" />
        <button type="button" className="btn ghost small" onClick={() => act({ action: 'hide', id }, 'hide')}>أخفِ</button><button type="button" className="btn ghost small" onClick={() => act({ action: 'show', id }, 'show')}>أظهر</button></div>
      <p className="note">المخفي الآن: {d.hidden.length ? d.hidden.join('، ') : 'لا شيء'}. الإخفاء يظهر أثره خلال دقائق. إضافة مصادر جديدة تتم بلقطة موثّقة في المستودع ثم إعادة بناء (حتى تبقى كل مادة بمصدرها وبصمتها).</p>
      {out && <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto', direction: 'ltr' }}>{out}</pre>}
    </section>
  );
}
