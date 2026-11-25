import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'الإهداء' };
// Text supplied by the project owner (MASTER_PLAN §06). Will move to admin-editable settings.
export default function Dedication() {
  return (
    <article className="card dedication" style={{ maxWidth: 720, margin: '24px auto', padding: '40px 28px', fontSize: '1.1rem', lineHeight: 2.2 }}>
      <h1 style={{ color: 'var(--accent-strong)', fontSize: '1.7rem', marginTop: 0 }}>إهداء</h1>
      <p>إلى أمي الغالية، التي رحلت عن عيني ولم ترحل عن قلبي.</p>
      <p>أُنشئ هذا المشروع ابتغاء وجه الله، ورجاء أن يكون صدقة جارية عن روح والدتي، وأن يصل إليها ثواب كل علم نافع وكل خير ينتفع به الناس من خلاله.</p>
      <p>نسألكم الدعاء لها بالرحمة والمغفرة.</p>
      <p style={{ color: 'var(--accent-strong)' }}>اللهم اغفر لها وارحمها، وآنس وحشتها، ونوّر قبرها، واجعلها من أهل الفردوس الأعلى، واجمعنا بها في جنتك لقاءً لا فراق بعده.</p>
    </article>
  );
}
