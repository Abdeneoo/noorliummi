'use client';
import { useCallback, useEffect, useState } from 'react';
import AdminAdhan from './AdminAdhan';
import AdminErrors from './AdminErrors';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminReview from './AdminReview';
import AdminLessons from './AdminLessons';
import AdminContent from './AdminContent';

type Row = { id: number; slug: string; display_name: string; dedication: string; dua_text: string; status: string; report_count: number; created_at: string; reasons: string[] };
type Data = { rows: Row[]; counts: Record<string, number>; openReports: number };
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
const STATUS: Record<string, string> = { active: 'نشطة', frozen: 'موقوفة', removed: 'محذوفة' };

export default function AdminPanel() {
  const [data, setData] = useState<Data | null>(null); const [need, setNeed] = useState(false);
  const [tab, setTab] = useState<'stats' | 'users' | 'reports' | 'review' | 'athar' | 'adhan' | 'errors' | 'content'>('stats');
  const [token, setToken] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const r = await fetch('/api/admin/athar', { cache: 'no-store' });
    if (r.status === 401) { setNeed(true); setData(null); return; }
    if (!r.ok) { setErr('تعذّر التحميل.'); return; }
    setNeed(false); setData(await r.json());
  }, []);
  useEffect(() => { void load(); }, [load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: H, body: JSON.stringify({ token }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) { setErr(j.error ?? 'تعذّر الدخول.'); return; }
    setToken(''); void load();
  };
  const act = async (id: number, action: 'approve' | 'remove' | 'dismiss') => {
    if (action === 'remove' && !confirm('حذف الصفحة نهائيًا ومسح نصها؟ لا يمكن التراجع.')) return;
    const r = await fetch('/api/admin/athar', { method: 'POST', headers: H, body: JSON.stringify({ id, action }) });
    if (!r.ok) setErr('تعذّر تنفيذ الإجراء.'); void load();
  };

  if (need) return (
    <form className="card athar-form" onSubmit={login}>
      <div className="field"><label htmlFor="tk">رمز المراجعة</label><input id="tk" type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} /></div>
      {err && <p className="note" role="alert">{err}</p>}
      <button className="btn" disabled={busy || !token}>دخول</button>
      <p className="note">الرمز محفوظ على الخادم فقط. لا ترسله لأحد ولا تكتبه في أي محادثة.</p>
    </form>
  );
  if (!data) return <p aria-busy="true">{err || 'جارٍ التحميل…'}</p>;
  return (
    <div>
      <p className="meta">
        <span>صفحات نشطة: {data.counts.active ?? 0}</span><span>موقوفة: {data.counts.frozen ?? 0}</span><span>محذوفة: {data.counts.removed ?? 0}</span><span>بلاغات مفتوحة: {data.openReports}</span>
      </p>
      <div className="row"><button type="button" className="btn ghost" onClick={() => void load()}>تحديث</button>
        <button type="button" className="btn ghost" onClick={async () => { await fetch('/api/admin/login', { method: 'DELETE' }); setNeed(true); setData(null); }}>خروج</button></div>
      <ul className="chips lib-groups" role="tablist" style={{ margin: '16px 0' }}>
        <li><button type="button" role="tab" aria-selected={tab === 'stats'} className={tab === 'stats' ? 'on' : ''} onClick={() => setTab('stats')}>الإحصاءات</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'users'} className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>الحسابات</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'reports'} className={tab === 'reports' ? 'on' : ''} onClick={() => setTab('reports')}>بلاغات الأخطاء</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'review'} className={tab === 'review' ? 'on' : ''} onClick={() => setTab('review')}>المراجعة والبث</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'athar'} className={tab === 'athar' ? 'on' : ''} onClick={() => setTab('athar')}>صفحات الأثر</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'adhan'} className={tab === 'adhan' ? 'on' : ''} onClick={() => setTab('adhan')}>أصوات الأذان</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'content'} className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}>المحتوى والاستيراد</button></li>
        <li><button type="button" role="tab" aria-selected={tab === 'errors'} className={tab === 'errors' ? 'on' : ''} onClick={() => setTab('errors')}>سجل الأخطاء</button></li>
      </ul>
      {err && <p className="note" role="alert">{err}</p>}
      {tab === 'content' ? <AdminContent /> : tab === 'stats' ? <AdminStats /> : tab === 'users' ? <AdminUsers /> : tab === 'reports' ? <AdminReports /> : tab === 'review' ? <><AdminReview /><AdminLessons /></> : tab === 'errors' ? <AdminErrors /> : tab === 'adhan' ? <AdminAdhan /> : data.rows.length === 0 ? <section className="card"><p>لا شيء يحتاج مراجعة الآن.</p></section> : data.rows.map((r) => (
        <section key={r.id} className="card">
          <p className="meta"><span>{STATUS[r.status] ?? r.status}</span><span>بلاغات: {r.report_count}</span><span>{r.created_at.slice(0, 10)}</span>
            {r.status !== 'removed' && <span><a href={`/athar/${r.slug}`} target="_blank" rel="noopener">فتح الصفحة</a></span>}</p>
          <h2 style={{ margin: '6px 0', fontSize: '1.1rem' }}>{r.display_name}</h2>
          {r.dedication && <p style={{ whiteSpace: 'pre-line' }}>{r.dedication}</p>}
          {r.dua_text && <p style={{ whiteSpace: 'pre-line' }}>{r.dua_text}</p>}
          {r.reasons.length > 0 && <><p className="note">أسباب البلاغات:</p><ul>{r.reasons.map((x, i) => <li key={i} style={{ whiteSpace: 'pre-line' }}>{x}</li>)}</ul></>}
          <div className="row">
            <button type="button" className="btn" onClick={() => act(r.id, 'approve')}>سليمة: أعِد نشرها</button>
            <button type="button" className="btn ghost" onClick={() => act(r.id, 'dismiss')}>تجاهل البلاغات</button>
            <button type="button" className="btn ghost" onClick={() => act(r.id, 'remove')}>احذفها</button>
          </div>
        </section>
      ))}
    </div>
  );
}
