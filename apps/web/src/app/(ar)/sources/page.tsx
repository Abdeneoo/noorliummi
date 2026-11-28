import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import SourcesPage from '@/components/SourcesPage';
export const metadata: Metadata = { title: 'المصادر والتراخيص', openGraph: og('/sources', 'ar', 'المصادر والتراخيص') };
export default function Sources() { return <SourcesPage />; }
