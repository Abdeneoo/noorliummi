'use client';
import { useEffect, useState } from 'react';
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
type R = { key: string; title: string; author: string; owner: string; source_url: string; contact: string; permissions: string[]; requested_on: string | null; status: string; approval: string; publish_status: string; notes: string; items: unknown[] };
const ST: Record<string, string> = { not_requested: 'لم يُطلب', requested: 'طُلب — بانتظار الرد', approved: 'موافَق', partial: 'موافقة جزئية', refused: 'مرفوض' };
const PB: Record<string, string> = { held: 'محجوز (غير منشور)', link_only: 'روابط لموقعهم فقط', embed_only: 'تضمين رسمي فقط', stream: 'بث من خوادمهم (بعد الموافقة)', published: 'منشور على خوادمنا' };
const PM: Record<string, string> = { direct: 'تشغيل مباشر', background: 'تشغيل في الخلفية', rehost: 'استضافة عندنا', offline: 'تنزيل ودون إنترنت', athar: 'في صفحات الأثر', text: 'نشر النص' };
/** Content waiting for permission: request date, reply, approval document, publish status. Publishing needs a recorded approval. */
export default function AdminRights() {
  const [list, setList] = useState<R[] | null>(null); const [msg, setMsg] = useState('');
  const load = async () => setList((await (await fetch('/api/admin/rights', { cache: 'no-store' })).json()).rights);
  useEffect(() => { void load(); }, []);
  const save = async (key: string, patch: Partial<R>) => { const r = await fetch('/api/admin/rights', { method: 'POST', headers: H, body: JSON.stringify({ key, ...patch }) }); const j = await r.json(); setMsg(r.ok ? 'حُفظ.' : j.error); void load(); };
  if (!list) return <p className="note">…</p>;
  return (
    <section className="card"><h2 style={{ marginTop: 0 }}>المحتوى المعلّق (الأذونات)</h2>
      <p className="note">لا يُراسل أحد من هنا تلقائيًا. رسائل الطلب الجاهزة في docs/RIGHTS_PENDING.md. «منشور» لا يُسمح به قبل تسجيل الموافقة ومستندها.</p>
      {msg && <p className="note" role="status">{msg}</p>}
      {list.map((r) => (
        <details key={r.key} className="card" style={{ marginBottom: 8 }}><summary><strong>{r.title}</strong> — {ST[r.status]} · {PB[r.publish_status]}{r.items.length ? ` · ${r.items.length} عنصرًا` : ''}</summary>
          <p className="note">{r.author && <>القراء/المؤلف: {r.author}<br /></>}الجهة المالكة: {r.owner}<br />المصدر: <a href={r.source_url} target="_blank" rel="noopener">{r.source_url}</a><br />الإذن المطلوب: {r.permissions.map((p) => PM[p] ?? p).join('، ')}</p>
          <div className="row">
            <label>الحالة <select defaultValue={r.status} onChange={(e) => save(r.key, { status: e.target.value })}>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>النشر <select defaultValue={r.publish_status} onChange={(e) => save(r.key, { publish_status: e.target.value, status: r.status })}>{Object.entries(PB).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>تاريخ الطلب <input type="date" defaultValue={r.requested_on ?? ''} onBlur={(e) => e.target.value && save(r.key, { requested_on: e.target.value })} /></label>
          </div>
          <label className="field">التواصل<input defaultValue={r.contact} onBlur={(e) => save(r.key, { contact: e.target.value })} dir="ltr" /></label>
          <label className="field">مستند الموافقة (رابط أو نص الرد)<textarea defaultValue={r.approval} rows={2} onBlur={(e) => save(r.key, { approval: e.target.value })} /></label>
          <label className="field">ملاحظات<textarea defaultValue={r.notes} rows={2} onBlur={(e) => save(r.key, { notes: e.target.value })} /></label>
          {r.items.length > 0 && <details><summary>العناصر ({r.items.length})</summary><pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', direction: 'ltr', fontSize: 12 }}>{JSON.stringify(r.items.slice(0, 50), null, 1)}</pre></details>}
        </details>
      ))}
    </section>
  );
}
