-- Admin by account: an account marked is_admin enters /admin after signing in normally (no token to copy each time).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
