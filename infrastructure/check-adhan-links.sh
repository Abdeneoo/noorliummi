#!/usr/bin/env bash
# Weekly check that every streamed adhan recording still answers (HEAD request, no download).
# Writes a report the admin panel can read: $NOOR_HOME/reports/adhan-links.json
set -euo pipefail
NOOR_HOME="${NOOR_HOME:-/opt/noorliummi}"
CAT="$NOOR_HOME/app/database/sources/adhan-collections/catalogue.json"
OUT="$NOOR_HOME/reports"; mkdir -p "$OUT"
python3 -I - "$CAT" "$OUT/adhan-links.json" <<'PY'
import json, sys, subprocess, datetime
cat = json.load(open(sys.argv[1])); res = {}
for r in cat['items']:
    u = r.get('url')
    if r['status'] != 'stream' or not u: continue
    c = subprocess.run(['curl', '-s', '-o', '/dev/null', '-I', '-L', '-m', '20', '-w', '%{http_code}', u], capture_output=True, text=True).stdout
    res[r['id']] = c
bad = {k: v for k, v in res.items() if v != '200'}
json.dump({'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'total': len(res), 'failed': bad}, open(sys.argv[2], 'w'))
print(f"adhan links: {len(res) - len(bad)}/{len(res)} ok, {len(bad)} failed")
PY
