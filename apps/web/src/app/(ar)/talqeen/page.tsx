import type { Metadata } from 'next';
import Talqeen from '@/components/Talqeen';
export const metadata: Metadata = { title: 'التلقين آية بآية' };
export default async function TalqeenPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const n = Number((await searchParams).s); const s = Number.isInteger(n) && n >= 1 && n <= 114 ? n : 1;
  return (<article style={{ maxWidth: 820, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الحفظ</p><h1>التلقين آية بآية</h1><p>يقرأ القارئ الآية ثم يمهلك لتردّدها، ويكررها بالعدد الذي تختاره.</p></header><Talqeen initial={s} /></article>);
}
