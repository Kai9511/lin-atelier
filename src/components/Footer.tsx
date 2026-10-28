import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  const ig = site.instagram;
  return (
    <footer className="mt-12 border-t border-line">
      <div className="shell grid gap-8 py-12 text-[12px] text-muted md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-ink">{site.name}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {site.name}.<br />
            <span>所有作品版权归艺术家所有。</span>
            <span className="block">All artwork is the property of the artist.</span>
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 md:justify-center">
          <Link href="/works" className="hover:text-ink flex flex-col items-center gap-[1px]">
            <span className="text-[12px]">作品</span>
            <span className="text-[9px] uppercase tracking-label opacity-50">Works</span>
          </Link>
          <Link href="/about" className="hover:text-ink flex flex-col items-center gap-[1px]">
            <span className="text-[12px]">关于</span>
            <span className="text-[9px] uppercase tracking-label opacity-50">About</span>
          </Link>
          <Link href="/contact" className="hover:text-ink flex flex-col items-center gap-[1px]">
            <span className="text-[12px]">联系</span>
            <span className="text-[9px] uppercase tracking-label opacity-50">Contact</span>
          </Link>
        </nav>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
          {ig.url ? (
            <a href={ig.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Instagram {ig.handle}
            </a>
          ) : (
            <span>Instagram {ig.handle}</span>
          )}
          <Link href="/admin" className="hover:text-ink flex flex-col items-center gap-[1px]">
            <span className="text-[12px]">管理</span>
            <span className="text-[9px] uppercase tracking-label opacity-50">Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
