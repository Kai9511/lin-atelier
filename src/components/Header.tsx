'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home', labelCn: '首页' },
  { href: '/works', label: 'Works', labelCn: '作品' },
  { href: '/about', label: 'About', labelCn: '关于' },
  { href: '/contact', label: 'Contact', labelCn: '联系' },
];

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${
          scrolled && !open ? 'border-b border-line/60 bg-paper/90 backdrop-blur' : 'border-b border-transparent bg-paper'
        }`}
      >
        <div className="shell flex h-[76px] items-center justify-between md:h-[92px]">
          <Link href="/" className="font-display text-[21px] uppercase tracking-[0.06em]">
            {name}
          </Link>

          <nav aria-label="Main" className="hidden gap-9 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className="group relative py-2"
              >
                <span className="flex flex-col items-center gap-[1px]">
                  <span className="block text-[12px] tracking-wide">{l.labelCn}</span>
                  <span className="block text-[9px] uppercase tracking-label">{l.label}</span>
                </span>
                <span
                  className={`absolute bottom-[3px] left-0 h-px bg-ink transition-all duration-500 ease-gallery ${
                    isActive(l.href) ? 'right-0' : 'right-full group-hover:right-0'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="label -mr-2 p-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="flex flex-col items-center gap-[1px]">
                <span className="text-[11px]">关闭</span>
                <span className="text-[9px] uppercase tracking-label opacity-50">Close</span>
              </span>
            ) : (
              <span className="flex flex-col items-center gap-[1px]">
                <span className="text-[11px]">菜单</span>
                <span className="text-[9px] uppercase tracking-label opacity-50">Menu</span>
              </span>
            )}
          </button>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-30 animate-fade-in bg-paper pt-[76px] md:hidden">
          <nav aria-label="Main" className="shell flex h-full flex-col justify-center gap-6 pb-24">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`${isActive(l.href) ? 'text-ink' : 'text-ink/55'}`}
              >
                <span className="font-display text-5xl tracking-[-0.03em]">{l.labelCn}</span>
                <span className="block text-[13px] uppercase tracking-label mt-1">{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
