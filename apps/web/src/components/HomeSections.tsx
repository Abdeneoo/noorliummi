import Link from 'next/link';
import Icon from './Icon';
import { SERIES } from '@/lib/series';
import { libBook } from '@/lib/library';
import { bookList } from '@/lib/books';
import { FEATURED } from '@/lib/islamhouse';
import { arDigits } from '@/lib/quran';
import { fiqhIndex, IBADAT } from '@/lib/fiqh';
import { sunnahAt, weekIdx } from '@/lib/weekly-sunnah';

/** Home page: one block per section (series, prophets, seerah, books, translated hadith, lessons, kids, extension). */
type Card = { href: string; title: string; sub?: string };
function Block({ id, title, intro, all, icon, cards }: { id: string; title: string; intro: string; all: string; icon: string; cards: Card[] }) {
  return (
    <section className="section reveal home-block" aria-labelledby={`hb-${id}`}>
      <div className="section-head"><h2 id={`hb-${id}`}><Icon name={icon} /> {title}</h2><Link href={all}>عرض الكل</Link></div>
      <p className="note home-intro">{intro}</p>
      <ul className="rail">{cards.map((c) => <li key={c.href}><Link href={c.href}><strong>{c.title}</strong>{c.sub && <small>{c.sub}</small>}</Link></li>)}</ul>
    </section>
  );
}
// Navigation labels for the opening section of each prophet's story in Ibn Kathir's book (section numbers of the pinned edition).
const PROPHETS: [number, string][] = [[1, 'آدم'], [6, 'إدريس'], [7, 'نوح'], [11, 'هود'], [12, 'صالح'], [14, 'إبراهيم'], [17, 'إسماعيل'], [26, 'لوط'], [27, 'شعيب'], [30, 'إسحاق'], [31, 'يعقوب ويوسف'], [32, 'أيوب'], [33, 'ذو الكفل'], [36, 'يونس'], [38, 'موسى وهارون'], [42, 'موسى والخضر'], [49, 'يوشع'], [50, 'الخضر وإلياس'], [52, 'اليسع'], [54, 'داود'], [56, 'سليمان'], [61, 'زكريا ويحيى'], [62, 'عيسى ابن مريم']];
const SEERAH = [4, 5, 9, 11, 12, 15, 25, 33];
const HADEETH: [number, string][] = [[3, 'العقيدة'], [4, 'الفقه وأصوله'], [5, 'الفضائل والآداب'], [1, 'القرآن الكريم وعلومه'], [7, 'السيرة والتاريخ'], [6, 'الدعوة والحسبة'], [2, 'الحديث وعلومه']];
export default async function HomeSections() {
  const sunnah = await sunnahAt(weekIdx());
  const q = libBook('qisas'); const f = libBook('fusul');
  const has = (b: typeof q, i: number) => !!b?.sections.some((s) => s.i === i);
  return (
    <>
      <section className="section reveal home-block" aria-labelledby="hb-sunnah">
        <div className="section-head"><h2 id="hb-sunnah"><Icon name="hadith" /> أحيِ سنة هذا الأسبوع</h2><Link href="/sunnah">كل السنن</Link></div>
        <Link className="card home-promo" href="/sunnah"><strong>{sunnah.title}</strong><span lang="ar">{sunnah.text.length > 200 ? `${sunnah.text.slice(0, 200)}…` : sunnah.text}</span></Link>
      </section>
      <Block id="duas" icon="heart" title="الأدعية" all="/duas" intro="من القرآن الكريم و«حصن المسلم» بتخريجها، مرتبة حسب الحاجة."
        cards={[{ href: '/duas/hal', title: 'ادعُ بما يناسب حالك' }, { href: '/duas/quran', title: 'أدعية القرآن' }, { href: '/duas/audio', title: 'المكتبة الصوتية' }, { href: '/duas#g0', title: 'للمتوفى' }, { href: '/duas#q0', title: 'للوالدين' }, { href: '/duas#g1', title: 'للمريض' }, { href: '/adhkar/35', title: 'الهم والحزن' }, { href: '/adhkar/36', title: 'الكرب' }, { href: '/adhkar/26', title: 'الاستخارة' }, { href: '/adhkar/42', title: 'قضاء الدين' }, { href: '/adhkar/97', title: 'السفر' }, { href: '/duas#hamm', title: 'كل الأدعية' }]} />
      <Block id="fiqh" icon="hadith" title="فقه العبادات" all="/fiqh" intro="الطهارة والصلاة والزكاة والصيام والحج بالدليل، من «الفقه الميسر» بنصه الكامل."
        cards={[{ href: '/books/how-to-pray', title: 'كيف تصلي؟', sub: 'ابن باز' }, ...fiqhIndex().kitabs.filter((k) => IBADAT.includes(k.slug)).map((k) => ({ href: `/fiqh/${k.slug}`, title: k.title, sub: `${arDigits(k.abwab.length)} أبواب` })), { href: '/books/fusul-siyam', title: 'فصول في الصيام', sub: 'ابن عثيمين' }]} />
      <Block id="series" icon="knowledge" title="سلاسل صوتية ومرئية" all="/series" intro="سلاسل الأستاذ أحمد عامر: استمع بالصوت أو شاهد من يوتيوب."
        cards={SERIES.map((s) => ({ href: `/series/${s.slug}`, title: s.title, sub: `${arDigits(s.eps.length)} حلقة` }))} />
      {q && <Block id="qisas" icon="quran" title="قصص الأنبياء" all="/library/qisas" intro="من كتاب «قصص الأنبياء» للحافظ ابن كثير، بنصه الكامل."
        cards={PROPHETS.filter(([i]) => has(q, i)).map(([i, n]) => ({ href: `/library/qisas/${i}`, title: n, sub: 'عليه السلام' }))} />}
      {f && <Block id="seerah" icon="hadith" title="السيرة النبوية" all="/library/fusul" intro="«الفصول في سيرة الرسول ﷺ» لابن كثير، فصلًا فصلًا."
        cards={SEERAH.filter((i) => has(f, i)).map((i) => ({ href: `/library/fusul/${i}`, title: f.sections.find((s) => s.i === i)!.title.replace(/^فصل\s+/, '').replace(/صلى الله عليه وسلم/g, 'ﷺ').replace(/عليه الصلاة والسلام/g, 'ﷺ') }))} />}
      <Block id="books" icon="hadith" title="كتب مختارة" all="/books" intro="كتب الحج والصيام وتعليم الأطفال، بنصها الكامل كما نشرها مصدرها."
        cards={bookList().map((b) => ({ href: `/books/${b.slug}`, title: b.title, sub: b.author }))} />
      <Block id="hadeeth" icon="hadith" title="أحاديث مشروحة ومترجمة" all="/hadeeth" intro="من موسوعة الأحاديث النبوية (HadeethEnc): الحديث ودرجته وشرحه وترجماته."
        cards={HADEETH.map(([id, t]) => ({ href: `/hadeeth/c/${id}`, title: t }))} />
      <Block id="lessons" icon="knowledge" title="الدروس والمحاضرات" all="/lessons" intro="دروس ومحاضرات وكتب مصنّفة حسب الموضوع، من دار الإسلام."
        cards={FEATURED.slice(0, 10).map(([id, t]) => ({ href: `/lessons/c/${id}`, title: t }))} />
      <section className="section reveal home-block" aria-labelledby="hb-kids">
        <div className="section-head"><h2 id="hb-kids"><Icon name="heart" /> ركن الأطفال</h2><Link href="/family">ابدأ</Link></div>
        <Link className="card home-promo" href="/family"><strong>مساحة آمنة لأطفالك بإشراف الوالدين</strong><span>سور قصيرة، ومهام يومية، وأذكار، وتسبيح — يضيف الوالد الطفل من صفحة الأسرة.</span></Link>
      </section>
      <section className="section reveal home-block" aria-labelledby="hb-ext">
        <div className="section-head"><h2 id="hb-ext"><Icon name="bell" /> إضافة المتصفح</h2><Link href="/extension">التفاصيل</Link></div>
        <Link className="card home-promo" href="/extension"><strong>نور لأمي في متصفح كروم</strong><span>المواقيت والأذان، والقبلة، وتذكير الورد والأذكار والصيام والضحى وقيام الليل — بلا أي تتبع.</span></Link>
      </section>
    </>
  );
}
