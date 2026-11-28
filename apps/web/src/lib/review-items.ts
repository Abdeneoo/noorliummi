/** What a shar'i reviewer is asked to check, most important first. Each item opens a page of the site. */
export interface RItem { key: string; title: string; href: string; what: string }
export const REVIEW: { group: string; items: RItem[] }[] = [
  { group: 'الأولوية', items: [
    { key: 'umrah', title: 'العمرة خطوة بخطوة', href: '/umrah', what: 'ترتيب الخطوات، والأذكار المختارة لكل خطوة، وعدّاد الأشواط.' },
    { key: 'ghusl', title: 'الغسل من الجنابة', href: '/ghusl', what: 'تقسيم الباب وعرضه (النص من الفقه الميسر).' },
    { key: 'miqat', title: 'خريطة المواقيت', href: '/umrah#map', what: 'أسماء المواقيت ومواضعها التقريبية.' },
    { key: 'zakat', title: 'حاسبة الزكاة', href: '/zakat', what: 'النصاب والحول والنسبة وحدود الحاسبة.' },
    { key: 'inheritance', title: 'حاسبة المواريث', href: '/inheritance', what: 'نتائج الحالات المعروفة (العمريتان، العول، الرد).' },
    { key: 'hal', title: 'ادعُ بما يناسب حالك', href: '/duas/hal', what: 'مناسبة الأدعية لكل حال.' },
    { key: 'tajweed', title: 'تلوين التجويد', href: '/quran/1', what: 'صحة تلوين الأحكام (رواية حفص).' },
    { key: 'gharib', title: 'غريب القرآن', href: '/gharib/2', what: 'ربط كلام السجستاني وابن قتيبة بالآيات الصحيحة.' },
  ] },
  { group: 'الأدعية والأذكار', items: [
    { key: 'adhkar', title: 'الأذكار (حصن المسلم)', href: '/adhkar', what: 'النصوص والأعداد والتخريج.' },
    { key: 'duas', title: 'الأدعية', href: '/duas', what: 'التقسيم والنصوص.' },
    { key: 'athar', title: 'صفحة أثر وصيغ الدعاء للميت', href: '/athar', what: 'تأنيث الضمير وصيغة الجمع في الدعاء.' },
    { key: 'ruqyah', title: 'الرقية', href: '/ruqyah', what: 'الآيات والأدعية المختارة.' },
    { key: 'patient', title: 'وضع المريض', href: '/patient', what: 'ما يُعرض للمريض.' },
    { key: 'situations', title: 'المواقف', href: '/situations', what: 'ربط الأذكار بالمواقف.' },
  ] },
  { group: 'المواسم', items: [
    { key: 'ramadan', title: 'رمضان', href: '/ramadan', what: 'الإمساكية ومجالس الشهر.' },
    { key: 'ramadan30', title: 'ثلاثون مجلسًا', href: '/ramadan/30', what: 'اختيار الآيات والأحاديث لكل يوم.' },
    { key: 'hajj', title: 'الحج', href: '/hajj', what: 'الأيام والروابط والأذكار.' },
    { key: 'calendar', title: 'التقويم والمواسم', href: '/calendar', what: 'المناسبات وأوقاتها.' },
  ] },
  { group: 'العلم', items: [
    { key: 'fiqh', title: 'الفقه والكتب المساندة', href: '/fiqh', what: 'تقسيم الأبواب والكتب المختارة.' },
    { key: 'names', title: 'أسماء الله الحسنى', href: '/names', what: 'الأسماء والآيات الدالة عليها.' },
    { key: 'mutashabihat', title: 'متشابهات القرآن', href: '/mutashabihat', what: 'المواضع.' },
    { key: 'hadith', title: 'كتب الحديث', href: '/hadith', what: 'النصوص والترقيم.' },
    { key: 'sunnah', title: 'أحيِ سنة', href: '/sunnah', what: 'اختيار السنن.' },
    { key: 'kids', title: 'ركن الأطفال', href: '/family', what: 'مناسبة المحتوى للأطفال.' },
  ] },
];
export const ALL_KEYS = new Set(REVIEW.flatMap((g) => g.items.map((i) => i.key)));
