import type { Metadata } from 'next';
import { Hub } from '@/components/Tiles';
import { TOPICS } from '@/lib/topics';
export const metadata: Metadata = { title: 'مواضيع في القرآن الكريم', description: 'آيات القرآن الكريم التي ورد فيها لفظ الوالدين والأم والصبر والرزق والسكينة والتوبة، مع التفسير والاستماع.' };
export default function Topics() {
  return <Hub eyebrow="القرآن الكريم" title="مواضيع في القرآن" intro="صفحات تجمع الآيات التي ورد فيها لفظ بعينه، مع رابط التفسير والاستماع."
    items={TOPICS.map((t) => ({ href: `/topics/${t.id}`, icon: 'quran', title: `آيات ${t.title}`, desc: t.words }))} />;
}
