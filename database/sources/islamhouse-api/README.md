# IslamHouse API v3 — survey and dua/adhkar audio

- API: `https://api3.islamhouse.com/v3/<public key>/…` (official docs: documenter.getpostman.com/view/7929737/TzkyMfPc). The public developer key is published in the docs; no registration.
- `survey-2026-11-26.json`: output of `apps/web/scripts/islamhouse-survey.mjs` (read-only requests): totals, counts per type for ar/en/ur/tr/id, 135 languages, 5,805 authors, reciters we looked for, dua/adhkar categories, Hisn al-Muslim items.
- `dua-audio-items.json`: the dua and adhkar audio items found (item, people, MP3 attachments on d1.islamhouse.com).
- Use: streamed from IslamHouse's servers in the site player, unmodified, with the item, reader and IslamHouse named — the publisher's republishing policy (README_AR of the IslamHouse API hub, read 2026-11-26): use without prior permission if not modified and the source is named. Nothing is re-hosted.

## 2026-11-26 — full crawl of Arabic audio

- `crawl-ar-audios-2026-11-26.json`: every Arabic audio item (3,841, `main/audios/ar/ar/{page}/100/json`) filtered by title for دعاء/أدعية/أذكار/ذكر/رقية/قنوت/مناجاة/ابتهال/استغفار/حصن/تحصين — 88 matches, with item details (`main/get-item/{id}/ar/json`).
- Merged into `dua-audio-items.json` (new items with MP3 only; nothing duplicated). Includes the ruqyah recitations of Nasser Al-Qatami, Fares Abbad, Yasser Al-Dosari, Saad Al-Ghamdi, Mishary Alafasy, Ahmad Al-Ajami and Yasser Salama, a fourth Hisn al-Muslim reading (Walid Abu Ziyad), and lectures on dua and dhikr.
- Policy (README_AR of the IslamHouse API hub, read 2026-11-26): republishing, downloading and offline use allowed without prior permission, unmodified and with the source named. Producers named on an item (e.g. recording studios) are shown with it. A dated copy of the policy text is in `database/sources/rights/islamhouse-policy-2026-11-26.md`.
