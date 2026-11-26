import type { Metadata } from 'next';
import Link from 'next/link';
import { ADHKAR } from '@/lib/adhkar';
import { QD, TAG } from '@/lib/duas';
import DuaNav from '@/components/DuaNav';
export const metadata: Metadata = { title: 'ادعُ بما يناسب حالك', description: 'الأدعية المأثورة مرتبة حسب حالك: فقد الوالدين، الحزن، المرض، الرزق، السفر، الاستخارة وغيرها.' };
/** Each situation points only to existing sourced texts: Hisn al-Muslim chapters and topic lists of al-Qahtani's book. */
const HAL: { t: string; hisn: number[]; tags: string[]; extra?: [string, string][] }[] = [
  { t: 'فقد الوالدين', hisn: [56, 57, 60, 61], tags: ['walidayn'], extra: [['/sadaqah/parents', 'كيف أبرّ والديّ بعد وفاتهما؟'], ['/duas#q0', 'أدعية للوالدين من القرآن']] },
  { t: 'فقد عزيز والمصيبة', hisn: [54, 58], tags: [] },
  { t: 'الدعاء للمتوفى', hisn: [55, 56, 57, 59, 60, 61], tags: ['rahma', 'maghfira'], extra: [['/athar', 'صفحة أثر باسمه']] },
  { t: 'الحزن والهم', hisn: [35], tags: ['karb'] },
  { t: 'الكرب والابتلاء', hisn: [36, 47, 44, 84], tags: [] },
  { t: 'المرض والشفاء', hisn: [50, 52, 125], tags: ['afiya'], extra: [['/ruqyah', 'الرقية الشرعية']] },
  { t: 'الخوف والقلق', hisn: [127, 31, 37, 38], tags: [] },
  { t: 'الأرق والنوم', hisn: [29, 30, 31], tags: [] },
  { t: 'ضيق الرزق وقضاء الدين', hisn: [42], tags: ['rizq'] },
  { t: 'الزواج والأسرة والذرية', hisn: [80, 81, 82], tags: ['dhurriyya'] },
  { t: 'طلب العلم والدراسة', hisn: [], tags: ['ilm'] },
  { t: 'السفر', hisn: [96, 97, 98, 101, 102, 104, 105], tags: [] },
  { t: 'الاستخارة', hisn: [26], tags: [] },
  { t: 'التوبة والاستغفار', hisn: [130], tags: ['tawba', 'maghfira'] },
  { t: 'الوقاية والحفظ من الشر', hisn: [129, 49, 126, 46], tags: ['isti3adha'] },
  { t: 'الشكر والحمد والفرح', hisn: [123, 124, 131], tags: [] },
  { t: 'الصبر والثبات والهداية', hisn: [41], tags: ['sabr', 'huda'] },
  { t: 'خير الدنيا والآخرة', hisn: [], tags: ['janna', 'nar'] },
];
export default function Page() {
  const n = (tag: string) => QD.duas.filter((d) => d.tags.includes(tag)).length;
  return (
    <article style={{ maxWidth: 900, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/duas">الأدعية</Link></p><h1>ادعُ بما يناسب حالك</h1><p>اختر حالك، فنعرض لك ما ورد من الأدعية في «حصن المسلم» و«الدعاء من الكتاب والسنة» بتخريجها.</p></header>
      <DuaNav />
      <p className="review-banner">لا نؤلف أدعية مخصصة، ولا نَعِد بنتيجة معينة لدعاء. حالات مثل الامتحانات أو طلب العمل أو الحمل لا يُفرد لها هنا دعاء لم نجده في المصادر؛ ادعُ فيها بما شئت من الأدعية الجامعة.</p>
      <ol className="fiqh-abwab">{HAL.map((h) => (
        <li key={h.t} className="card"><strong>{h.t}</strong>
          <ul>
            {h.hisn.map((id) => ADHKAR.find((c) => c.id === id)).filter(Boolean).map((c) => <li key={c!.id}><Link href={`/adhkar/${c!.id}`} lang="ar">{c!.title}</Link> <small className="note">حصن المسلم</small></li>)}
            {h.tags.filter((t) => n(t) > 0).map((t) => <li key={t}><Link href={`/duas/c/${t}`}>{TAG[t]}</Link> <small className="note">{n(t).toLocaleString('ar-EG')} دعاءً</small></li>)}
            {(h.extra ?? []).map(([href, t]) => <li key={href}><Link href={href}>{t}</Link></li>)}
          </ul></li>))}</ol>
    </article>
  );
}
