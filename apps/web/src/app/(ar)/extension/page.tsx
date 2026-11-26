import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'إضافة كروم — ذكّرني' };
export default function Extension() {
  return (
    <article style={{ maxWidth: 760, margin: '0 auto' }}>
      <header className="page-head"><p className="eyebrow"><Link href="/tools">الأدوات</Link></p><h1>إضافة كروم «ذكّرني»</h1><p>تذكير بالصلاة والأذان والورد والأذكار والصيام وأنت على الحاسوب.</p></header>
      <section className="card"><h2 style={{ marginTop: 0 }}>ماذا تفعل</h2>
        <ul>
          <li>مواقيت الصلاة لمدينتك والعدّ التنازلي للصلاة القادمة (محرك الموقع نفسه، على جهازك).</li>
          <li>الأذان عند كل صلاة تختارها، وتنبيه قبلها بالمدة التي تحددها؛ وأذان خاص للفجر إن شئت.</li>
          <li>تذكير بوردك اليومي حتى تكمل عدد الصفحات الذي حددته.</li>
          <li>تذكير دوري بالاستغفار والتسبيح والصلاة على النبي ﷺ — نصوص «حصن المسلم» بتخريجها.</li>
          <li>تذكير مساء اليوم السابق بصيام الإثنين والخميس والأيام البيض، دون أيام العيد والتشريق ورمضان؛ وتذكير الكهف يوم الجمعة.</li>
          <li>وضع النوم: لا تذكيرات بين الوقتين اللذين تحددهما، وزر لكتم ساعة.</li>
          <li>آية اليوم، والمسبحة، وتثبيت صفحة أثر.</li>
        </ul>
        <p className="note">بلا تتبع ولا جمع بيانات: الإعدادات على جهازك فقط. الطلبات الوحيدة إلى موقعنا: قائمة الأذان وملفه عند التشغيل وآية اليوم. الأذان من تسجيلات يستضيفها الموقع بترخيص موثّق (انظر <Link href="/sources">المصادر</Link>).</p></section>
      <section className="card"><h2 style={{ marginTop: 0 }}>التثبيت (نسخة تجريبية)</h2>
        <ol><li><a className="btn" href="/extension/noorliummi-extension.zip" download>نزّل الإضافة (zip)</a> وفكّ ضغطها.</li><li>افتح <code dir="ltr">chrome://extensions</code> وفعّل «وضع المطوّر».</li><li>اضغط «تحميل إضافة غير مُعبّأة» واختر المجلد.</li></ol>
        <p className="note">بعد اعتماد الإطلاق ستُنشر في متجر Chrome الإلكتروني ويُوضع رابطها هنا.</p></section>
    </article>
  );
}
