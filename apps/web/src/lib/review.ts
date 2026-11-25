/** Sections tracked for scholarly review, and the four states a section can be in. AI checks are never a "review". */
export const REVIEW_SECTIONS: { id: string; ar: string; sensitive?: boolean }[] = [
  { id: 'quran', ar: 'نص القرآن الكريم (Tanzil)' }, { id: 'tafsir', ar: 'تفسير الجلالين' }, { id: 'translation-en', ar: 'ترجمة المعاني بالإنجليزية (QuranEnc)' }, { id: 'translations', ar: 'ترجمات المعاني: الأردية والتركية والإندونيسية (QuranEnc)' },
  { id: 'tajweed', ar: 'تلوين التجويد (آلي)' }, { id: 'words', ar: 'الكلمات وجذورها (آلي)' }, { id: 'mutashabihat', ar: 'المتشابهات وتحدّيها' }, { id: 'topics', ar: 'مواضيع في القرآن وذكر الأنبياء (بحث لفظي)' },
  { id: 'hadith', ar: 'كتب الحديث' }, { id: 'library', ar: 'المكتبة: رياض الصالحين والأذكار' }, { id: 'adhkar', ar: 'الأذكار (حصن المسلم) والأدعية' }, { id: 'names', ar: 'أسماء الله الحسنى' },
  { id: 'prayer', ar: 'مواقيت الصلاة والقبلة' }, { id: 'calendar', ar: 'التقويم والمواسم والحج' }, { id: 'dedication', ar: 'الصفحات المُهداة وصيغ الدعاء (التأنيث، إهداء الثواب)', sensitive: true },
  { id: 'zakat', ar: 'حاسبة الزكاة', sensitive: true }, { id: 'inheritance', ar: 'حاسبة الميراث', sensitive: true }, { id: 'tasmee', ar: 'التسميع الآلي', sensitive: true },
];
export const REVIEW_STATES = { sourced: 'موثّق المصدر', pending: 'بانتظار المراجعة البشرية', reviewed: 'راجعه متخصص', needs_changes: 'يحتاج تعديلًا' } as const;
export type ReviewState = keyof typeof REVIEW_STATES;
export interface ReviewRow { section: string; status: ReviewState; reviewer: string; note: string; reviewed_at: string | null }
