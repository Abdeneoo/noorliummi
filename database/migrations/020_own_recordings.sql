-- Noor Li Ummi's own recordings: uploaded by the admin after a reciter's written consent, reviewed, then published.
CREATE TABLE IF NOT EXISTS own_recordings (
  id            bigserial PRIMARY KEY,
  reciter_ar    text NOT NULL CHECK (char_length(reciter_ar) BETWEEN 2 AND 80),
  reciter_en    text NOT NULL DEFAULT '' CHECK (char_length(reciter_en) <= 80),
  title         text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  dua_text      text NOT NULL DEFAULT '' CHECK (char_length(dua_text) <= 4000),
  dua_source    text NOT NULL DEFAULT '' CHECK (char_length(dua_source) <= 300),
  file_name     text NOT NULL,
  sha256        text NOT NULL UNIQUE,
  bytes         bigint NOT NULL,
  mime          text NOT NULL,
  consent       text NOT NULL DEFAULT '' CHECK (char_length(consent) <= 2000),
  consent_date  date,
  rights        text[] NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'review' CHECK (status IN ('review', 'approved', 'published', 'rejected')),
  review_notes  text NOT NULL DEFAULT '' CHECK (char_length(review_notes) <= 2000),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
