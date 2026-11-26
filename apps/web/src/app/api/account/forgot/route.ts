import { NextResponse } from 'next/server';
import { newResetToken, normEmail, sameSite } from '@/lib/auth';
import { mailEnabled, sendMail } from '@/lib/mail';
import { rateLimited } from '@/lib/db';

export const dynamic = 'force-dynamic';
const SITE = () => (process.env.SITE_URL || 'https://staging.noorliummi.io').replace(/\/$/, '');
export async function POST(req: Request) {
  if (!sameSite(req)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  if (!mailEnabled()) return NextResponse.json({ error: 'استعادة كلمة المرور بالبريد غير مفعّلة الآن.' }, { status: 503 });
  if (rateLimited(req, 'forgot', 6, 3600_000)) return NextResponse.json({ error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });
  let b: { email?: unknown } = {}; try { b = await req.json(); } catch { /* empty */ }
  const email = normEmail(b.email);
  if (!email) return NextResponse.json({ error: 'اكتب بريدًا إلكترونيًا صحيحًا.' }, { status: 400 });
  try {
    const t = await newResetToken(email);
    if (t) {
      // Token in the fragment: never sent to a server or kept in logs; the page needs the new password, so mail scanners cannot use it.
      const link = `${SITE()}/account/reset#t=${t}`;
      await sendMail(email, 'تعيين كلمة مرور جديدة — نور لأمي',
        `السلام عليكم،\n\nلتعيين كلمة مرور جديدة لحسابك في نور لأمي افتح هذا الرابط خلال 30 دقيقة:\n${link}\n\nإن لم تطلب ذلك فتجاهل هذه الرسالة؛ كلمة مرورك الحالية لم تتغير.\n\nنور لأمي — نورٌ لا ينطفئ، وأثرٌ لا ينقطع`,
        `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:16px;line-height:1.9;color:#24352F"><p>السلام عليكم،</p><p>لتعيين كلمة مرور جديدة لحسابك في <strong>نور لأمي</strong> اضغط الزر خلال 30 دقيقة:</p><p><a href="${link}" style="display:inline-block;background:#103D32;color:#F8F6F0;padding:12px 22px;border-radius:12px;text-decoration:none">عيّن كلمة مرور جديدة</a></p><p style="color:#56655F;font-size:13px">إن لم تطلب ذلك فتجاهل هذه الرسالة؛ كلمة مرورك الحالية لم تتغير.</p><p style="color:#80652E">نورٌ لا ينطفئ، وأثرٌ لا ينقطع</p></div>`);
    }
    // Same answer either way, so the form does not reveal whether an address has an account.
    return NextResponse.json({ ok: true });
  } catch (e) { console.error('reset mail failed', (e as Error).message); return NextResponse.json({ error: 'تعذّر إرسال البريد الآن. حاول لاحقًا.' }, { status: 503 }); }
}
