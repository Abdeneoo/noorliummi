'use client';
import { useState } from 'react';
import { downloadIcs, fridayIcs } from '@/lib/ics';
/** «تذكير الجمعة»: a weekly calendar event for surat al-Kahf and dua, with a link to an athar page (or al-Kahf). */
export default function FridayReminder({ path = '/quran/18', name }: { path?: string; name?: string }) {
  const [hour, setHour] = useState(9);
  const title = name ? `سورة الكهف والدعاء لـ${name}` : 'سورة الكهف والصلاة على النبي ﷺ';
  return (
    <div className="row friday">
      <div className="field" style={{ flex: '0 1 200px' }}><label htmlFor="fh">وقت التذكير كل جمعة</label>
        <select id="fh" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
          <option value={9}>صباحًا (٩:٠٠)</option><option value={13}>بعد الظهر (١:٠٠)</option><option value={16}>قبل المغرب (٤:٠٠ عصرًا)</option>
        </select></div>
      <button type="button" className="btn ghost" onClick={() => downloadIcs(fridayIcs({ title, url: `${location.origin}${path}`, hour, description: 'تذكير من نور لأمي' }))}>أضف تذكير الجمعة إلى التقويم</button>
    </div>
  );
}
