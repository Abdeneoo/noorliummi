# TECHNICAL ARCHITECTURE (مبدئية — تُعتمد بعد تقرير الـVPS)

- **Monorepo** pnpm، TypeScript.
- **Frontend**: Next.js (App Router) + Tailwind + next-intl، SSG لصفحات السور والآيات، PWA مع Service Worker للعمل دون إنترنت.
- **المنطق المشترك**: `packages/prayer-engine` و`packages/islamic-core` تعمل في المتصفح والخادم والجوال.
- **Backend**: Modular Monolith (NestJS مرشح لتوحيد اللغة مع الواجهة) + OpenAPI.
- **Database**: PostgreSQL، مع FTS للبحث مبدئيًا؛ Meilisearch فقط إذا سمحت الذاكرة وبرّر الأداء.
- **Infra**: Docker Compose على Hostinger VPS في شبكة ومجلد معزولين عن المشاريع القائمة، Caddy أو Nginx حسب ما هو مثبت فعلًا (لن نستبدل الخادم الحالي)، Cloudflare أمامه بعد الموافقة.
- **الخصوصية**: المواقيت والقبلة محلية في المتصفح، لا يُرسل الموقع للخادم.
