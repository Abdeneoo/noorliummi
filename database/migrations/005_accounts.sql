-- Optional accounts with passwordless email login (a one-time link). Only the email address is stored.
CREATE TABLE IF NOT EXISTS users (
  id          bigserial PRIMARY KEY,
  email       text NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 254),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS login_links (
  token_hash  text PRIMARY KEY,
  email       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_links_email_idx ON login_links (email, created_at DESC);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS owner_id bigint REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS memorial_pages_owner_idx ON memorial_pages (owner_id) WHERE owner_id IS NOT NULL;
