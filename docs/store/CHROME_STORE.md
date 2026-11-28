# رفع «نور لأمي — ذكّرني» على متجر كروم

**الملف:** `noorliummi-extension.zip` (يُبنى بـ `node apps/extension/build.mjs`، ومنشور أيضًا على https://noorliummi.io/extension/noorliummi-extension.zip).

## الخطوات (لصاحب المشروع)
1. افتح https://chrome.google.com/webstore/devconsole وسجّل بحساب Google، وادفع رسوم التسجيل (5 دولار مرة واحدة).
2. «New item» ← ارفع ملف `noorliummi-extension.zip`.
3. املأ الحقول بالنصوص أدناه، وارفع الصورتين: `store-1280x800.png` (لقطة شاشة) و`promo-440x280.png` (البلاطة الصغيرة).
4. «Submit for review». المراجعة عادةً من يوم إلى بضعة أيام.

## Store listing
- **Name:** نور لأمي — ذكّرني
- **Summary (≤132):** مواقيت الصلاة والأذان، وتذكير الأذكار والورد والصيام، في متصفحك — بلا تتبع ولا جمع بيانات.
- **Category:** Lifestyle
- **Language:** Arabic (ومعها English)
- **Description (AR):**
  إضافة مجانية من منصة «نور لأمي» (صدقة جارية):
  • مواقيت الصلاة لمدينتك محسوبة على جهازك، والأذان عند دخول الوقت مع تنبيه قبل الصلاة.
  • تذكير بالأذكار من «حصن المسلم» بنصها وتخريجها، وتذكير الورد والصيام والضحى وقيام الليل.
  • القبلة والتاريخ الهجري، وكتم مؤقت أثناء الاجتماعات.
  • لا إعلانات، ولا حساب، ولا تتبع: الإعدادات على جهازك فقط.
- **Description (EN):**
  Free prayer times and adhan in your browser, reminders of authentic adhkar (Hisn al-Muslim) and daily wird, qibla and Hijri date. No ads, no account, no tracking — settings stay on your device.

## Privacy practices
- **Single purpose:** Prayer-time alerts and Islamic remembrance reminders.
- **Permissions:**
  - `storage`: حفظ الإعدادات على الجهاز.
  - `alarms`: مواعيد الأذان والتذكير.
  - `notifications`: إظهار تنبيه الصلاة والذكر.
  - `offscreen`: تشغيل صوت الأذان.
  - `geolocation`: (اختياري، بعد موافقة المستخدم) حساب المواقيت لموقعه؛ لا يُرسل الموقع لأي جهة.
  - `contextMenus`: أمر «ذكّرني» في القائمة.
- **Remote code:** No.
- **Data usage:** لا نجمع أي بيانات (اختر: does not collect user data).
- **Privacy policy URL:** https://noorliummi.io/privacy
