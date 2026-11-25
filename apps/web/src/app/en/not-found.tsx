import Link from 'next/link';
import Report404 from '@/components/Report404';
export default function NotFound() {
  return (<div className="hero"><Report404 /><h1>Page not found</h1><p style={{ marginBottom: 18 }}>The link may have changed or been mistyped.</p><Link className="btn" href="/en">Back to home</Link></div>);
}
