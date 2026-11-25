-- Athar pages can be listed in the public directory when their creator opts in (default stays unlisted).
ALTER TABLE memorial_pages DROP CONSTRAINT IF EXISTS memorial_pages_visibility_check;
ALTER TABLE memorial_pages ADD CONSTRAINT memorial_pages_visibility_check CHECK (visibility IN ('unlisted', 'private', 'listed'));
CREATE INDEX IF NOT EXISTS memorial_pages_listed_idx ON memorial_pages (created_at DESC) WHERE visibility = 'listed' AND status = 'active';
