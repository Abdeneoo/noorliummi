#!/usr/bin/env bash
# Downloads the pinned OpenDua recordings (CC BY 4.0) into the web app's public folder, verified by SHA-256.
# Idempotent: does nothing if the files are already there.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/apps/web/public/audio/adhkar"
URL=https://audio.opendua.org/hisn/v0.0.2/opendua-audio-hisn-v0.0.2.zip
SUM=$(cut -d' ' -f1 "$ROOT/database/sources/opendua/AUDIO_SHA256")
if [ -d "$DEST" ] && [ "$(find "$DEST" -name 'OD-*.mp3' | wc -l)" -ge 249 ]; then echo "opendua audio: present"; exit 0; fi
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
curl -fsS -m 600 -o "$TMP/a.zip" "$URL"
echo "$SUM  $TMP/a.zip" | sha256sum -c --quiet - || { echo "opendua audio: CHECKSUM MISMATCH — not installed"; exit 1; }
mkdir -p "$TMP/x" "$DEST"
python3 -I -m zipfile -e "$TMP/a.zip" "$TMP/x"
find "$TMP/x" -name 'OD-*.mp3' -exec cp {} "$DEST/" \;
echo "opendua audio: installed $(find "$DEST" -name 'OD-*.mp3' | wc -l) files"
