import type { Metadata } from 'next';
import AtharForm from '@/components/AtharForm';
export const metadata: Metadata = { title: 'صفحة أثر — صدقة جارية', robots: { index: false, follow: false } };
export default function Athar() {
  return (
    <article style={{ maxWidth: 720, margin: '24px auto' }}>
      <h1>صفحة أثر</h1>
      <p>اصنع صفحة بسيطة تُهديها لمن تحب، حيًّا كان أو ميتًا: تختار فيها سورًا وأذكارًا من الموقع، وتكتب إهداءك ودعاءك، ثم تشارك رابطها مع أهلك وأصدقائك ليقرؤوا ويدعوا.</p>
      <ul className="note">
        <li>الصفحة لا تظهر في محركات البحث ولا في أي قائمة؛ يصل إليها من معه الرابط فقط.</li>
        <li>لا حساب ولا تسجيل. التعديل والحذف من الجهاز الذي أنشأها.</li>
        <li>لا عدّادات ولا إحصاءات للزوار.</li>
      </ul>
      <AtharForm />
    </article>
  );
}
