-- Small key/value settings the moderator can change (e.g. the Haramain live-stream ids).
CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
-- Scholarly review status per section. 'sourced' = documented source only; never set to 'reviewed' without a human reviewer's name.
CREATE TABLE IF NOT EXISTS review_status (
  section text PRIMARY KEY,
  status text NOT NULL DEFAULT 'sourced' CHECK (status IN ('sourced', 'pending', 'reviewed', 'needs_changes')),
  reviewer text NOT NULL DEFAULT '', note text NOT NULL DEFAULT '', reviewed_at date, updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'reviewed' OR (reviewer <> '' AND reviewed_at IS NOT NULL))
);
-- A student's recitation sent to the supervisor of a circle. The audio file lives outside the web root; never public.
CREATE TABLE IF NOT EXISTS recitations (
  id bigserial PRIMARY KEY,
  token text NOT NULL UNIQUE,                 -- random file name
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  circle_id bigint NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  surah smallint NOT NULL CHECK (surah BETWEEN 1 AND 114), ayah_from smallint NOT NULL, ayah_to smallint NOT NULL,
  mime text NOT NULL, bytes int NOT NULL,
  teacher_note text NOT NULL DEFAULT '', heard_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);
CREATE INDEX IF NOT EXISTS recitations_circle_idx ON recitations (circle_id, created_at DESC);
