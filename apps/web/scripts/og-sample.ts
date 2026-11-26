/** Dev helper: renders two sample share images to /tmp to eyeball Arabic shaping. Run from apps/web: pnpm tsx scripts/og-sample.ts */
import { writeFileSync } from 'node:fs';
import Module from 'node:module';
const orig = (Module as unknown as { _load: (r: string, ...a: unknown[]) => unknown })._load; (Module as unknown as { _load: unknown })._load = function (r: string, ...a: unknown[]) { return r === 'server-only' ? {} : orig.call(this, r, ...a); };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { atharSvg, renderPng } = require('../src/lib/og') as typeof import('../src/lib/og');
writeFileSync('/tmp/og1.png', renderPng(atharSvg('أمي الغالية فاطمة بنت عبد الله', 'اللهم اغفر لها وارحمها واجعل قبرها روضة من رياض الجنة')));
writeFileSync('/tmp/og2.png', renderPng(atharSvg('Grandfather Yusuf Abdulrahman', 'نسألكم الدعاء')));
console.log('ok');
