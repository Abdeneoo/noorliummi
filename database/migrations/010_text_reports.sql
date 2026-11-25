-- 009 collided with the athar moderation table content_reports (created in 001), so it created nothing but a stray index.
-- Mistake reports on texts live in their own table.
DROP INDEX IF EXISTS content_reports_open_idx;
CREATE TABLE IF NOT EXISTS text_reports (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  wrong text NOT NULL,
  correct text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS text_reports_open_idx ON text_reports (created_at DESC) WHERE status = 'open';
