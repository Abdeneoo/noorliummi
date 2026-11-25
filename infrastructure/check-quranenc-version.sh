#!/usr/bin/env bash
# Warns (never fails) when QuranEnc has a newer version of the pinned English translation (their terms require updating).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PIN=$(cat "$ROOT/database/sources/quranenc-english-saheeh/VERSION")
LATEST=$(curl -fsS -m 20 https://quranenc.com/api/v1/translations/list/en 2>/dev/null | python3 -c "import sys,json;print([t['version'] for t in json.load(sys.stdin)['translations'] if t['key']=='english_saheeh'][0])" 2>/dev/null)
if [ -z "$LATEST" ]; then echo "quranenc: could not check latest version (pinned $PIN)"; elif [ "$LATEST" != "$PIN" ]; then echo "quranenc: WARNING newer version $LATEST available (pinned $PIN) — update required by QuranEnc terms"; else echo "quranenc: up to date ($PIN)"; fi
exit 0
