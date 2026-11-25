-- Dedicated group pages beyond the Quran khatma: a shared dhikr with a target count, or a shared dua.
ALTER TABLE khatma_groups ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'quran' CHECK (kind IN ('quran', 'dhikr', 'dua'));
ALTER TABLE khatma_groups ADD COLUMN IF NOT EXISTS phrase smallint NOT NULL DEFAULT 0;   -- index in the fixed dhikr list (lib/dhikr-phrases.ts)
ALTER TABLE khatma_groups ADD COLUMN IF NOT EXISTS target int NOT NULL DEFAULT 0;        -- 0 = no target
ALTER TABLE khatma_groups ADD COLUMN IF NOT EXISTS count bigint NOT NULL DEFAULT 0;      -- times said / prayed by all participants
