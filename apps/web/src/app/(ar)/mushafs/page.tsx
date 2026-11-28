import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Link from 'next/link';
import AlbumIndex from '@/components/AlbumIndex';
import { albums, isHaramain, readers } from '@/lib/ih-quran';
export const metadata: Metadata = { title: 'مصاحف مرتلة من دار الإسلام', description: '136 مصحفًا مرتلًا لكبار القراء ومصاحف الحرمين، تُبث من IslamHouse مع اسم القارئ والجهة المنتجة.', openGraph: og('/mushafs', 'ar', 'مصاحف مرتلة من دار الإسلام', '136 مصحفًا مرتلًا لكبار القراء ومصاحف الحرمين، تُبث من IslamHouse مع اسم القارئ والجهة المنتجة.') };
export default function Mushafs() {
  const rows = albums().map((a) => ({ id: a.id, title: a.title, who: readers(a).join('، '), n: a.files.length, h: isHaramain(a) })).sort((a, b) => Number(b.h) - Number(a.h));
  return (<article style={{ maxWidth: 960, margin: '0 auto' }}><header className="page-head"><p className="eyebrow"><Link href="/quran">القرآن</Link></p><h1>مصاحف مرتلة من دار الإسلام</h1>
    <p>{rows.length.toLocaleString('ar-EG')} مصحفًا، منها مصاحف الحرمين والتراويح وروايات غير حفص. تُبث من خوادم IslamHouse كما هي، في المشغّل الموحد (يستمر في الخلفية وأثناء التنقل)، ويمكن حفظها على جهازك للاستماع دون إنترنت.</p></header>
    <AlbumIndex rows={rows} /></article>);
}
