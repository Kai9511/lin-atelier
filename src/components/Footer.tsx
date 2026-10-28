import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  const ig = site.instagram;
  return (
    <footer className="mt-12 border-t border-line">
      <div className="shell grid gap-8 py-12 text-[12px] text-muted md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-ink">{site.name}</p>
          <p className="mt-2">© {new Date().getFullYear()} {site.name}. All artwork is the property of the artist.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-label md:justify-center">
          <Link href="/works" className="hover:text-ink">Works</Link>
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/contact" className="hover:text-ink">Contact</Link>
        </nav>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
          {ig.url ? (
            <a href={ig.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Instagram {ig.handle}
            </a>
          ) : (
            <span>Instagram {ig.handle}</span>
          )}
          <Link href="/admin" className="hover:text-ink">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
