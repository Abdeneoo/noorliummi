import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import AppsPanel from '@/components/AppsPanel';
import Reveal from '@/components/Reveal';
export const metadata: Metadata = { title: 'التطبيق والإضافة', description: 'ثبّت نور لأمي على الموبايل والكمبيوتر، أو أضفه إلى متصفح كروم.', openGraph: og('/apps', 'ar', 'التطبيق والإضافة', 'ثبّت نور لأمي على الموبايل والكمبيوتر، أو أضفه إلى متصفح كروم.') };
export default function Apps() { return <article><AppsPanel /><Reveal /></article>; }
