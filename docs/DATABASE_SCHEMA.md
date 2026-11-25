# DATABASE SCHEMA — مخطط قاعدة البيانات (PostgreSQL)

الحالة: **مسودة للشريحة الأولى، لم تُنفَّذ بعد كـ migrations.** تُضاف جداول كل شريحة عند الوصول إليها فقط.

## مبدأ: كل محتوى ديني له أصل موثّق
```
sources(id, name, url, content_type, license, attribution, local_storage_ok, redistribution_ok, verified_at, status)
content_versions(id, source_id→sources, version_label, checksum_sha256, imported_at, review_status, reviewed_by, notes)
```
`status`: approved | approved_conditions | unclear | rejected. المستورد يرفض أي مصدر ليس approved*.
`review_status`: imported | in_review | approved | rejected. الواجهة لا تعرض إلا approved.

## الشريحة 1 — القرآن والتفسير والتلاوة
```
quran_editions(id, slug, script[uthmani|simple], content_version_id)          -- للقراءة فقط
surahs(number PK 1..114, name_ar, name_translit, name_en, revelation[meccan|medinan], ayah_count, revelation_order)
ayahs(id, edition_id, surah_number, ayah_number, text, bismillah, juz, hizb_quarter, page, sajda,
      UNIQUE(edition_id, surah_number, ayah_number))
ayah_search(ayah_id PK, normalized_text, tsv tsvector)                          -- مشتق، للبحث فقط، لا يُعرض
tafsir_books(id, slug, title, author, language, content_version_id)
tafsir_entries(id, book_id, surah_number, ayah_from, ayah_to, text)
translation_books(id, slug, title, translator, language, content_version_id)
translation_entries(id, book_id, surah_number, ayah_number, text, footnotes)
reciters(id, slug, name_ar, name_en, riwayah, content_version_id)
recitations(id, reciter_id, kind[surah|ayah], base_url, hosting[stream|self], format, bitrate)
audio_timings(recitation_id, surah_number, ayah_number, start_ms, end_ms, PRIMARY KEY(...))
```
حماية النص: دور قاعدة البيانات الذي يستخدمه التطبيق له SELECT فقط على `ayahs` و`quran_editions`؛ الكتابة لدور المستورد وحده.

## الشريحة 2 — المواقيت والأذان
المواقيت تُحسب على جهاز المستخدم ولا تُخزَّن. الإعدادات في المتصفح (localStorage/IndexedDB) ما لم ينشئ حسابًا.
```
adhan_audio(id, title, muezzin_name, muezzin_verified bool, kind[fajr|regular|short], duration_s, format,
            file_path, checksum_sha256, source_url, license, permission_status, attribution,
            download_ok, redistribution_ok, content_version_id)
```

## الشريحة 3 — الأذكار
```
dhikr_categories(id, slug, title_ar, title_en, sort)
dhikr_entries(id, category_id, text_ar, repeat_count, reference, takhrij, content_version_id, sort)
dhikr_translations(entry_id, language, text)
```
`repeat_count` و`reference` يأتيان من المصدر فقط ولا يُدخلان يدويًا دون مرجع.

## الشريحة 4 — الإهداء والصدقة الجارية
```
site_settings(key PK, value jsonb, updated_at)                                   -- نص الإهداء، الهوية
memorial_pages(id, slug UNIQUE, display_name, dedication, dua_text, template, visibility[public|unlisted|private],
               noindex bool DEFAULT true, status[active|frozen|removed], report_count, edit_token_hash, created_at, updated_at, deleted_at)
memorial_page_content(page_id, kind[surah|ayah_range|dhikr_category|recitation], ref, sort)
content_reports(id, target_type, target_id, reason, created_at, status)
```
قيود: `dedication` و`dua_text` نص عادي يُرفض إن احتوى رابطًا؛ الصفحة تُجمَّد تلقائيًا عند تكرار البلاغات حتى المراجعة؛ الإنشاء محدود المعدل لكل IP.
لا عدادات حسنات. إحصاءات الصفحة (عدد الزيارات فقط) مجمّعة دون بيانات زوار.

## لاحقًا (عند شرائحها)
users, sessions, roles, hadith_*, khatmah_*, memorization_*, courses_*, mosques, notifications, audit_logs, feature_flags.
