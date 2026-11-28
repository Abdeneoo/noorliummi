import Link from 'next/link';
import Icon from './Icon';
import AtharDemo from './AtharDemo';

/** Home spotlights: «صفحة أثر» with its animated walkthrough, and the audio lessons. */
export default function Spotlight() {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="spot">
      <section className="spot-card reveal" aria-labelledby="sp-athar">
        <div className="spot-head">
          <div><span className="spot-badge">صدقة جارية</span><h2 id="sp-athar">صفحة أثر لمن تحب</h2>
            <p>صفحة باسم والدك أو والدتك أو من فقدت، فيها سور وأذكار ودعاء يُقرأ ويُسمع، ترسلها لأهلك فيدعون له. شاهد كيف تُصنع في أقل من دقيقة.</p></div>
          <div className="row"><Link className="btn" href="/athar#new">اصنع صفحة الآن</Link><Link className="btn ghost" href="/athar">صفحات الأثر</Link></div>
        </div>
        <AtharDemo />
      </section>
      <section className="spot-card spot-audio reveal" aria-labelledby="sp-audio">
        <div className="spot-head"><div><span className="spot-badge">استمع</span><h2 id="sp-audio">الدروس والتلاوات الصوتية</h2>
          <p>دروس ومحاضرات وسلاسل للمشايخ، وتلاوات القرّاء والمصاحف كاملة. تعمل في الخلفية والشاشة مطفأة، وتُحفظ للاستماع دون إنترنت.</p></div></div>
        <div className="spot-wave" aria-hidden="true">{bars.map((i) => <i key={i} style={{ animationDelay: `${-((i * 137) % 1400)}ms` }} />)}</div>
        <ul className="spot-links">
          <li><Link href="/lessons"><Icon name="headphones" /><span><strong>الدروس والمحاضرات</strong><small>مصنّفة حسب الموضوع</small></span></Link></li>
          <li><Link href="/series"><Icon name="play" /><span><strong>السلاسل</strong><small>السيرة والقصص والتدبر</small></span></Link></li>
          <li><Link href="/ramadan/majalis"><Icon name="moon" /><span><strong>مجالس رمضان</strong><small>مجلس لكل يوم</small></span></Link></li>
          <li><Link href="/reciters"><Icon name="headphones" /><span><strong>القرّاء</strong><small>تلاوات وأدعية بأصواتهم</small></span></Link></li>
          <li><Link href="/mushafs"><Icon name="quran" /><span><strong>المصاحف المرتلة</strong><small>القرآن كاملًا</small></span></Link></li>
          <li><Link href="/duas/audio"><Icon name="heart" /><span><strong>الأدعية والرقية صوتًا</strong><small>حصن المسلم مسموعًا</small></span></Link></li>
        </ul>
      </section>
    </div>
  );
}
