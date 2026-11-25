'use client';
import { useEffect } from 'react';
/** Reports a missing page (path only) to the self-hosted error log, so broken links can be fixed. */
export default function Report404() {
  useEffect(() => { try { navigator.sendBeacon?.('/api/log', JSON.stringify({ k: '404', m: 'not found', p: location.pathname, s: document.referrer.startsWith(location.origin) ? new URL(document.referrer).pathname : '' })); } catch { /* ignore */ } }, []);
  return null;
}
