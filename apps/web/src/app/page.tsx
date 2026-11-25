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
            <h2>الأربعون النووية</h2>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>اثنان وأربعون حديثًا جمعها الإمام النووي (نسخة تجريبية).</p>
            <Link className="btn" href="/hadith/nawawi">اقرأ الأحاديث</Link>
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
