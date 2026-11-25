import type { Metadata } from 'next';
import SourcesPage from '@/components/SourcesPage';
export const metadata: Metadata = { title: 'Sources and licences' };
export default function Sources() { return <SourcesPage lang="en" />; }
