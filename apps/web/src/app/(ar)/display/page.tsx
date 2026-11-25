import type { Metadata } from 'next';
import Board from '@/components/Board';
export const metadata: Metadata = { title: 'وضع العرض — مواقيت الصلاة' };
export default function Display() { return <Board />; }
