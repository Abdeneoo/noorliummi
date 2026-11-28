/** Every main section of the site, grouped, so each one has a door from the home page, the «المزيد» sheet and /sections. */
export type Lang = 'ar' | 'en';
export interface Sec { href: string; icon: string; title: string; desc?: string }
export interface SecGroup { id: string; title: string; items: Sec[] }

export const SECTIONS: Record<Lang, SecGroup[]> = {
  ar: [
    { id: 'daily', title: 'عبادتك اليومية', items: [
      { href: '/quran', icon: 'quran', title: 'القرآن الكريم', desc: 'المصحف والتلاوة والتفسير' },
      { href: '/prayer', icon: 'prayer', title: 'الصلاة والأذان', desc: 'المواقيت والقبلة والأذان' },
      { href: '/adhkar', icon: 'adhkar', title: 'الأذكار', desc: 'الصباح والمساء وكل حال' },
      { href: '/duas', icon: 'heart', title: 'الأدعية', desc: 'من القرآن والسنة' },
      { href: '/tasbeeh', icon: 'adhkar', title: 'المسبحة' },
      { href: '/today', icon: 'clock', title: 'يومي مع الله' },
      { href: '/wird', icon: 'book', title: 'وِردي اليومي' },
    ] },
    { id: 'taharah', title: 'الطهارة', items: [
      { href: '/ghusl', icon: 'drop', title: 'الغسل من الجنابة', desc: 'صفته وموجباته وأحكامه' },
      { href: '/fiqh/taharah/5', icon: 'drop', title: 'الوضوء' },
      { href: '/fiqh/taharah/8', icon: 'drop', title: 'التيمم' },
      { href: '/fiqh/taharah/10', icon: 'drop', title: 'الحيض والنفاس' },
    ] },
    { id: 'seasons', title: 'المناسك والمواسم', items: [
      { href: '/umrah', icon: 'kaaba', title: 'العمرة', desc: 'خطوة بخطوة مع عدّاد الأشواط' },
      { href: '/hajj', icon: 'kaaba', title: 'الحج', desc: 'أيام الحج ومناسكه' },
      { href: '/ramadan', icon: 'moon', title: 'رمضان', desc: 'الإمساكية ومجالس الشهر' },
      { href: '/travel', icon: 'map', title: 'حقيبة المسافر' },
      { href: '/calendar', icon: 'calendar', title: 'التقويم والمواسم' },
    ] },
    { id: 'listen', title: 'استمع', items: [
      { href: '/reciters', icon: 'headphones', title: 'القرّاء', desc: 'تلاوات وأدعية بأصواتهم' },
      { href: '/mushafs', icon: 'quran', title: 'المصاحف المرتلة' },
      { href: '/duas/audio', icon: 'play', title: 'المكتبة الصوتية' },
      { href: '/live', icon: 'live', title: 'البث المباشر من الحرمين' },
      { href: '/series', icon: 'play', title: 'السلاسل المرئية' },
      { href: '/lessons', icon: 'headphones', title: 'الدروس والمحاضرات' },
    ] },
    { id: 'learn', title: 'تعلّم', items: [
      { href: '/tafsir', icon: 'tafsir', title: 'التفسير' },
      { href: '/hadith', icon: 'hadith', title: 'كتب الحديث' },
      { href: '/hadeeth', icon: 'hadith', title: 'أحاديث مشروحة' },
      { href: '/fiqh', icon: 'book', title: 'الفقه' },
      { href: '/library/qisas', icon: 'book', title: 'قصص الأنبياء' },
      { href: '/library/fusul', icon: 'book', title: 'السيرة النبوية' },
      { href: '/books', icon: 'knowledge', title: 'الكتب' },
      { href: '/names', icon: 'names', title: 'أسماء الله الحسنى' },
      { href: '/translations', icon: 'globe', title: 'ترجمات القرآن' },
      { href: '/gharib', icon: 'words', title: 'غريب القرآن' },
    ] },
    { id: 'care', title: 'لك ولأهلك', items: [
      { href: '/ruqyah', icon: 'shield', title: 'الرقية الشرعية' },
      { href: '/patient', icon: 'heart', title: 'وضع المريض' },
      { href: '/family', icon: 'child', title: 'ركن الأطفال' },
      { href: '/sakina', icon: 'moon', title: 'السكينة' },
    ] },
    { id: 'sadaqah', title: 'صدقة جارية', items: [
      { href: '/athar', icon: 'sadaqah', title: 'صفحة أثر', desc: 'صفحة مُهداة لمن تحب' },
      { href: '/khatma', icon: 'quran', title: 'أهدِ ختمة' },
      { href: '/sadaqah', icon: 'sadaqah', title: 'الصدقة الجارية' },
    ] },
    { id: 'tools', title: 'أدوات', items: [
      { href: '/hifz', icon: 'hifz', title: 'الحفظ والمراجعة' },
      { href: '/mosques', icon: 'mosque', title: 'المساجد القريبة' },
      { href: '/zakat', icon: 'tools', title: 'حاسبة الزكاة' },
      { href: '/inheritance', icon: 'tools', title: 'حاسبة المواريث' },
      { href: '/search', icon: 'compass', title: 'البحث' },
      { href: '/apps', icon: 'phone', title: 'التطبيق والإضافة' },
    ] },
  ],
  en: [
    { id: 'daily', title: 'Every day', items: [
      { href: '/en/quran', icon: 'quran', title: 'The Quran' },
      { href: '/en/prayer', icon: 'prayer', title: 'Prayer & Adhan' },
      { href: '/en/adhkar', icon: 'adhkar', title: 'Adhkar' },
      { href: '/en/tasbeeh', icon: 'adhkar', title: 'Tasbeeh' },
      { href: '/en/today', icon: 'clock', title: 'My day' },
    ] },
    { id: 'seasons', title: 'Rites & seasons', items: [
      { href: '/en/umrah', icon: 'kaaba', title: 'Umrah', desc: 'Step by step, with a lap counter' },
      { href: '/en/ramadan', icon: 'moon', title: 'Ramadan' },
      { href: '/en/travel', icon: 'map', title: 'Travel kit' },
    ] },
    { id: 'listen', title: 'Listen', items: [
      { href: '/en/reciters', icon: 'headphones', title: 'Reciters' },
      { href: '/en/playlists', icon: 'play', title: 'Playlists' },
    ] },
    { id: 'more', title: 'More', items: [
      { href: '/en/knowledge', icon: 'knowledge', title: 'Knowledge' },
      { href: '/en/names', icon: 'names', title: 'Names of Allah' },
      { href: '/en/patient', icon: 'heart', title: 'Patient mode' },
      { href: '/en/sadaqah', icon: 'sadaqah', title: 'Sadaqah Jariyah' },
      { href: '/en/hifz', icon: 'hifz', title: 'Memorisation' },
      { href: '/en/tools', icon: 'tools', title: 'Tools' },
    ] },
  ],
};
