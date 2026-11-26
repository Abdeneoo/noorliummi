-- Email + password accounts (replaces the one-time sign-in link). Passwords are stored only as scrypt hashes.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_set_at timestamptz;
-- Links are now used only for "forgot password".
ALTER TABLE login_links ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'login' CHECK (purpose IN ('login', 'reset'));
-- Failed sign-ins, to slow down password guessing for one address (kept 1 day).
CREATE TABLE IF NOT EXISTS login_failures (
  email  text NOT NULL,
  at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_failures_email_idx ON login_failures (email, at DESC);
