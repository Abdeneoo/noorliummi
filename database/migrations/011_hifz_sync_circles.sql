-- Optional sync of memorisation progress for signed-in users (off unless the user turns it on).
CREATE TABLE IF NOT EXISTS hifz_sync (
  user_id bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,                 -- the same state the device keeps (cards and schedule)
  total int NOT NULL DEFAULT 0, learned int NOT NULL DEFAULT 0, due int NOT NULL DEFAULT 0,
  surahs int[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Circles: a teacher's halaqa or a family. The supervisor sees each member's chosen name and progress summary only.
CREATE TABLE IF NOT EXISTS circles (
  id bigserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'halaqa' CHECK (kind IN ('halaqa', 'family')),
  owner_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id bigint NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (circle_id, user_id)
);
-- A supervisor's note to a member (signed and dated; visible to that member).
CREATE TABLE IF NOT EXISTS circle_notes (
  id bigserial PRIMARY KEY,
  circle_id bigint NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
