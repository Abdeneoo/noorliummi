-- Athar pages may include one full-mushaf recitation by a chosen reciter (ref = index in apps/web/src/lib/reciters.ts, append-only).
ALTER TABLE memorial_page_content DROP CONSTRAINT IF EXISTS memorial_page_content_kind_check;
ALTER TABLE memorial_page_content ADD CONSTRAINT memorial_page_content_kind_check CHECK (kind IN ('surah', 'dhikr', 'reciter'));
