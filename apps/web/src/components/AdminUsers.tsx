'use client';
import { useCallback, useEffect, useState } from 'react';
type U = { id: number; email: string; status: string; created_at: string; last_login: string | null; pages: number };
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export default function AdminUsers() {
  const [rows, setRows] = useState<U[] | null>(null); const [q, setQ] = useState('');
  const load = useCallback(async (query = '') => { const r = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, { cache: 'no-store' }); setRows(r.ok ? (await r.json()).rows : []); }, []);
  useEffect(() => { void load(); }, [load]);
  const act = async (id: number, action: string, ask?: string) => { if (ask && !confirm(ask)) return; await fetch('/api/admin/users', { method: 'POST', headers: H, body: JSON.stringify({ id, action }) }); void load(q); };
  if (!rows) return <p className="note">جارٍ التحميل…</p>;
  return (
    <section className="card">
      <form className="row" style={{ marginTop: 0 }} onSubmit={(e) => { e.preventDefault(); void load(q); }}><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالبريد" aria-label="ابحث بالبريد" style={{ flex: '1 1 220px' }} dir="ltr" /><button className="btn ghost">بحث</button></form>
      <p className="note">{rows.length} حسابًا (أحدث ٢٠٠). كل شيء مجاني؛ الحظر للإساءة فقط.</p>
      <div style={{ overflowX: 'auto' }}><table className="admin-table">
        <thead><tr><th>البريد</th><th>أُنشئ</th><th>آخر دخول</th><th>صفحات</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>{rows.map((u) => (
          <tr key={u.id}><td dir="ltr">{u.email}</td><td>{d(u.created_at)}</td><td>{d(u.last_login)}</td><td>{u.pages}</td><td>{u.status === 'blocked' ? 'محظور' : 'نشط'}</td>
            <td><div className="row" style={{ margin: 0, gap: 6 }}>
              {u.status === 'blocked' ? <button type="button" className="btn ghost small" onClick={() => act(u.id, 'unblock')}>رفع الحظر</button> : <button type="button" className="btn ghost small" onClick={() => act(u.id, 'block', 'حظر الحساب وتسجيل خروجه؟')}>حظر</button>}
              <button type="button" className="btn ghost small" onClick={() => act(u.id, 'signout')}>تسجيل خروج</button>
              {u.pages > 0 && <button type="button" className="btn ghost small" onClick={() => act(u.id, 'freeze_pages', 'إيقاف كل صفحات هذا الحساب مؤقتًا؟')}>إيقاف صفحاته</button>}
              <button type="button" className="btn ghost small" onClick={() => act(u.id, 'delete', 'حذف الحساب نهائيًا؟ صفحاته تبقى بلا مالك.')}>حذف</button>
            </div></td></tr>))}</tbody>
      </table></div>
    </section>
  );
}
