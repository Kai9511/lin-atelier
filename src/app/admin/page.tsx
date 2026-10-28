import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Dashboard } from '@/components/admin/Dashboard';
import { SetupNotice } from '@/components/admin/SetupNotice';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { Artwork } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <>
      <AdminHeader email={user.email} current="artworks" />
      <Dashboard initial={(data ?? []) as Artwork[]} loadError={error?.message} />
    </>
  );
}
