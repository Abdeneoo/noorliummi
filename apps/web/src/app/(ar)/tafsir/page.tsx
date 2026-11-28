import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import SurahIndex from '@/components/SurahIndex';
import { SURAHS } from '@/lib/quran';
export const metadata: Metadata = { title: 'التفسير', openGraph: og('/tafsir', 'ar', 'التفسير') };
export default function TafsirIndex() {
  return (<><div className="hero" style={{ paddingBottom: 20 }}><h1>تفسير الجلالين</h1><p>اختر السورة لقراءة تفسير آياتها. ويمكنك أيضًا الضغط على رقم أي آية داخل المصحف لتنتقل إلى تفسيرها.</p></div><SurahIndex surahs={SURAHS} base="/tafsir" /></>);
}
