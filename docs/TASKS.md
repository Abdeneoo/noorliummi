# TASKS — المهام القادمة (بالترتيب حسب الاعتماديات)

## بانتظار صاحب المشروع
- [ ] تشغيل `scripts/inspect-vps.sh` على الـVPS ومشاركة التقرير (لاختيار المعمارية النهائية: Postgres/Meilisearch/حجم الذاكرة).
- [ ] تحديد مستودع GitHub (خاص) لرفع المشروع إليه.
- [ ] اختيار اتجاه الهوية البصرية من التصورات المقدمة.
- [ ] الموافقة على مراسلة MP3Quran / EveryAyah / Quran Foundation لطلب إذن مكتوب للتلاوات.

## Phase 0 — استكمال الاكتشاف
- [ ] تدقيق المستودعات الـ18 في القسم 43 وفق قالب القسم 44 → `docs/REPOSITORY_EVALUATION.md`.
- [ ] فحص شروط: AlAdhan، Sunnah.com، IslamHouse، مجمع الملك فهد (الخطوط)، HadeethEnc API.
- [ ] البحث عن تسجيلات أذان بتراخيص صريحة (Wikimedia Commons، Internet Archive، Freesound، IslamHouse) → `docs/ADHAN_AUDIO_LICENSES.md`.
- [ ] `docs/BROWSER_LIMITATIONS.md` (Autoplay، Service Workers، Web Push على iOS/Android/سطح المكتب).

## Phase 1 — الهوية والتصميم
- [ ] 3 تصورات للشعار والهوية + الصفحة الرئيسية.
- [ ] Design System (tokens: ألوان، خطوط عربية مرخصة، مسافات) + Sitemap + User Flows.

## Phase 2 — النظام الأساسي
- [ ] `apps/web`: Next.js + i18n (ar/en، RTL/LTR) + PWA + وضع داكن/فاتح.
- [ ] الصفحة الرئيسية بمواقيت حقيقية من `@noor/prayer-engine` (اختيار مدينة يدويًا أو بموافقة الموقع).
- [ ] قاعدة البيانات: ERD + PostgreSQL migrations (Sources، Licenses، ContentVersions، QuranEditions، Surahs، Ayahs …).
- [ ] مستورد البيانات: تسجيل المصدر ← تحقق الترخيص ← staging ← schema ← checksum ← مراجعة ← نشر.
- [ ] Docker Compose للتطوير، ثم staging على الـVPS بعد الموافقة.

## Phase 3/4 — القرآن والصلاة
- [ ] قارئ القرآن (سورة/آية/جزء/حزب) من بيانات Tanzil + البحث دون تشكيل.
- [ ] مستورد QuranEnc للترجمات مع رقم الإصدار وتحديث آلي.
- [ ] صفحة المواقيت الشهرية + الطباعة + القبلة بالبوصلة.
- [ ] جدولة تنبيهات الأذان على الويب مع منع التكرار بين التبويبات (BroadcastChannel/Web Locks).
