-- Accounts can be blocked by the moderator (misuse). Blocked accounts cannot sign in.
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
-- Privacy-preserving usage counts: page opens per site section per day. No IP, cookie, user id or full URL is stored.
-- section '_visit' counts browser sessions (first page of a session).
CREATE TABLE IF NOT EXISTS page_stats (
  day date NOT NULL,
  section text NOT NULL,
  views int NOT NULL DEFAULT 0,
  PRIMARY KEY (day, section)
);
