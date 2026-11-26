-- Content waiting for (or holding) republishing permission. Managed from the admin panel; nothing here is published by itself.
CREATE TABLE IF NOT EXISTS content_rights (
  id              bigserial PRIMARY KEY,
  key             text NOT NULL UNIQUE CHECK (key ~ '^[a-z0-9-]{2,40}$'),
  title           text NOT NULL,
  author          text NOT NULL DEFAULT '',
  owner           text NOT NULL DEFAULT '',
  source_url      text NOT NULL DEFAULT '',
  contact         text NOT NULL DEFAULT '',
  permissions     text[] NOT NULL DEFAULT '{}',
  requested_on    date,
  status          text NOT NULL DEFAULT 'not_requested' CHECK (status IN ('not_requested', 'requested', 'approved', 'partial', 'refused')),
  approval        text NOT NULL DEFAULT '',
  publish_status  text NOT NULL DEFAULT 'held' CHECK (publish_status IN ('held', 'embed_only', 'published')),
  notes           text NOT NULL DEFAULT '',
  items           jsonb NOT NULL DEFAULT '[]',
  updated_at      timestamptz NOT NULL DEFAULT now()
);
