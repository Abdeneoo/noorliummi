/** A weekly Friday calendar event (.ics, RFC 5545) — added to Google/Apple Calendar from the file. Floating local time. */
export function fridayIcs({ title, url, hour, description }: { title: string; url: string; hour: number; description: string }): string {
  const now = new Date();
  const d = new Date(now); d.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
  const p = (n: number) => String(n).padStart(2, '0');
  const day = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const esc = (s: string) => s.replace(/[\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor Li Ummi//Friday reminder//AR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:friday-${day}-${Math.random().toString(36).slice(2)}@noorliummi`, `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${p(hour)}0000`, `DTEND:${day}T${p(hour)}3000`, 'RRULE:FREQ=WEEKLY;BYDAY=FR',
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(`${description}\n${url}`)}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
export function downloadIcs(body: string, name = 'friday-reminder.ics') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** A daily reminder event at the given local hour, starting today. */
export function dailyIcs({ title, url, hour }: { title: string; url: string; hour: number }): string {
  const now = new Date(); const p = (n: number) => String(n).padStart(2, '0');
  const day = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const esc = (x: string) => x.replace(/[\\;,]/g, (m) => `\\${m}`);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor Li Ummi//Daily wird//AR', 'BEGIN:VEVENT', `UID:wird-${day}-${Math.random().toString(36).slice(2)}@noorliummi`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, `DTSTART:${day}T${p(hour)}0000`, `DTEND:${day}T${p(hour)}1500`, 'RRULE:FREQ=DAILY',
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${url}`, `URL:${url}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
