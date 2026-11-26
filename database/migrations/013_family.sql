-- Family content management: a parent (a signed-in account) creates child profiles and decides what each child may open.
-- The child uses a "child session" on a device; every child page and API checks these tables on the server.
CREATE TABLE IF NOT EXISTS children (
  id bigserial PRIMARY KEY,
  parent_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),      -- a first name or nickname chosen by the parent
  age_band text NOT NULL CHECK (age_band IN ('4-6', '7-9', '10-12', '13-15')),
  allowed jsonb NOT NULL DEFAULT '{}',                                 -- { sections: [], surahs: [], adhkar: [], lessons: [] }
  daily_minutes int CHECK (daily_minutes IS NULL OR daily_minutes BETWEEN 5 AND 600),
  pin_hash text NOT NULL,                                              -- scrypt hash of the parent's exit PIN
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS children_parent ON children(parent_id);
CREATE TABLE IF NOT EXISTS child_sessions (
  token_hash text PRIMARY KEY,
  child_id bigint NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_tick timestamptz
);
CREATE TABLE IF NOT EXISTS child_tasks (
  id bigserial PRIMARY KEY,
  child_id bigint NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  period text NOT NULL CHECK (period IN ('daily', 'weekly')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS child_task_done (
  task_id bigint NOT NULL REFERENCES child_tasks(id) ON DELETE CASCADE,
  period_key text NOT NULL,                                            -- '2026-11-26' for daily, '2026-W48' for weekly
  done_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, period_key)
);
CREATE TABLE IF NOT EXISTS child_usage (
  child_id bigint NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  day date NOT NULL,
  minutes int NOT NULL DEFAULT 0,
  PRIMARY KEY (child_id, day)
);
