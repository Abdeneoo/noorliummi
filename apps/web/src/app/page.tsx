import Link from 'next/link';
import PrayerCard from '@/components/PrayerCard';

export default function Home() {
  return (
    <>
      <div className="hero">
        <h1>نورٌ لا ينطفئ، وأثرٌ لا ينقطع</h1>
        <p>منصة إسلامية مجانية، صدقة جارية.</p>
      </div>
      <div className="grid two" style={{ marginTop: 24 }}>
        <PrayerCard />
        <div className="grid">
          <section className="card">
            <h2>القرآن الكريم</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>المصحف كاملًا بالرسم العثماني، ١١٤ سورة.</p>
            <Link className="btn" href="/quran">افتح المصحف</Link>
          </section>
          <section className="card">
            <h2>الحديث الشريف</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>الكتب الستة والموطأ والأربعينات، مع بحث في النص (نسخة تجريبية).</p>
            <Link className="btn" href="/hadith">افتح كتب الحديث</Link>
          </section>
          <section className="card">
            <h2>صفحة أثر</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>اصنع صفحة تُهديها لمن تحب، تختار فيها سورًا وأذكارًا وتكتب دعاءك، وتشارك رابطها.</p>
            <Link className="btn" href="/athar">اصنع صفحة</Link>
          </section>
          <section className="card">
            <h2>أسماء الله الحسنى</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>الأسماء التسعة والتسعون مع الآيات الدالة عليها.</p>
            <Link className="btn" href="/names">اعرض الأسماء</Link>
          </section>
          <section className="card">
            <h2>الحفظ والمراجعة</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>اختر ما تحفظه، ويذكّرك الموقع بكل آية في وقت مراجعتها. بياناتك على جهازك فقط.</p>
            <Link className="btn" href="/hifz">ابدأ الحفظ</Link>
          </section>
          <section className="card dedication">
            <h2>إهداء</h2>
            <p>إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
            <Link href="/dedication" style={{ textDecoration: 'underline' }}>اقرأ الإهداء كاملًا</Link>
          </section>
        </div>
      </div>
    </>
  );
}
