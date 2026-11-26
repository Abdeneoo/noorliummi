# IslamHouse API v3 — survey and dua/adhkar audio

- API: `https://api3.islamhouse.com/v3/<public key>/…` (official docs: documenter.getpostman.com/view/7929737/TzkyMfPc). The public developer key is published in the docs; no registration.
- `survey-2026-11-26.json`: output of `apps/web/scripts/islamhouse-survey.mjs` (read-only requests): totals, counts per type for ar/en/ur/tr/id, 135 languages, 5,805 authors, reciters we looked for, dua/adhkar categories, Hisn al-Muslim items.
- `dua-audio-items.json`: the dua and adhkar audio items found (item, people, MP3 attachments on d1.islamhouse.com).
- Use: streamed from IslamHouse's servers in the site player, unmodified, with the item, reader and IslamHouse named — the publisher's republishing policy (README_AR of the IslamHouse API hub, read 2026-11-26): use without prior permission if not modified and the source is named. Nothing is re-hosted.
