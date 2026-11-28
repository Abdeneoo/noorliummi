import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import BrandLogo from '@/components/BrandLogo';
export const metadata: Metadata = { title: 'الإهداء', openGraph: og('/dedication', 'ar', 'الإهداء') };
// Official dedication text from the brand guide (docs/BRAND_GUIDELINES.docx).
export default function Dedication() {
  return (
    <article className="memorial">
      <BrandLogo alt="شعار نور لأمي" priority />
      <div className="card dedication">
        <h1>إهداء</h1>
        <p>إلى أمي الغالية <strong>أمل مجدي منير</strong>، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
        <p>أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عنها.</p>
        <p>نسألكم الدعاء لها بالرحمة والمغفرة.</p>
        <p className="dua">اللهم اغفر لها وارحمها، وآنس وحشتها، ونوّر قبرها، واجعلها من أهل الفردوس الأعلى، واجمعنا بها في جنتك لقاءً لا فراق بعده.</p>
      </div>
    </article>
  );
}
