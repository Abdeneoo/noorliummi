import type { Metadata } from 'next';
import Link from 'next/link';
import { PROPHETS } from '@/lib/prophets';
import { arDigits } from '@/lib/quran';
export const metadata: Metadata = { title: 'ذكر الأنبياء في القرآن', description: 'الآيات التي ذُكر فيها كل نبي باسمه في القرآن الكريم، بترتيب المصحف.' };
export default function Prophets() {
  return (
    <article style={{ maxWidth: 820, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow">القرآن الكريم</p><h1>ذكر الأنبياء في القرآن</h1><p>لكل نبي: الآيات التي ورد فيها اسمه، بترتيب المصحف، مع التفسير والاستماع.</p></header>
      <p className="note">هذه ليست قصصًا مكتوبة: لا نؤلف سردًا ولا نضيف تفاصيل. تُعرض الآيات كما هي ببحث لفظي عن الاسم، وعدد مرات وروده مطابق للمعروف. قصة النبي قد ترد في آيات لا تذكر اسمه فلا تظهر هنا. أسماء صالح ويحيى وذي الكفل عليهم السلام تشتبه بكلمات أخرى، فبُحث عنها في مواضعها المعروفة فقط.</p>
      <ul className="surah-list">{PROPHETS.map((p, i) => <li key={p.id}><Link href={`/prophets/${p.id}`}><span className="num">{arDigits(i + 1)}</span><span><span className="nm">{p.name}{p.id === 'muhammad' ? '' : ' عليه السلام'}</span><span className="sub">ورد اسمه {arDigits(p.count)} مرة</span></span></Link></li>)}</ul>
    </article>
  );
}
