import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import SurahIndex from '@/components/SurahIndex';
import QuranJump from '@/components/QuranJump';
import { SURAHS } from '@/lib/quran';
export const metadata: Metadata = { title: 'القرآن الكريم', openGraph: og('/quran', 'ar', 'القرآن الكريم') };
export default function QuranIndex() {
  return (<><div className="hero" style={{ paddingBottom: 20 }}><h1>القرآن الكريم</h1><p><a href="/hifz">الحفظ والمراجعة</a> · <a href="/tafsir">التفسير</a></p></div><QuranJump /><SurahIndex surahs={SURAHS} /></>);
}
