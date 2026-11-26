-- Athar pages may play one of the site's ready-made playlists (pl-deceased, pl-parents, pl-mercy, ...).
ALTER TABLE memorial_pages DROP CONSTRAINT IF EXISTS memorial_pages_audio_set_check;
ALTER TABLE memorial_pages ADD CONSTRAINT memorial_pages_audio_set_check CHECK (audio_set ~ '^(none|od-dead|ih-[0-9]{1,9}|quran-duas|pl-[a-z]{2,12})$');
