import Link from 'next/link';
import { LoginForm } from '@/components/admin/LoginForm';
import { SetupNotice } from '@/components/admin/SetupNotice';
import { isSupabaseConfigured } from '@/lib/env';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="shell grid min-h-screen content-center gap-10 py-16 sm:max-w-[560px]">
      <div>
        <p className="eyebrow mb-4">{site.name}</p>
        <h1 className="page-title">Admin</h1>
        <p className="mt-6 text-muted">Sign in to add and manage artwork.</p>
      </div>
      <LoginForm />
      <Link href="/" className="label text-muted hover:text-ink">
        ← Back to the site
      </Link>
    </div>
  );
}
