import { NextResponse } from 'next/server';
import { newLoginToken, normEmail, sameSite } from '@/lib/auth';
import { mailEnabled, sendMail } from '@/lib/mail';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
const SITE = () => (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (!mailEnabled()) return NextResponse.json({ error: 'الدخول بالبريد غير مفعّل بعد.' }, { status: 503 });
  if (rateLimited(req, 'login', 6, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: { email?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const email = normEmail(b.email);
  if (!email) return NextResponse.json({ error: 'اكتب بريدًا إلكترونيًا صحيحًا.' }, { status: 400 });
  try {
    const t = await newLoginToken(email);
    if (t) {
      // Token in the fragment: never sent to a server or kept in logs; the page asks for a tap so mail scanners cannot use the link.
      const link = `${SITE()}/account/verify#t=${t}`;
      await sendMail(email, 'رابط الدخول إلى نور لأمي',
        `السلام عليكم،\n\nلدخول حسابك في نور لأمي افتح هذا الرابط خلال 20 دقيقة:\n${link}\n\nإن لم تطلب الدخول فتجاهل هذه الرسالة.\n\nنور لأمي — نورٌ لا ينطفئ، وأثرٌ لا ينقطع`,
        `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:16px;line-height:1.9;color:#24352F"><p>السلام عليكم،</p><p>لدخول حسابك في <strong>نور لأمي</strong> اضغط الزر خلال 20 دقيقة:</p><p><a href="${link}" style="display:inline-block;background:#103D32;color:#F8F6F0;padding:12px 22px;border-radius:12px;text-decoration:none">ادخل إلى حسابي</a></p><p style="color:#56655F;font-size:13px">إن لم تطلب الدخول فتجاهل هذه الرسالة.</p><p style="color:#80652E">نورٌ لا ينطفئ، وأثرٌ لا ينقطع</p></div>`);
    }
    // Same answer either way, so the form does not reveal whether an address has an account or hit its limit.
    return NextResponse.json({ ok: true });
  } catch (e) { console.error('login mail failed', (e as Error).message); return NextResponse.json({ error: 'تعذّر إرسال البريد الآن. حاول لاحقًا.' }, { status: 503 }); }
}
