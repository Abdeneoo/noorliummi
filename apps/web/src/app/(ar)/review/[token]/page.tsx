import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReviewBoard from '@/components/ReviewBoard';
import { REVIEW, marksOf, reviewerByToken } from '@/lib/review-board';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'مراجعة المحتوى', robots: { index: false, follow: false } };
export default async function Review({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const who = await reviewerByToken(token).catch(() => null); if (!who) notFound();
  const marks = await marksOf(who.id);
  return <ReviewBoard token={token} name={who.name} groups={REVIEW} marks={Object.fromEntries(marks.map((m) => [m.item_key, { v: m.verdict, n: m.note }]))} />;
}
