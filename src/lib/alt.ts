import { site } from '@/lib/site';
import type { Artwork } from '@/lib/types';

/** Alt text: the artist's own description when given, otherwise a readable default. */
export function artAlt(a: Artwork) {
  if (a.alt_text && a.alt_text.trim()) return a.alt_text.trim();
  const parts = [a.title];
  if (a.medium) parts.push(a.medium.toLowerCase());
  const base = parts.join(', ');
  return `${base}${a.year ? `, ${a.year}` : ''}, by ${site.name}`;
}
