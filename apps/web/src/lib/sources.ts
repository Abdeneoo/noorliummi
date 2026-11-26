/** Every external source the site uses, in one place (shown on /sources and /en/sources). */
export type Lang = 'ar' | 'en';
export interface Source { what: Record<Lang, string>; source: string; url: string; license: string; how: Record<Lang, string> }
export interface Group { id: string; title: Record<Lang, string>; items: Source[] }

export const GROUPS: Group[] = [
  {
    id: 'quran', title: { ar: 'القرآن الكريم وعلومه', en: 'The Quran' }, items: [
      { what: { ar: 'نص القرآن الكريم', en: 'Quran text' }, source: 'Tanzil Project', url: 'https://tanzil.net', license: 'CC BY 3.0',
        how: { ar: 'يُعرض كما هو حرفيًا دون أي تعديل، ويُتحقَّق من مطابقته للمصدر ببصمة SHA-256 في كل بناء للموقع.', en: 'Shown verbatim and checked against the source (SHA-256) on every build.' } },
      { what: { ar: 'ترجمة معاني القرآن بالإنجليزية', en: 'English translation of the meanings' }, source: 'Saheeh International — Noor International Center, via QuranEnc.com (v1.1.2)', url: 'https://quranenc.com', license: 'QuranEnc terms',
        how: { ar: 'كاملة بحواشيها دون تعديل، مع اسم الناشر والمصدر ورقم الإصدار، وتُحدَّث بآخر إصدار.', en: 'Complete with footnotes, unmodified, with publisher, source and version; kept up to date.' } },
      { what: { ar: 'ترجمات المعاني: الأردية والتركية والإندونيسية', en: 'Urdu, Turkish and Indonesian translations of the meanings' }, source: 'QuranEnc.com — Muhammad Junagarhi (ur 1.1.3) · Rowwad Translation Center (tr 1.0.4) · Indonesian Ministry of Religious Affairs (id 1.0.1)', url: 'https://quranenc.com', license: 'شروط QuranEnc (دون تعديل، مع ذكر المصدر والإصدار)',
        how: { ar: 'كاملة بحواشيها دون تعديل، مع اسم الترجمة والمصدر ورقم الإصدار. ليست ترجمة آلية.', en: 'Complete with footnotes, unmodified, with title, source and version. Not machine translation.' } },
      { what: { ar: 'تلاوات كل القرّاء (السورة كاملة)', en: 'Full-surah recitations by all reciters' }, source: 'MP3Quran.net', url: 'https://www.mp3quran.net', license: 'بث من خوادم المصدر (لا شروط إعادة توزيع منشورة)',
        how: { ar: 'يُبث الصوت من خوادم MP3Quran مباشرة إلى متصفحك ولا نستضيفه. تُعرض كل صور التلاوة لكل قارئ (الروايات وأنواع التلاوة). زر «احفظ السورة على جهازي» يحفظ نسخة شخصية في متصفحك أنت فقط.', en: 'Audio is streamed straight from MP3Quran servers to your browser; nothing is hosted here. All recordings of each reciter are listed. “Save on my device” keeps a personal copy in your own browser only.' } },
      { what: { ar: 'تفسير الجلالين', en: 'Tafsir al-Jalalayn (Arabic)' }, source: 'spa5k/tafsir_api', url: 'https://github.com/spa5k/tafsir_api', license: 'MIT (data); classical text',
        how: { ar: 'يُعرض كما هو لكل آية.', en: 'Shown as published for each ayah.' } },
      { what: { ar: 'ألوان أحكام التجويد', en: 'Tajweed colours' }, source: 'cpfair/quran-tajweed — Collin Fair', url: 'https://github.com/cpfair/quran-tajweed', license: 'CC BY 4.0',
        how: { ar: 'تلوين آلي لرواية حفص نُقل إلى نصنا بمطابقة الحروف، ولا يغيّر النص. لم يراجعه معلم تجويد بعد.', en: 'Automatic colouring for Hafs, mapped onto our text without changing it; not yet reviewed by a teacher.' } },
      { what: { ar: 'إعراب الكلمات وجذورها', en: 'Word morphology and roots' }, source: 'Quranic Arabic Corpus v0.4 — Kais Dukes', url: 'https://corpus.quran.com', license: 'GNU GPL',
        how: { ar: 'تحليل آلي راجعه متطوعون جزئيًا؛ الملف محفوظ كما هو.', en: 'Automatic analysis partly reviewed by volunteers; the file is kept unmodified.' } },
      { what: { ar: 'متشابهات القرآن', en: 'Similar verses' }, source: 'Waqar144/Quran_Mutashabihat_Data', url: 'https://github.com/Waqar144/Quran_Mutashabihat_Data', license: 'CC0 1.0',
        how: { ar: 'المواضع كما وردت، والآيات من Tanzil.', en: 'Positions as published; verse text from Tanzil.' } },
      { what: { ar: 'أسماء الله الحسنى', en: 'The Names of Allah' }, source: 'rn0x/Names_Of_Allah_Json', url: 'https://github.com/rn0x/Names_Of_Allah_Json', license: 'MIT (data)',
        how: { ar: 'الأسماء والآيات الدالة عليها فقط، بعد التحقق من كل إحالة على نص Tanzil.', en: 'Names and their verses only, each reference verified against Tanzil.' } },
    ],
  },
  {
    id: 'audio', title: { ar: 'التلاوات والصوتيات', en: 'Recitations and audio' }, items: [
      { what: { ar: 'تلاوات القرّاء والختمة الكاملة', en: 'Recitations and full khatma' }, source: 'Islamic Network (alquran.cloud)', url: 'https://alquran.cloud', license: 'حقوق التلاوات لأصحابها',
        how: { ar: 'تُبث مباشرة من مصدرها ولا تُنسخ إلى خادمنا.', en: 'Streamed from the source; never copied to our server.' } },
      { what: { ar: 'تسجيلات الأذكار والدعاء في الرئيسية', en: 'Adhkar recordings' }, source: 'OpenDua (Ihsan Labs, Human Development Fund) — Recitation by Muhammad Jumah for OpenDua', url: 'https://opendua.hdfund.org', license: 'CC BY 4.0',
        how: { ar: 'تُربط بالذكر فقط إذا تطابق نصه حرفيًا. لا يعني ذلك تأييد OpenDua للموقع.', en: 'Attached only where the Arabic text matches exactly. No endorsement is implied.' } },
    ],
  },
  {
    id: 'adhan', title: { ar: 'أصوات الأذان', en: 'Adhan recordings' }, items: [
      { what: { ar: 'أذانات مستضافة: إسلام ويب', en: 'Hosted: islamweb' }, source: 'إسلام ويب islamweb.net', url: 'https://www.islamweb.net/en/fatwa/379009/islwmweb-material-is-copyrighted', license: 'غير تجاري مع ذكر المصدر',
        how: { ar: 'إسلام ويب يأذن بالانتفاع بموادها لغير غرض تجاري بشرط ذكر المصدر. حُوِّلت إلى MP3 دون قص.', en: 'islamweb allows non-commercial use with the source named. Converted to MP3, not cut.' } },
      { what: { ar: 'أذانات مستضافة: أرشيف الإنترنت', en: 'Hosted: Internet Archive' }, source: 'archive.org — adhan.notifications, MakkahAzan, MadinahFajrAzan', url: 'https://archive.org/details/adhan.notifications', license: 'Public Domain / CC0 (كما أعلن الرافع)',
        how: { ar: 'أذانات الحرمين والشيخ علي أحمد ملا وغيرهم؛ استُخرج الصوت دون قص.', en: 'Haramain adhans, Sheikh Ali Ahmed Mulla and others; audio extracted, not cut.' } },
      { what: { ar: 'أذانات تُبث من مصدرها', en: 'Streamed adhans' }, source: 'Kiwifu/adhan-mp3 وAlAdhan', url: 'https://github.com/Kiwifu/adhan-mp3', license: 'حقوقها لأصحابها',
        how: { ar: 'تُشغَّل من المستودع (المعلن مجانيته للتطبيقات الإسلامية) ومن AlAdhan مباشرة، ولا تُنسخ إلى خادمنا. نسخة واحدة لكل صوت.', en: 'Played from the repository (declared free for Islamic apps) and AlAdhan; never copied. One take per voice.' } },
    ],
  },
  {
    id: 'hadith', title: { ar: 'الحديث والأذكار', en: 'Hadith and adhkar' }, items: [
      { what: { ar: 'الكتب الستة والموطأ والأربعينات', en: 'The six books, Muwatta, forty hadith' }, source: 'fawazahmed0/hadith-api', url: 'https://github.com/fawazahmed0/hadith-api', license: 'Unlicense',
        how: { ar: 'النص منقول حرفيًا دون درجات أو حواشٍ. صفحة كل كتاب تذكر طبعته.', en: 'Text verbatim without grades or notes. Each book page states its edition.' } },
      { what: { ar: 'مسند أحمد وسنن الدارمي', en: 'Musnad Ahmad, Sunan al-Darimi' }, source: 'OpenITI (2025.1.9)', url: 'https://github.com/OpenITI/RELEASE', license: 'CC BY-NC-SA 4.0',
        how: { ar: 'مع ذكر الطبعة كما في رأس الملف.', en: 'With the edition named in the file header.' } },
      { what: { ar: 'مقابلة الكتب بالطبعات', en: 'Edition collation reports' }, source: 'samt-qa/open-hadith-data', url: 'https://github.com/samt-qa/open-hadith-data', license: 'CC BY 4.0',
        how: { ar: 'نذكر نتائج تقاريره ونربط بها.', en: 'We cite and link its reports.' } },
      { what: { ar: 'الأذكار (حصن المسلم)', en: 'Adhkar (Hisn al-Muslim)' }, source: 'asellam/HisnElMuslim — سعيد بن علي بن وهف القحطاني', url: 'https://github.com/asellam/HisnElMuslim', license: 'MIT (data)',
        how: { ar: 'النص والعدد والتخريج كما وردت.', en: 'Text, counts and references as published.' } },
    ],
  },
  {
    id: 'tools', title: { ar: 'الأدوات والتقنيات', en: 'Tools and technology' }, items: [
      { what: { ar: 'مواقيت الصلاة والقبلة', en: 'Prayer times and qibla' }, source: 'Adhan JS (Batoul Apps)', url: 'https://github.com/batoulapps/adhan-js', license: 'MIT',
        how: { ar: 'تُحسب على جهازك، وموقعك لا يُرسل إلى أي خادم. قوبلت بجداول رسمية.', en: 'Calculated on your device; checked against official tables.' } },
      { what: { ar: 'أحاديث مترجمة مع الشرح (أردي، تركي، إندونيسي)', en: 'Translated hadiths with explanation (Urdu, Turkish, Indonesian)' }, source: 'HadeethEnc.com — API v1', url: 'https://hadeethenc.com/ar/home', license: 'سياسة إعادة النشر المعلنة: دون تعديل، مع ذكر المصدر',
        how: { ar: 'يُعرض الحديث وشرحه وفوائده وترجمتها كما هي من المصدر مع رابط الحديث فيه. لم يراجعها مراجع المنصة.', en: 'Hadith, explanation and benefits with their translations shown verbatim with a link to the source.' } },
      { what: { ar: 'ترجمات الأذكار (أردي، تركي، إندونيسي)', en: 'Adhkar translations (Urdu, Turkish, Indonesian)' }, source: 'IslamHouse — موسوعة المحتوى الإسلامي المترجم', url: 'https://cnt.islamhouse.com/', license: 'سياسة إعادة النشر المعلنة: دون تعديل، مع ذكر المصدر',
        how: { ar: 'نسخة محفوظة بتاريخ 26-11-2026 ومتحقق منها بـ SHA-256؛ كل جملة عربية مع ترجمتها كما نشرتها IslamHouse، والباب يُربط برقمه وعنوانه.', en: 'Snapshot of 2026-11-26 verified by SHA-256; each Arabic phrase with its published translation.' } },
      { what: { ar: 'كتب مختارة: التحقيق والإيضاح (ابن باز)، فضل عشر ذي الحجة، ما لا يسع أطفال المسلمين جهله', en: 'Selected books (Ibn Baz on Hajj; Dhul-Hijjah; what Muslim children must know)' }, source: 'IslamHouse — موسوعة المحتوى الإسلامي المترجم', url: 'https://enc.islamhouse.com/', license: 'سياسة إعادة النشر المعلنة: دون تعديل، مع ذكر المصدر والمؤلف',
        how: { ar: 'اختارها صاحب المنصة. النص كاملًا كما هو بفصوله وترتيبه، ومعه ترجمات الناشر؛ نسخة 26-11-2026 متحقق منها بـ SHA-256.', en: 'Chosen by the owner; full text verbatim with the publisher’s translations; snapshot verified by SHA-256.' } },
      { what: { ar: 'الدروس والمحاضرات والكتب', en: 'Lessons, lectures and books (Arabic)' }, source: 'IslamHouse.com — API v3', url: 'https://islamhouse.com/ar/', license: 'سياسة إعادة النشر المعلنة: دون تعديل، مع ذكر المصدر والمؤلف',
        how: { ar: 'تُعرض المواد كما هي بعناوينها وأوصافها وأسماء مؤلفيها، وتُبث الملفات من خوادم IslamHouse مع رابط المادة الأصلية. لم يراجعها مراجع المنصة.', en: 'Items are shown as they are with their authors; files are streamed from IslamHouse servers with a link to the original.' } },
      { what: { ar: 'ترجمات الحديث: الأردية والتركية والإندونيسية', en: 'Hadith translations: Urdu, Turkish, Indonesian' }, source: 'fawazahmed0/hadith-api (urd-*, tur-*, ind-*)', url: 'https://github.com/fawazahmed0/hadith-api', license: 'Unlicense',
        how: { ar: 'تُعرض تحت النص العربي بمطابقة رقم الحديث في الطبعة نفسها، دون تعديل. المصدر لا يذكر اسم المترجم. نسب التغطية في تقرير الشفافية.', en: 'Shown under the Arabic by the same edition’s hadith number, unmodified. The source does not name the translators. Coverage is in the transparency report.' } },
      { what: { ar: 'المكتبة: رياض الصالحين والأذكار للنووي', en: 'Library: Riyad as-Salihin and al-Adhkar (Arabic)' }, source: 'OpenITI RELEASE 2025.1.9', url: 'https://github.com/OpenITI/RELEASE', license: 'CC BY-NC-SA 4.0',
        how: { ar: 'النص الكامل لطبعة محددة (مذكورة في صفحة كل كتاب) مع ترقيم صفحاتها؛ تُزال علامات الترميز التقنية فقط، ويُتحقق آليًا أن حرفًا عربيًا لم يُحذف. للاستخدام غير التجاري.', en: 'Full text of a named edition with its page numbers; only technical markup is removed, verified letter by letter. Non-commercial.' } },
      { what: { ar: 'سعر الذهب والفضة (حاسبة الزكاة)', en: 'Gold and silver price (zakat calculator)' }, source: 'gold-api.com', url: 'https://gold-api.com', license: 'واجهة مجانية عامة بلا مفتاح',
        how: { ar: 'السعر العالمي بالدولار يُجلب من خادمنا مرة كل ساعة ويُعرض استرشادًا؛ والمستخدم يكتب سعر بلده.', en: 'World spot price in USD, fetched by our server hourly and shown as guidance; users enter their local price.' } },
      { what: { ar: 'المساجد القريبة', en: 'Nearby mosques' }, source: '© مساهمو OpenStreetMap', url: 'https://www.openstreetmap.org/copyright', license: 'ODbL',
        how: { ar: 'عبر Overpass API، بإحداثيات مقرّبة.', en: 'Via the Overpass API with rounded coordinates.' } },
      { what: { ar: 'جدولة الحفظ', en: 'Memorisation schedule' }, source: 'ts-fsrs', url: 'https://github.com/open-spaced-repetition/ts-fsrs', license: 'MIT',
        how: { ar: 'تعمل على جهازك.', en: 'Runs on your device.' } },
      { what: { ar: 'الخطوط', en: 'Fonts' }, source: 'Amiri Quran، Amiri، El Messiri، IBM Plex Sans Arabic، Noto Naskh Arabic، Inter', url: 'https://fontsource.org', license: 'SIL OFL 1.1',
        how: { ar: 'مستضافة ذاتيًا.', en: 'Self-hosted.' } },
      { what: { ar: 'كود الموقع', en: 'Site code' }, source: 'Abdeneoo/noorliummi', url: 'https://github.com/Abdeneoo/noorliummi', license: 'AGPL-3.0',
        how: { ar: 'مفتوح المصدر. الاسم والشعار والإهداء خارج الترخيص.', en: 'Open source. The name, logo and dedication are not covered by the licence.' } },
    ],
  },
];
