'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return { supabase, user };
}

export async function loginAdmin(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const adminUsername = process.env.ADMIN_USERNAME ?? '';
  const adminEmail = process.env.ADMIN_EMAIL ?? '';

  if (!username || !password || username !== adminUsername || !adminEmail) {
    return { error: 'That username and password do not match. Please try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password });

  if (error) {
    return { error: 'That username and password do not match. Please try again.' };
  }

  redirect('/admin');
}

/**
 * Called by the dashboard after every change. Public pages are cached for speed;
 * this makes a new, edited, reordered or deleted artwork show up immediately.
 */
export async function revalidatePublic() {
  await requireUser();
  revalidatePath('/', 'layout');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function deleteInquiry(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get('id') ?? '');
  if (id) await supabase.from('inquiries').delete().eq('id', id);
  revalidatePath('/admin/inquiries');
}
