'use client';
import { useEffect } from 'react';
/** Adds .in to every .reveal element as it scrolls into view (content is visible without JS). */
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    // Safety net: never leave content hidden (print, screenshots, background tabs).
    const t = window.setTimeout(() => els.forEach((e) => e.classList.add('in')), 2500);
    window.addEventListener('beforeprint', () => els.forEach((e) => e.classList.add('in')));
    return () => { io.disconnect(); clearTimeout(t); };
  });
  return null;
}
