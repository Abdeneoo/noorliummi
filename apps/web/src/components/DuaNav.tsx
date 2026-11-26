import Link from 'next/link';
const L: [string, string][] = [['/duas', 'الرئيسية'], ['/duas/hal', 'ادعُ بما يناسب حالك'], ['/duas/quran', 'أدعية القرآن'], ['/duas/sunnah', 'أدعية السنة'], ['/duas/c/rabbana', 'ربنا'], ['/duas/c/rabbi', 'ربِّ'], ['/books/adiya-jamia', 'جوامع الدعاء'], ['/duas/audio', 'المكتبة الصوتية'], ['/duas/adab', 'فضل الدعاء وآدابه وأوقاته'], ['/ruqyah', 'الرقية'], ['/sadaqah/parents', 'البر بالوالدين بعد وفاتهما']];
export default function DuaNav() {
  return <nav className="card" aria-label="أقسام الأدعية" style={{ marginBottom: 16 }}><ul className="chips even">{L.map(([h, t]) => <li key={h}><Link href={h}>{t}</Link></li>)}</ul></nav>;
}
