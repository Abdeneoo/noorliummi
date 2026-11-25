import type { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
export const metadata: Metadata = { title: 'Dedication' };
// English rendering of the official Arabic dedication (brand guide); the Arabic is shown first and is the original.
export default function Dedication() {
  return (
    <article className="memorial">
      <BrandLogo alt="Noor Li Ummi logo" priority />
      <div className="card dedication">
        <h1>Dedication</h1>
        <p lang="ar" dir="rtl">إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي. أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عنها. نسألكم الدعاء لها بالرحمة والمغفرة.</p>
        <p>To my beloved mother, who has left my sight but never my heart. This project was made seeking the Face of Allah, in the hope that it will be an ongoing charity on her behalf. Please remember her in your prayers, asking Allah for His mercy and forgiveness for her.</p>
      </div>
    </article>
  );
}
