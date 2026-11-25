#!/usr/bin/env bash
# Daily backup of the noorliummi database ONLY (run as the app user by noorliummi-backup.timer).
# Custom-format pg_dump, verified with pg_restore --list, kept 14 days + the newest Sunday dumps for 8 weeks.
# If /opt/noorliummi/secrets/backup.age.pub exists and `age` is installed, the dump is encrypted to that public key
# (the private key never lives on this server). Otherwise it stays in a mode-700 folder only the app user can read.
set -euo pipefail
umask 077
HOME_DIR=${NOOR_HOME:-/opt/noorliummi}; OUT=$HOME_DIR/backups; mkdir -p "$OUT"; chmod 700 "$OUT"
set -a; . "$HOME_DIR/secrets/db.env"; set +a
ts=$(date -u +%Y%m%dT%H%M%SZ); f="$OUT/noorliummi-$ts.dump"
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file="$f.part"
pg_restore --list "$f.part" > /dev/null   # fails if the dump is unreadable
mv "$f.part" "$f"
if [ -f "$HOME_DIR/secrets/backup.age.pub" ] && command -v age >/dev/null; then
  age -R "$HOME_DIR/secrets/backup.age.pub" -o "$f.age" "$f" && rm -f "$f" && f="$f.age"
fi
echo "backup ok: $(basename "$f") $(stat -c %s "$f") bytes"
# Retention: keep everything from the last 14 days, plus Sunday backups for 8 weeks.
find "$OUT" -name 'noorliummi-*.dump*' -mtime +14 -print0 | while IFS= read -r -d '' old; do
  d=$(basename "$old" | sed -E 's/noorliummi-([0-9]{8}).*/\1/')
  if [ "$(date -u -d "$d" +%u)" = "7" ] && [ "$(find "$old" -mtime -56 | wc -l)" = "1" ]; then continue; fi
  rm -f "$old"
done
