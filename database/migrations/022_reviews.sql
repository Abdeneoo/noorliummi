-- Shar'i review by named reviewers: each gets a private link (only its SHA-256 is stored) and marks items «سليم» or «فيه ملاحظة».
CREATE TABLE IF NOT EXISTS reviewers (
  id          bigserial PRIMARY KEY,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  token_hash  text NOT NULL UNIQUE,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS review_marks (
  reviewer_id bigint NOT NULL REFERENCES reviewers(id) ON DELETE CASCADE,
  item_key    text NOT NULL CHECK (char_length(item_key) BETWEEN 1 AND 120),
  verdict     text NOT NULL CHECK (verdict IN ('ok', 'note')),
  note        text NOT NULL DEFAULT '' CHECK (char_length(note) <= 4000),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (reviewer_id, item_key)
);
