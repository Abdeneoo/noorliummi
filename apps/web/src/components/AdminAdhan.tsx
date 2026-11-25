'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SOUNDS, fmtDur, loadCatalogue, type CatalogueItem } from '@/lib/adhan';

type Decision = { item_id: string; status: string; note: string; updated_at: string };
const H = { 'content-type': 'application/json', 'x-noor-admin': '1' };
const ST: Record<string, string> = { published: 'مستضاف على الموقع', stream: 'بث من المصدر', approved: 'مقبول (بانتظار الرفع)', permission_requested: 'طُلب الإذن', pending: 'معلّق للمراجعة', rejected: 'مرفوض' };
const REASON: Record<string, string> = { no_licence: 'المستودع بلا ترخيص', third_party_origin: 'منقول من موقع آخر', personal_use_only: 'للاستخدام الشخصي فقط', duplicate: 'ملف مكرر', not_an_adhan_recording: 'ليس تسجيل أذان (عمل موسيقي)', stream_only: 'يُبث من مصدره ولا يُستضاف', islamweb_noncommercial_attribution: 'إسلام ويب: غير تجاري مع ذكر المصدر', needs_listening_first: 'أقصر من دقيقة: يُسمع أولًا', needs_review: 'قد يكون ناقصًا أو نسبته مشكوك فيها' };
const FLAG: Record<string, string> = { needs_listening: 'يحتاج استماعًا', attribution_unverified: 'نسبة المؤذن غير متحقق منها', possibly_incomplete: 'قد يكون ناقصًا', attribution_doubtful: 'نسبة مشكوك فيها', near_duplicate_of: 'نسخة أخرى من', duplicate_of: 'مكرر من', link_failed: 'رابط البث متعطل' };

/** Adhan review report: accepted / pending / rejected, with reasons, and the moderator's decisions. */
export default function AdminAdhan() {
  const [cat, setCat] = useState<CatalogueItem[]>([]);
  const [dec, setDec] = useState<Record<string, Decision>>({});
  const [links, setLinks] = useState<{ checked_at: string; total: number; failed: Record<string, string> } | null>(null);
  const [filter, setFilter] = useState('all'); const [q, setQ] = useState(''); const [err, setErr] = useState('');
  const load = useCallback(async () => {
    setCat(await loadCatalogue());
    const r = await fetch('/api/admin/adhan', { cache: 'no-store' });
    if (r.ok) { const j = await r.json(); setLinks(j.links ?? null); setDec(Object.fromEntries((j.decisions as Decision[]).map((d) => [d.item_id, d]))); } else setErr('تعذّر تحميل القرارات.');
  }, []);
  useEffect(() => { void load(); }, [load]);
  const statusOf = (c: CatalogueItem) => dec[c.id]?.status ?? c.s;
  const rows = useMemo(() => [
    ...SOUNDS.map((s) => ({ id: s.id, title: s.title, by: s.by, d: s.duration, st: 'published', why: `${s.license} — ${s.source}`, flags: [] as string[], c: 'الموقع' })),
    ...cat.filter((c) => c.s !== 'hosted').map((c) => ({ id: c.id, title: c.t.ar ?? c.t.en, by: [c.m?.en, c.co?.ar].filter(Boolean).join(' · '), d: c.d, st: statusOf(c), why: c.r.map((x) => REASON[x] ?? x).join('، ') + (c.o ? ` (${c.o})` : ''), flags: [...c.fl, ...(links?.failed[c.id] ? [`link_failed:${links.failed[c.id]}`] : [])], c: c.c === 'kiwifu' ? 'Kiwifu' : 'AlAdhan' })),
  ], [cat, dec, links]);
  const counts = rows.reduce<Record<string, number>>((a, r) => { a[r.st] = (a[r.st] ?? 0) + 1; return a; }, {});
  const shown = rows.filter((r) => (filter === 'all' || r.st === filter) && (!q || `${r.title} ${r.by}`.toLowerCase().includes(q.toLowerCase())));
  const save = async (id: string, status: string, note: string) => {
    setErr('');
    const r = await fetch('/api/admin/adhan', { method: 'POST', headers: H, body: JSON.stringify({ id, status, note }) });
    if (!r.ok) { setErr('تعذّر الحفظ.'); return; }
    void load();
  };
  return (
    <div className="grid">
      <section className="card">
        <h2>تقرير أصوات الأذان</h2>
        <p className="meta" style={{ justifyContent: 'flex-start' }}>{Object.entries(ST).map(([k, v]) => <span key={k}>{v}: {counts[k] ?? 0}</span>)}</p>
        <p className="note">{links ? `فحص روابط البث (${links.checked_at.slice(0, 10)}): ${links.total - Object.keys(links.failed).length} من ${links.total} تعمل${Object.keys(links.failed).length ? `، والمتعطلة: ${Object.keys(links.failed).join('، ')}` : ''}.` : 'لم يُجرَ فحص روابط البث الأسبوعي بعد.'}</p>
        <p className="note">لا يُنشر تسجيل إلا بعد توثيق الإذن أو الترخيص في <code>database/sources/adhan/registry.json</code> والاستماع إليه. قرار «مقبول» هنا يسجّل المراجعة فقط ولا يرفع ملفًا.</p>
        <div className="row">
          <div className="field"><label htmlFor="af">الحالة</label><select id="af" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">الكل</option>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="field"><label htmlFor="aq">بحث</label><input id="aq" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        {err && <p className="note" role="alert">{err}</p>}
      </section>
      <section className="card" style={{ overflowX: 'auto' }}>
        <table className="month" style={{ textAlign: 'start', fontFamily: 'var(--font-ui)' }}>
          <thead><tr><th>التسجيل</th><th>المدة</th><th>المصدر</th><th>الحالة</th><th>السبب والملاحظات</th><th>قرار</th></tr></thead>
          <tbody>{shown.map((r) => (
            <tr key={r.id}>
              <td style={{ textAlign: 'start' }}><strong>{r.title}</strong><br /><small>{r.by}</small></td>
              <td>{fmtDur(r.d)}</td><td>{r.c}</td><td>{ST[r.st] ?? r.st}</td>
              <td style={{ textAlign: 'start', fontSize: '.8rem' }}>{r.why}{r.flags.length > 0 && <><br />{r.flags.map((f) => { const [k, v] = f.split(':'); return FLAG[k] ? `${FLAG[k]}${v ? ` ${v}` : ''}` : f; }).join(' · ')}</>}{dec[r.id]?.note && <><br />ملاحظة: {dec[r.id].note}</>}</td>
              <td>{r.st !== 'published' && (
                <select aria-label={`قرار: ${r.title}`} value="" onChange={(e) => { const s = e.target.value; if (!s) return; const n = prompt('ملاحظة (مثل: تاريخ طلب الإذن ومن طُلب)', dec[r.id]?.note ?? '') ?? ''; void save(r.id, s, n); }}>
                  <option value="">تغيير…</option><option value="permission_requested">طُلب الإذن</option><option value="approved">مقبول</option><option value="rejected">مرفوض</option><option value="pending">معلّق</option>
                </select>)}</td>
            </tr>))}</tbody>
        </table>
      </section>
    </div>
  );
}
