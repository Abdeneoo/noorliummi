'use client';
/** Print / save as PDF (A4). The print stylesheet hides navigation and buttons. */
export default function PrintButton({ label = 'اطبع (A4 / PDF)' }: { label?: string }) {
  return <button type="button" className="btn ghost small no-print" onClick={() => window.print()}>{label}</button>;
}
