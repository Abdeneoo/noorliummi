-- Review decisions for adhan recordings from public collections (metadata only; no audio is stored here).
-- Publishing a recording still requires an entry in database/sources/adhan/registry.json with documented rights.
CREATE TABLE IF NOT EXISTS adhan_review (
  item_id     text PRIMARY KEY CHECK (item_id ~ '^[a-z0-9-]{3,64}$'),
  status      text NOT NULL CHECK (status IN ('pending', 'permission_requested', 'approved', 'rejected')),
  note        text NOT NULL DEFAULT '' CHECK (char_length(note) <= 1000),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
