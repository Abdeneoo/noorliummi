-- «بلّغ عن خطأ»: a visitor reports a mistake in a text (what is wrong, what is right, with a source). No account, no contact data.
CREATE TABLE IF NOT EXISTS content_reports (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  wrong text NOT NULL,
  correct text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_reports_open_idx ON content_reports (created_at DESC) WHERE status = 'open';
