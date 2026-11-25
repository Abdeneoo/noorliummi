import { notFound } from 'next/navigation';
/** Any unknown Arabic path renders the site's own 404 (with header and footer). */
export default function Missing() { notFound(); }
