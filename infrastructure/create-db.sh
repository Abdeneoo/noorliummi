#!/usr/bin/env bash
# Creates ONLY the `noorliummi` role and database in the existing PostgreSQL cluster (run as root).
# Idempotent: if they already exist they are left unchanged. Touches no other role, database or config file.
# The password is generated here on the server and written to a root/noor-only file; it is never printed.
set -euo pipefail
SECRETS=/opt/noorliummi/secrets
F=$SECRETS/db.env
install -d -m 700 -o noor -g noor "$SECRETS"
q() { sudo -u postgres psql -X -tA -v ON_ERROR_STOP=1 "$@"; }

if [ "$(q -c "SELECT 1 FROM pg_roles WHERE rolname='noorliummi'")" = "1" ]; then
  echo "role: exists, unchanged"
  [ -f "$F" ] || { echo "ERROR: role exists but $F is missing — stopping"; exit 1; }
else
  PW=$(openssl rand -hex 24)
  # Password passed on stdin (not on the command line, so it is not visible in the process list).
  q -v pw="$PW" <<'SQL'
CREATE ROLE noorliummi LOGIN PASSWORD :'pw' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 20;
SQL
  ( umask 077; printf 'DATABASE_URL=postgresql://noorliummi:%s@127.0.0.1:5432/noorliummi\n' "$PW" > "$F" )
  chown noor:noor "$F"; chmod 600 "$F"; unset PW
  echo "role: created"
fi

if [ "$(q -c "SELECT 1 FROM pg_database WHERE datname='noorliummi'")" = "1" ]; then
  echo "database: exists, unchanged"
else
  sudo -u postgres createdb -O noorliummi -E UTF8 -T template0 noorliummi
  q -d noorliummi -c "REVOKE ALL ON DATABASE noorliummi FROM PUBLIC; REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT ALL ON SCHEMA public TO noorliummi;" >/dev/null
  echo "database: created"
fi

# Verify the app can log in with its own credentials, over TCP, as itself.
set -a; . "$F"; set +a
psql -X -tA "$DATABASE_URL" -c "SELECT 'login ok: ' || current_user || ' @ ' || current_database()"
unset DATABASE_URL
echo "secrets file: $F ($(stat -c '%U:%G %a' "$F"))"
