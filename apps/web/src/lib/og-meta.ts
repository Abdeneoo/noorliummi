import { createHash } from 'node:crypto';
/** The text line under the name: the creator's own dedication if there is one, else a neutral request for dua. */
export const ogLine = (dedication: string) => dedication.split('\n')[0].trim() || 'نسألكم الدعاء';
/** Changes whenever the name or line changes, so the image URL changes and link previews refresh. */
export const ogVersion = (name: string, dedication: string) => createHash('sha256').update(`${name}\n${ogLine(dedication)}`).digest('hex').slice(0, 10);
