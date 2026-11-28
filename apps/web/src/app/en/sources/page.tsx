import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import SourcesPage from '@/components/SourcesPage';
export const metadata: Metadata = { title: 'Sources and licences', openGraph: og('/en/sources', 'en', 'Sources and licences') };
export default function Sources() { return <SourcesPage lang="en" />; }
