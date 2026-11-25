import type { Metadata } from 'next';
import { IntlSurah } from '@/components/IntlPages';
import { INTL } from '@/lib/intl';
import { SURAHS } from '@/lib/quran';
export const dynamicParams = false;
export function generateStaticParams() { return SURAHS.map((s) => ({ n: String(s.index) })); }
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> { const s = SURAHS[Number((await params).n) - 1]; return { title: s ? `${INTL.ur.surah} ${s.tname}` : INTL.ur.quran }; }
export default async function Page({ params }: { params: Promise<{ n: string }> }) { return <IntlSurah lang="ur" n={Number((await params).n)} />; }
