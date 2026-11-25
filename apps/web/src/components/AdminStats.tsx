'use client';
import { useEffect, useState } from 'react';
type S = { daily: { day: string; views: number; visits: number }[]; sections: { section: string; w: number | null; m: number }[]; totals: Record<string, number | string> };
const NAMES: Record<string, string> = { home: 'الرئيسية', quran: 'القرآن', tafsir: 'التفسير', hadith: 'الحديث', adhkar: 'الأذكار', prayer: 'الصلاة', times: 'المواقيت والقبلة', adhan: 'الأذان', mosques: 'المساجد', names: 'أسماء الله', mutashabihat: 'المتشابهات', hifz: 'الحفظ', tasbeeh: 'التسبيح', wird: 'وِردي', khatma: 'الصفحات المُهداة', athar: 'صفحات الأثر', duas: 'الأدعية', topics: 'المواضيع', sakina: 'السكينة', listen: 'الاستماع', calendar: 'التقويم', situations: 'أذكار الموقف', knowledge: 'المعرفة', tools: 'الأدوات', sadaqah: 'الصدقة الجارية', dedication: 'الإهداء', sources: 'المصادر', verify: 'كيف نتحقق', privacy: 'الخصوصية', account: 'الحساب', embed: 'الودجت', other: 'أخرى' };
const name = (s: string) => (s.endsWith('-en') ? `${NAMES[s.slice(0, -3)] ?? s} (EN)` : NAMES[s] ?? s);
const n = (v: unknown) => Number(v ?? 0).toLocaleString('ar-EG');
export default function AdminStats() {
  const [s, setS] = useState<S | null>(null);
  useEffect(() => { fetch('/api/admin/stats', { cache: 'no-store' }).then((r) => r.json()).then(setS).catch(() => setS({ daily: [], sections: [], totals: {} })); }, []);
  if (!s) return <p className="note">جارٍ التحميل…</p>;
  const max = Math.max(1, ...s.daily.map((d) => d.views)); const top = Math.max(1, ...s.sections.map((x) => x.m)); const t = s.totals;
  const sum = (k: 'views' | 'visits', days: number) => s.daily.slice(-days).reduce((a, d) => a + d[k], 0);
  return (
    <>
      <section className="card"><h2 style={{ marginTop: 0 }}>نظرة عامة</h2>
        <ul className="stat-grid">
          <li><strong>{n(sum('visits', 1))}</strong><span>زيارات اليوم</span></li><li><strong>{n(sum('visits', 7))}</strong><span>زيارات ٧ أيام</span></li><li><strong>{n(sum('visits', 30))}</strong><span>زيارات ٣٠ يومًا</span></li>
          <li><strong>{n(sum('views', 30))}</strong><span>صفحات مفتوحة (٣٠ يومًا)</span></li><li><strong>{n(t.users)}</strong><span>حسابات (+{n(t.users_week)} هذا الأسبوع)</span></li>
          <li><strong>{n(t.athar)}</strong><span>صفحات أثر ({n(t.athar_listed)} في الدليل)</span></li><li><strong>{n(t.khatmas)}</strong><span>ختمات جماعية ({n(t.juz_done)} جزءًا قُرئ)</span></li>
          <li><strong>{n(t.dhikr_pages)}</strong><span>صفحات ذكر/دعاء ({n(t.group_count)} مرة)</span></li><li><strong>{n(t.lantern)}</strong><span>إضاءات قنديل النور</span></li>
        </ul>
        <p className="note">«الزيارة» = جلسة متصفح. تُعدّ فتحات الصفحات لكل قسم فقط، بلا عنوان IP ولا ملفات تتبع ولا هوية الزائر، فلا يوجد عدد «زوار فريدين».</p></section>
      <section className="card"><h2 style={{ marginTop: 0 }}>آخر ٣٠ يومًا</h2>
        {s.daily.length === 0 ? <p className="note">لا بيانات بعد.</p> : <div className="stat-bars" role="img" aria-label="الصفحات المفتوحة يوميًا">{s.daily.map((d) => <span key={d.day} title={`${d.day}: ${d.views} صفحة، ${d.visits} زيارة`} style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }} />)}</div>}</section>
      <section className="card"><h2 style={{ marginTop: 0 }}>الأقسام الأكثر استخدامًا</h2>
        <table className="admin-table"><thead><tr><th>القسم</th><th>٧ أيام</th><th>٣٠ يومًا</th><th /></tr></thead>
          <tbody>{s.sections.map((x) => <tr key={x.section}><td>{name(x.section)}</td><td>{n(x.w)}</td><td>{n(x.m)}</td><td style={{ width: '40%' }}><span className="stat-row" style={{ width: `${(x.m / top) * 100}%` }} /></td></tr>)}</tbody></table></section>
    </>
  );
}
