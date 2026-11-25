# OpenITI — المكتبة: رياض الصالحين، والأذكار للنووي (نص كامل)
- Source: https://github.com/OpenITI/RELEASE at the commit in SOURCE_COMMIT (release 2025.1.9). Files, keys and SHA-256 in FILES; downloaded by `infrastructure/fetch-hadith.sh`, not stored in Git.
- Licence: **CC BY-NC-SA 4.0** — non-commercial, attribution "OpenITI: a Machine-Readable Corpus of Islamicate Texts", derived data shared alike. Checked 2026-11-26.
- Editions (from each file's #META# header, shown on the book page):
  - رياض الصالحين: تحقيق شعيب الأرنؤوط، مؤسسة الرسالة، بيروت، الطبعة الثالثة 1419هـ/1998م (Shamela 12014).
  - الأذكار المنتخبة من كلام سيد الأبرار: دار الكتاب العربي، بيروت، 1404هـ/1984م (JK 001249; OpenITI PRIMARY version).
- Processing (apps/web/src/lib/openiti-book.ts): only technical markup is removed or converted (line markers, ms.., PageV..P.. → page marks, @QB@/@QE@ → ﴿ ﴾, %~% → verse gap). Tested: no Arabic letter is lost. The text is the digitised edition as is, including any typing errors in it; Quran quotations inside it are the book's own unvocalised text, not our Tanzil text.
- No grading or commentary is added. Not reviewed by a scholar yet ("نسخة تجريبية").
