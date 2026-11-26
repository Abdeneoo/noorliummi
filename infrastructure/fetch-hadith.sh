#!/usr/bin/env bash
# Downloads pinned hadith sources and verifies each SHA-256:
#  - fawazahmed0/hadith-api Arabic editions (Unlicense)
#  - OpenITI RELEASE: Musnad Ahmad and Sunan al-Darimi (CC BY-NC-SA 4.0)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
get() { # url sum target
  if [ -f "$3" ] && echo "$2  $3" | sha256sum -c --quiet - 2>/dev/null; then return; fi
  curl -fsS -m 600 -o "$3.part" "$1"
  echo "$2  $3.part" | sha256sum -c --quiet - || { rm -f "$3.part"; echo "hadith: CHECKSUM MISMATCH $3 — stopping"; exit 1; }
  mv "$3.part" "$3"
}
D="$ROOT/database/sources/hadith-fawazahmed0"; C=$(cat "$D/SOURCE_COMMIT"); mkdir -p "$D/files"
while read -r sum f; do get "https://raw.githubusercontent.com/fawazahmed0/hadith-api/$C/editions/$f" "$sum" "$D/files/$f"; done < "$D/SHA256SUMS"
# Urdu, Turkish and Indonesian editions of the same books (same hadith numbering), from the same pinned commit.
while read -r sum f; do get "https://raw.githubusercontent.com/fawazahmed0/hadith-api/$C/editions/${f%.json}.min.json" "$sum" "$D/files/$f"; done < "$D/TRANSLATIONS_SHA256SUMS"
O="$ROOT/database/sources/hadith-openiti"; OC=$(cat "$O/SOURCE_COMMIT"); mkdir -p "$O/files"
while read -r sum key path; do get "https://raw.githubusercontent.com/OpenITI/RELEASE/$OC/$path" "$sum" "$O/files/$key.txt"; done < "$O/FILES"
B="$ROOT/database/sources/library-openiti"; BC=$(cat "$B/SOURCE_COMMIT"); mkdir -p "$B/files"
while read -r sum key path; do get "https://raw.githubusercontent.com/OpenITI/RELEASE/$BC/$path" "$sum" "$B/files/$key.txt"; done < "$B/FILES"
B2="$ROOT/database/sources/library-openiti-0775"; B2C=$(cat "$B2/SOURCE_COMMIT"); mkdir -p "$B2/files"
while read -r sum key path; do get "https://raw.githubusercontent.com/OpenITI/0775AH/$B2C/$path" "$sum" "$B2/files/$key.txt"; done < "$B2/FILES"
B3="$ROOT/database/sources/library-openiti-0600"; B3C=$(cat "$B3/SOURCE_COMMIT"); mkdir -p "$B3/files"
while read -r sum key path; do get "https://raw.githubusercontent.com/OpenITI/0600AH/$B3C/$path" "$sum" "$B3/files/$key.txt"; done < "$B3/FILES"
echo "hadith sources: verified $(wc -l < "$D/SHA256SUMS") + $(wc -l < "$O/FILES") files"
