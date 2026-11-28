import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import ReciterIndex from '@/components/ReciterIndex';
import { PEOPLE, TV_DUA_CATS, TV_ITEMS, isPriority } from '@/lib/people';
export const metadata: Metadata = { title: 'Reciters and scholars', description: 'One page per reciter: the duas, adhkar, ruqyah and recitations in their voice on Noor Li Ummi, with the source of every recording.', alternates: { languages: { ar: '/reciters' } }, openGraph: og('/en/reciters', 'en', 'Reciters and scholars', 'One page per reciter: the duas, adhkar, ruqyah and recitations in their voice on Noor Li Ummi, with the source of every recording.') };
export default function RecitersEn() {
  const rows = PEOPLE.map((p) => { const tv = TV_ITEMS.filter((x) => x.scholar_id != null && p.tv.includes(x.scholar_id));
    return { slug: p.slug, ar: p.ar, en: p.en, dua: tv.filter((x) => TV_DUA_CATS.includes(x.cat)).length, clips: tv.filter((x) => !TV_DUA_CATS.includes(x.cat)).length, ih: p.ih.length, quran: p.quran.length > 0 || p.ea.length > 0, star: isPriority(p) }; }).sort((a, b) => Number(b.star) - Number(a.star));
  return (<article style={{ maxWidth: 960, margin: '0 auto' }}><header className="page-head"><h1>Reciters and scholars</h1>
    <p>Each reciter on one page, gathering what the site has in their voice: full Quran recitations (Islamic Network, EveryAyah), duas, adhkar, ruqyah and recitation clips (TVQuran’s official player) and audio from IslamHouse. Names without an English form are shown in Arabic.</p></header>
    <ReciterIndex rows={rows} lang="en" /></article>);
}
