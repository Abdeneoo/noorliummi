import Link from 'next/link';
/** Shown on every fiqh page: what the text is and what it is not. */
export default function FiqhNotice() {
  return <p className="review-banner">النص منقول حرفيًا من كتاب «الفقه الميسر في ضوء الكتاب والسنة» (نخبة من العلماء، مجمع الملك فهد لطباعة المصحف الشريف)، دون تلخيص ولا تعديل. يذكر الكتاب القول الذي رجّحه مؤلفوه في المسائل المختلف فيها، ولا يعني ذلك الإجماع، ولا يعرض أقوال المذاهب الأخرى. هذا ليس فتوى؛ لسؤالك الخاص ارجع إلى عالم أو جهة إفتاء معتمدة. <Link href="/sources">المصدر والترخيص</Link></p>;
}
