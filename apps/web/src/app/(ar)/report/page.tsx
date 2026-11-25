import type { Metadata } from 'next';
import ReportForm from '@/components/ReportForm';
export const metadata: Metadata = { title: 'بلّغ عن خطأ', robots: { index: false } };
export default function Report() {
  return (<article style={{ maxWidth: 680, margin: '0 auto' }}><header className="page-head"><p className="eyebrow">الثقة والشفافية</p><h1>بلّغ عن خطأ</h1><p>وجدت خطأ في آية أو حديث أو ذكر أو ترجمة أو ميقات؟ أخبرنا بالموضع والصواب ومصدره.</p></header><ReportForm /></article>);
}
