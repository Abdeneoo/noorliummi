import type { Metadata } from 'next';
import { og } from '@/lib/og-page';
import Board from '@/components/Board';
export const metadata: Metadata = { title: 'وضع العرض — مواقيت الصلاة', openGraph: og('/display', 'ar', 'وضع العرض — مواقيت الصلاة') };
export default function Display() { return <Board />; }
