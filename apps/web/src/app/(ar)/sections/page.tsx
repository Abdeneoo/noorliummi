import type { Metadata } from 'next';
import SectionsGrid from '@/components/SectionsGrid';
export const metadata: Metadata = { title: 'كل الأقسام', description: 'كل أقسام نور لأمي في صفحة واحدة: العبادة اليومية، والعمرة والحج ورمضان، والاستماع، والعلم، والأسرة، والصدقة الجارية، والأدوات.' };
export default function Sections() {
  return (
    <article>
      <header className="page-head"><h1>كل الأقسام</h1><p>اختر ما تحتاجه.</p></header>
      <SectionsGrid />
    </article>
  );
}
