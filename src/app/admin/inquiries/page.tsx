import { redirect } from 'next/navigation';
import { deleteInquiry } from '@/app/admin/actions';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SetupNotice } from '@/components/admin/SetupNotice';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { Inquiry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  const inquiries = (data ?? []) as Inquiry[];

  return (
    <>
      <AdminHeader email={process.env.ADMIN_USERNAME} current="inquiries" />
      <div className="shell py-10">
        <h1 className="font-display text-4xl">
          Inquiries <span className="text-muted">({inquiries.length})</span>
        </h1>
        {error && <p className="mt-6 text-[#8b332d]">Could not load messages: {error.message}</p>}
        {!error && inquiries.length === 0 && <p className="mt-10 text-muted">No messages yet.</p>}

        <ul className="mt-10 max-w-3xl border-t border-line">
          {inquiries.map((q) => (
            <li key={q.id} className="border-b border-line py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="font-display text-2xl">{q.name}</p>
                <p className="text-[12px] text-muted">
                  {new Date(q.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <p className="mt-1 text-[13px]">
                <a href={`mailto:${q.email}`} className="underline underline-offset-4">
                  {q.email}
                </a>
                <span className="text-muted">
                  {' '}
                  · {q.topic}
                  {q.artwork_slug ? ` · ${q.artwork_slug}` : ''}
                </span>
              </p>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.8]">{q.message}</p>
              <form action={deleteInquiry} className="mt-4">
                <input type="hidden" name="id" value={q.id} />
                <button type="submit" className="label text-muted underline underline-offset-4 hover:text-[#8b332d]">
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
