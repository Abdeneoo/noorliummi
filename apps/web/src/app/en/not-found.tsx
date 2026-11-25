import Link from 'next/link';
export default function NotFound() {
  return (<div className="hero"><h1>Page not found</h1><p style={{ marginBottom: 18 }}>The link may have changed or been mistyped.</p><Link className="btn" href="/en">Back to home</Link></div>);
}
