# @noor/prayer-engine

Offline prayer times and Qibla for Noor Li Ummi, on top of Adhan JS (MIT).

```ts
import { getPrayerStatus, getDaySchedule, qiblaDirection, formatTime } from '@noor/prayer-engine';
const s = { latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh', method: 'UmmAlQura' } as const;
getDaySchedule(s, '2026-11-25');       // fajr…isha, middleOfTheNight, lastThirdOfTheNight
getPrayerStatus(s, new Date());        // current, next, remainingMs
qiblaDirection(24.7136, 46.6753);      // degrees from true north
```

Astronomical results may differ by minutes from official local tables; expose `adjustments` to users. Umm al-Qura Isha uses +120 min in Ramadan (toggle `ummAlQuraRamadanIsha`). Tests: `pnpm test`.
