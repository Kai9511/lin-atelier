export function slugify(input: string) {
  const base = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'artwork';
}

/** Returns a slug that is not in `taken`, adding -2, -3 … when needed. */
export function uniqueSlug(title: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const base = slugify(title);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
