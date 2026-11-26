-- Athar page details chosen by its owner: wording of the dua (man / woman / several), relation, optional date of death, recorded duas.
ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'm' CHECK (gender IN ('m', 'f', 'pl'));
ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS relation text NOT NULL DEFAULT '' CHECK (char_length(relation) <= 40);
ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS died_on date;
ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS audio_set text NOT NULL DEFAULT 'od-dead' CHECK (audio_set ~ '^(none|od-dead|ih-[0-9]{1,9}|quran-duas)$');
