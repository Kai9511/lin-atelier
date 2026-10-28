import Link from 'next/link';
import { signOut } from '@/app/admin/actions';
import { site } from '@/lib/site';

export function AdminHeader({ email, current }: { email?: string | null; current: 'artworks' | 'inquiries' }) {
  const link = (active: boolean) =>
    `label border-b pb-1 ${active ? 'border-ink' : 'border-transparent text-muted hover:text-ink'}`;
  return (
    <header className="border-b border-line">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-xl uppercase tracking-[0.06em]">{site.name}</span>
          <span className="eyebrow">Admin</span>
        </div>
        <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <Link href="/admin" className={link(current === 'artworks')}>
            Artworks
          </Link>
          <Link href="/admin/inquiries" className={link(current === 'inquiries')}>
            Inquiries
          </Link>
          <Link href="/" target="_blank" className="label text-muted hover:text-ink">
            View site ↗
          </Link>
          <form action={signOut} className="flex items-center gap-3">
            {email && <span className="hidden text-[12px] text-muted sm:inline">{email}</span>}
            <button type="submit" className="label underline underline-offset-4">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
