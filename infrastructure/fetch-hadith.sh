#!/usr/bin/env bash
# Downloads the pinned fawazahmed0/hadith-api Arabic editions (Unlicense) and verifies each SHA-256.
# The same files (same commit, same checksums) were collated against printed editions by samt-qa/open-hadith-data.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
D="$ROOT/database/sources/hadith-fawazahmed0"; C=$(cat "$D/SOURCE_COMMIT"); mkdir -p "$D/files"
while read -r sum f; do
  t="$D/files/$f"
  if [ -f "$t" ] && echo "$sum  $t" | sha256sum -c --quiet - 2>/dev/null; then continue; fi
  curl -fsS -m 300 -o "$t.part" "https://raw.githubusercontent.com/fawazahmed0/hadith-api/$C/editions/$f"
  echo "$sum  $t.part" | sha256sum -c --quiet - || { rm -f "$t.part"; echo "hadith: CHECKSUM MISMATCH $f — stopping"; exit 1; }
  mv "$t.part" "$t"
done < "$D/SHA256SUMS"
echo "hadith sources: verified $(wc -l < "$D/SHA256SUMS") files"
