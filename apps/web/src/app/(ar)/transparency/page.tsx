import type { Metadata } from 'next';
import Link from 'next/link';
import { BOOKS } from '@/lib/hadith';
import { ADHKAR } from '@/lib/adhkar';
import { LIBRARY } from '@/lib/library';
import { GROUPS } from '@/lib/sources';
import { db } from '@/lib/db';
import { REVIEW_SECTIONS, REVIEW_STATES, type ReviewRow } from '@/lib/review';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'تقرير الشفافية' };
const n = (v: number) => v.toLocaleString('ar-EG');
export default async function Transparency() {
  let rep: Record<string, number> | null = null;
  try { const r = await db().query<{ status: string; n: number }>('SELECT status, count(*)::int AS n FROM text_reports GROUP BY status'); rep = Object.fromEntries(r.rows.map((x) => [x.status, x.n])); } catch { /* db unavailable */ }
  let review: Record<string, ReviewRow> = {};
  try { const r = await db().query<ReviewRow>("SELECT section, status, reviewer, note, to_char(reviewed_at, 'YYYY-MM-DD') AS reviewed_at FROM review_status"); review = Object.fromEntries(r.rows.map((x) => [x.section, x])); } catch { /* db unavailable */ }
  const hadith = BOOKS.reduce((t, b) => t + b.count, 0) + 42; const adhkar = ADHKAR.reduce((t, c) => t + c.count, 0);
  return (
    <article className="reader" style={{ maxWidth: 780 }}>
      <header><p className="eyebrow">الثقة والشفافية</p><h1>تقرير الشفافية</h1></header>
      <p>أرقام حيّة عن المحتوى والمراجعة فقط. لا أرقام عن العبادات ولا عن المستخدمين.</p>
      <h2>المحتوى</h2>
      <ul className="stat-grid">
        <li><strong>{n(6236)}</strong><span>آية في ١١٤ سورة (Tanzil، مطابَقة ببصمة رقمية)</span></li>
        <li><strong>{n(hadith)}</strong><span>حديثًا في {n(BOOKS.length + 1)} كتابًا</span></li>
        <li><strong>{n(adhkar)}</strong><span>ذكرًا في {n(ADHKAR.length)} بابًا من حصن المسلم</span></li>
        <li><strong>{n(LIBRARY.length)}</strong><span>كتب كاملة في المكتبة</span></li>
        <li><strong>{n(GROUPS.reduce((t, g) => t + g.items.length, 0))}</strong><span>مصدرًا موثقًا بترخيصه</span></li>
      </ul>
      <h2>حالة المراجعة الشرعية لكل قسم</h2>
      <p>المراجعة الشرعية يقوم بها إنسان متخصص فقط؛ الفحوص الآلية والذكاء الاصطناعي لا تُعدّ مراجعة. ما لم يكتب هنا اسم مراجع وتاريخ فالقسم «نسخة تجريبية».</p>
      <div style={{ overflowX: 'auto' }}><table className="admin-table"><thead><tr><th>القسم</th><th>الحالة</th><th>المراجع والتاريخ</th></tr></thead>
        <tbody>{REVIEW_SECTIONS.map((x) => { const r = review[x.id]; const st = r?.status ?? 'sourced'; return <tr key={x.id}><td>{x.ar}</td><td>{REVIEW_STATES[st]}{x.sensitive && st !== 'reviewed' ? ' — نتائج استرشادية غير معتمدة' : ''}</td><td>{st === 'reviewed' ? `${r.reviewer} — ${r.reviewed_at}` : '—'}</td></tr>; })}</tbody></table></div>
      <p className="note">الفحوص الآلية (مطابقة نص القرآن، أعداد الآيات، سلامة حروف الكتب، مواقيت الصلاة، مسائل الميراث المعروفة) تعمل مع كل تحديث؛ تفاصيلها في <Link href="/verify">كيف نتحقق</Link>.</p>
      <h2>بلاغات الأخطاء</h2>
      {rep ? <ul className="stat-grid"><li><strong>{n(rep.open ?? 0)}</strong><span>بلاغات مفتوحة</span></li><li><strong>{n(rep.fixed ?? 0)}</strong><span>أخطاء صُحّحت ببلاغات الزوار</span></li><li><strong>{n(rep.dismissed ?? 0)}</strong><span>بلاغات لم يثبت فيها خطأ</span></li></ul> : <p className="note">تعذّر تحميل الأرقام الآن.</p>}
      <p className="note"><Link href="/report">بلّغ عن خطأ</Link> · <Link href="/sources">المصادر والتراخيص</Link></p>
    </article>
  );
}
