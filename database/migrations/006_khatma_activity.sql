-- Group khatma («ختمة لأمي»): a shareable link where family and friends each take a juz' of the 30. No sign-in.
CREATE TABLE IF NOT EXISTS khatma_groups (
  id bigserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,            -- the person the khatma is dedicated to
  feminine boolean NOT NULL DEFAULT false, -- grammatical gender for the dua shown at completion
  athar_slug text,                       -- optional link to an athar page
  admin_token_hash text NOT NULL,
  round int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS khatma_juz (
  group_id bigint NOT NULL REFERENCES khatma_groups(id) ON DELETE CASCADE,
  round int NOT NULL,
  juz smallint NOT NULL CHECK (juz BETWEEN 1 AND 30),
  reader text NOT NULL DEFAULT '',       -- optional first name or nickname chosen by the reader
  claim_token_hash text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz,
  PRIMARY KEY (group_id, round, juz)
);
-- «قنديل النور»: how many times visitors prayed, read or said tasbeeh on an athar page. Counts only; no user data.
CREATE TABLE IF NOT EXISTS athar_activity (
  page_id bigint NOT NULL REFERENCES memorial_pages(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('dua', 'read', 'tasbeeh')),
  n bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (page_id, kind)
);
