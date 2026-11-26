# IslamHouse — Translated Islamic Content Encyclopedia (phrase-aligned books)

- API: `https://cnt.islamhouse.com/api/v1/books/page-data/<book>?page_number=<n>&transes=<langs>` (docs: documenter.getpostman.com/view/5211979/2s8YzMZ6Fu)
- Snapshot taken 2026-11-26, stored verbatim (the API is not versioned, so the files are kept here and checked by SHA256SUMS):
  - `12290-1.json` — «الأذكار التي تقال صباحًا ومساءً -2» with Urdu, Turkish and Indonesian.
  - `12306-1..14.json` — «حصن المسلم - 4.0» with Urdu.
  - `818-1..19.json` — «التحقيق والإيضاح لكثير من مسائل الحج والعمرة والزيارة» (عبد العزيز بن باز) with Urdu, Turkish, Indonesian. Chosen by the owner for the manasik section.
  - `1181-1.json` — «فضل عشر ذي الحجة» (اللجنة العلمية بجمعية خدمة المحتوى الإسلامي باللغات) with Urdu and Indonesian (Turkish listed but empty).
  - `772-1..11.json` — «ما لا يسع أطفال المسلمين جهله» (الفريق العلمي بالجمعية) — Arabic original with Turkish and Indonesian. Chosen for the children's area.
- Policy: the publisher's republishing policy (README_AR of the IslamHouse API hub, read 2026-11-26) allows use without prior permission
  if the text is not modified and the source is named. We show each Arabic phrase with the publisher's own translation, unmodified.
- Not available in the source at snapshot time: a full Turkish Hisn al-Muslim; the Indonesian Hisn (book 819) lists `id` but returns no translations.
