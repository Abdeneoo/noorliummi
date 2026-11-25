import type { Metadata } from 'next';
import ZakatCalc from '@/components/ZakatCalc';
export const metadata: Metadata = { title: 'حاسبة الزكاة (استرشادية)' };
export default function Zakat() { return (<article style={{ maxWidth: 760, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الأدوات</p><h1>حاسبة الزكاة</h1><p>نقود وذهب وفضة وعروض تجارة.</p></header><ZakatCalc /></article>); }
