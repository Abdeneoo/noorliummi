'use client';
import qrcode from 'qrcode-generator';
import { useState } from 'react';
/** Shows a QR code for a page of this site (built on the device) with a download button — to print or share. */
export default function QrButton({ path, label = 'رمز QR للصفحة', caption }: { path: string; label?: string; caption?: string }) {
  const [svg, setSvg] = useState('');
  const make = () => { if (svg) { setSvg(''); return; } const q = qrcode(0, 'M'); q.addData(`${location.origin}${path}`); q.make(); setSvg(q.createSvgTag({ cellSize: 6, margin: 4, scalable: true })); };
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')], { type: 'image/svg+xml' })); a.download = 'noor-li-ummi-qr.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  return (
    <div className="qr">
      <button type="button" className="btn ghost" onClick={make} aria-expanded={!!svg}>{label}</button>
      {svg && <div className="qr-box"><div className="qr-svg" dangerouslySetInnerHTML={{ __html: svg }} />{caption && <p className="note" style={{ margin: 0 }}>{caption}</p>}
        <div className="row" style={{ justifyContent: 'center' }}><button type="button" className="btn small" onClick={download}>تنزيل الرمز</button><button type="button" className="btn ghost small" onClick={() => window.print()}>طباعة</button></div></div>}
    </div>
  );
}
