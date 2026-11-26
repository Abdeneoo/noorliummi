export default function FiqhSearchBox({ q = '' }: { q?: string }) {
  return (
    <form action="/fiqh/search" method="get" role="search" className="row" style={{ margin: '12px 0' }}>
      <input type="search" name="q" defaultValue={q} required minLength={2} placeholder="ابحث في الفقه: التيمم، سجود السهو، قضاء الصيام…" aria-label="البحث في قسم الفقه" style={{ flex: '1 1 260px' }} />
      <button className="btn">بحث</button>
    </form>
  );
}
