-- Athar (sadaqah-jariyah) pages. See docs/DATABASE_SCHEMA.md. Idempotent.
CREATE TABLE IF NOT EXISTS memorial_pages (
  id              bigserial PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  display_name    text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  dedication      text NOT NULL DEFAULT '' CHECK (char_length(dedication) <= 300),
  dua_text        text NOT NULL DEFAULT '' CHECK (char_length(dua_text) <= 1000),
  visibility      text NOT NULL DEFAULT 'unlisted' CHECK (visibility IN ('unlisted', 'private')),
  noindex         boolean NOT NULL DEFAULT true,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'removed')),
  report_count    integer NOT NULL DEFAULT 0,
  edit_token_hash text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE TABLE IF NOT EXISTS memorial_page_content (
  page_id bigint NOT NULL REFERENCES memorial_pages(id) ON DELETE CASCADE,
  kind    text NOT NULL CHECK (kind IN ('surah', 'dhikr')),
  ref     integer NOT NULL,
  sort    smallint NOT NULL,
  PRIMARY KEY (page_id, sort)
);
CREATE TABLE IF NOT EXISTS content_reports (
  id          bigserial PRIMARY KEY,
  target_type text NOT NULL,
  target_id   bigint NOT NULL,
  reason      text NOT NULL CHECK (char_length(reason) <= 300),
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_reports_target ON content_reports (target_type, target_id);
