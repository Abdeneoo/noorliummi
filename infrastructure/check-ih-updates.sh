#!/usr/bin/env bash
# Weekly: asks our own app to compare IslamHouse content (audio, Hisn al-Muslim editions, encyclopedia books) with the snapshot.
# The result is stored in site_settings ('ih.updates') and shown in the admin panel. Talks only to our app on localhost.
set -euo pipefail
HOME_DIR=${NOOR_HOME:-/opt/noorliummi}; PORT=${1:-3100}
set -a; . "$HOME_DIR/secrets/app.env" 2>/dev/null || true; set +a
[ -n "${ADMIN_TOKEN:-}" ] || { echo "ih-updates: ADMIN_TOKEN not set; skipped"; exit 0; }
curl -fsS -m 900 -X POST "http://127.0.0.1:$PORT/api/admin/content" -H 'content-type: application/json' -H 'x-noor-admin: 1' \
  -H "cookie: noor_admin=$ADMIN_TOKEN" --data '{"action":"updates"}' | head -c 2000; echo
