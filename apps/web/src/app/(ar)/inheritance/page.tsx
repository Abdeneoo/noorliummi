import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import InheritanceCalc from '@/components/InheritanceCalc';
export const metadata: Metadata = { title: 'حاسبة الميراث (استرشادية)', openGraph: og('/inheritance', 'ar', 'حاسبة الميراث (استرشادية)') };
export default function Inheritance() { return (<article style={{ maxWidth: 820, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الأدوات</p><h1>حاسبة الميراث</h1><p>للحالات البسيطة فقط، مع بيان سبب كل نصيب.</p></header><InheritanceCalc /></article>); }
