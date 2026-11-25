import info from '@/generated/tr/index.json';
/**
 * Urdu, Turkish and Indonesian: the Quran with a published translation of its meanings (QuranEnc, verbatim).
 * Interface labels below were translated for the site and await review by native speakers; religious texts are never machine-translated.
 */
export type IntlLang = 'ur' | 'tr' | 'id';
export const INTL: Record<IntlLang, { native: string; dir: 'rtl' | 'ltr'; site: string; tagline: string; quran: string; surah: string; ayat: string; meccan: string; medinan: string; footnote: string; prev: string; next: string; index: string; source: string; listen: string; other: string; uiNote: string }> = {
  ur: { native: 'اردو', dir: 'rtl', site: 'نور لِأُمّی', tagline: 'مفت اسلامی پلیٹ فارم — صدقۂ جاریہ', quran: 'قرآن کریم', surah: 'سورت', ayat: 'آیات', meccan: 'مکی', medinan: 'مدنی', footnote: 'حاشیہ', prev: 'پچھلی سورت', next: 'اگلی سورت', index: 'فہرست', source: 'ترجمے کا ماخذ', listen: 'تلاوت سنیں (عربی صفحہ)', other: 'باقی حصے فی الحال عربی اور انگریزی میں ہیں:', uiNote: 'صفحے کے عنوانات کا ترجمہ ابھی نظرِ ثانی کا منتظر ہے۔' },
  tr: { native: 'Türkçe', dir: 'ltr', site: 'Noor Li Ummi', tagline: 'Ücretsiz İslami platform — sadaka-i cariye', quran: "Kur'an-ı Kerim", surah: 'Sure', ayat: 'ayet', meccan: 'Mekkî', medinan: 'Medenî', footnote: 'Dipnot', prev: 'Önceki sure', next: 'Sonraki sure', index: 'Fihrist', source: 'Mealin kaynağı', listen: 'Tilaveti dinle (Arapça sayfa)', other: 'Diğer bölümler şimdilik Arapça ve İngilizce:', uiNote: 'Arayüz çevirisi henüz gözden geçirilmedi.' },
  id: { native: 'Indonesia', dir: 'ltr', site: 'Noor Li Ummi', tagline: 'Platform Islam gratis — sedekah jariyah', quran: "Al-Qur'an", surah: 'Surah', ayat: 'ayat', meccan: 'Makkiyah', medinan: 'Madaniyah', footnote: 'Catatan kaki', prev: 'Surah sebelumnya', next: 'Surah berikutnya', index: 'Daftar surah', source: 'Sumber terjemahan', listen: 'Dengarkan tilawah (halaman Arab)', other: 'Bagian lain saat ini dalam bahasa Arab dan Inggris:', uiNote: 'Terjemahan antarmuka belum ditinjau.' },
};
export const TR_INFO = info as Record<IntlLang, { key: string; version: string; title: string; description: string; dir: string }>;
export async function loadTr(lang: IntlLang, n: number) { return (await import(`@/generated/tr/${lang}/${n}.json`)).default as { tr: string; fn: string }[]; }
