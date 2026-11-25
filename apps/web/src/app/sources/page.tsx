import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'المصادر والتراخيص' };

interface Row { what: string; source: string; url: string; license: string; how: string }
const ROWS: Row[] = [
  { what: 'نص القرآن الكريم (رسم عثماني وإملائي)', source: 'مشروع تنزيل Tanzil', url: 'https://tanzil.net', license: 'CC BY 3.0', how: 'يُعرض كما هو حرفيًا دون أي تعديل، ويُتحقَّق منه آليًا عند كل بناء بمقارنة الجمع الاختباري (SHA-256) والحرف بالحرف.' },
  { what: 'متشابهات القرآن', source: 'Waqar144/Quran_Mutashabihat_Data', url: 'https://github.com/Waqar144/Quran_Mutashabihat_Data', license: 'CC0 1.0', how: 'تُعرض المواضع كما هي مع نص الآيات من Tanzil. للمواضع الشائعة عند الحفّاظ وليست حصرًا.' },
  { what: 'كتب الحديث (الستة، الموطأ، الأربعينات)', source: 'fawazahmed0/hadith-api', url: 'https://github.com/fawazahmed0/hadith-api', license: 'Unlicense (مجال عام)', how: 'النص منقول حرفيًا دون درجات ولا حواشٍ. المصدر لا يسمّي طبعة؛ والطبعة التي قوبل بها كل كتاب ونسبة التطابق من تقارير open-hadith-data.' },
  { what: 'توثيق مقابلة كتب الحديث بالطبعات', source: 'samt-qa/open-hadith-data', url: 'https://github.com/samt-qa/open-hadith-data', license: 'CC BY 4.0', how: 'open-hadith-data by samt-qa. نذكر نتائج تقاريره ونربط بها.' },
  { what: 'أسماء الله الحسنى', source: 'rn0x/Names_Of_Allah_Json، عن كتاب د. سعيد القحطاني', url: 'https://github.com/rn0x/Names_Of_Allah_Json', license: 'MIT لبنية البيانات؛ شرح الكتاب حق لمؤلفه وناشره', how: 'نعرض الأسماء وأرقام الآيات فقط، ونص الآيات من Tanzil، ونحيل إلى الشرح في الكتاب.' },
  { what: 'نوع كلمات القرآن وجذورها', source: 'Quranic Arabic Corpus (morphology v0.4) — Kais Dukes', url: 'https://corpus.quran.com', license: 'GNU GPL (الملف يُنسخ كما هو دون تعديل)', how: 'نعرض لكل كلمة نوعها وجذرها وخصائصها كما في المدوّنة. تحليل آلي راجع متطوعوه جزءًا منه، للتعلّم لا إعرابًا معتمدًا.' },
  { what: 'تفسير الجلالين', source: 'spa5k/tafsir_api (مأخوذ من quran.com)', url: 'https://github.com/spa5k/tafsir_api', license: 'MIT للكود وتنسيق البيانات؛ نص التفسير تراثي', how: 'يُعرض كما هو دون تعديل. نسخة تجريبية بانتظار مراجعة أهل العلم.' },
  { what: 'الأذكار (حصن المسلم)', source: 'asellam/HisnElMuslim، وأصل الكتاب لسعيد بن علي بن وهف القحطاني', url: 'https://github.com/asellam/HisnElMuslim', license: 'MIT لتنسيق البيانات', how: 'تُعرض كما هي مع المصدر والعدد. نسخة تجريبية بانتظار مراجعة أهل العلم.' },
  { what: 'تسجيلات الأذكار الصوتية', source: 'OpenDua (Ihsan Labs, Human Development Fund) — Recitation by Muhammad Jumah for OpenDua', url: 'https://opendua.hdfund.org', license: 'CC BY 4.0', how: 'مستضافة ذاتيًا. تُربط بالذكر فقط إذا طابق نص التسجيل نص الذكر حرفيًا بعد حذف التشكيل. لا يعني ذلك أن OpenDua تؤيد هذا الموقع.' },
  { what: 'حساب مواقيت الصلاة واتجاه القبلة', source: 'Adhan JS (Batoul Apps)', url: 'https://github.com/batoulapps/adhan-js', license: 'MIT', how: 'يُحسب على جهازك دون إرسال موقعك لأي خادم.' },
  { what: 'صوت الأذان', source: 'تسجيل Andrewler على ويكيميديا كومنز', url: 'https://commons.wikimedia.org/wiki/File:Azan.ogg', license: 'CC BY-SA 4.0', how: 'حُوِّل من OGG إلى MP3 دون قص. الترخيص نفسه ينطبق على الملف المحوَّل.' },
  { what: 'تلاوات القرّاء', source: 'Islamic Network (cdn.islamic.network)', url: 'https://alquran.cloud', license: 'تبقى حقوق التلاوات لأصحابها', how: 'تُبَثّ مباشرة من مصدرها ولا نستضيفها ولا ننسخها، لعدم وجود إذن بإعادة التوزيع.' },
  { what: 'الخطوط', source: 'Noto Kufi Arabic وAmiri Quran', url: 'https://fontsource.org', license: 'SIL OFL 1.1', how: 'مستضافة ذاتيًا ضمن الموقع.' },
];

export default function Sources() {
  return (
    <article style={{ maxWidth: 820, margin: '24px auto' }}>
      <h1>المصادر والتراخيص</h1>
      <p>هذه الصفحة تذكر ما يستخدمه الموقع فعلًا الآن، لا ما نخطط له. كل ما يخص الدين يُعرض من مصدره دون تعديل، ولا نكتب نصوصًا دينية بأنفسنا.</p>
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {ROWS.map((r) => (
          <section className="card" key={r.what}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>{r.what}</h2>
            <p className="meta"><span>المصدر: <a href={r.url} rel="noopener">{r.source}</a></span><span>الترخيص: {r.license}</span></p>
            <p>{r.how}</p>
          </section>
        ))}
      </div>
      <p className="note">إن رأيت خطأً في نص أو نسبة مصدر، فنرجو تنبيهنا ليُصحَّح. تفاصيل التحقق من كل ترخيص محفوظة في مستودع المشروع.</p>
    </article>
  );
}
