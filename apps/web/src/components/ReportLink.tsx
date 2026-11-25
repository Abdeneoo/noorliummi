'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function ReportLink({ label }: { label: string }) {
  const p = usePathname() || '/';
  return <Link href={`/report?p=${encodeURIComponent(p)}`}>{label}</Link>;
}
