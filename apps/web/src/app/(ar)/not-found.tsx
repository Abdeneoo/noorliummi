import Link from 'next/link';
export default function NotFound() {
  return (<div className="hero"><h1>الصفحة غير موجودة</h1><p style={{ marginBottom: 18 }}>ربما تغيّر الرابط أو كُتب خطأً.</p><Link className="btn" href="/">العودة إلى الرئيسية</Link></div>);
}
