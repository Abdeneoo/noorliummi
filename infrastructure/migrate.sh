#!/usr/bin/env bash
# Applies database/migrations/*.sql in order, once each, to the noorliummi database only.
# Usage: DATABASE_URL=... bash infrastructure/migrate.sh   (run as the app user)
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is not set}"
DIR="$(cd "$(dirname "$0")/../database/migrations" && pwd)"
psql -X -q -v ON_ERROR_STOP=1 -c "SET client_min_messages=warning" "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"
for f in "$DIR"/*.sql; do
  n=$(basename "$f")
  if [ "$(psql -X -tA "$DATABASE_URL" -v n="$n" <<< "SELECT 1 FROM schema_migrations WHERE name = :'n'")" = "1" ]; then continue; fi
  { echo "BEGIN;"; cat "$f"; echo; echo "INSERT INTO schema_migrations(name) VALUES ('$n');"; echo "COMMIT;"; } | psql -X -q -v ON_ERROR_STOP=1 "$DATABASE_URL"
  echo "migration applied: $n"
done
echo "migrations: up to date"
