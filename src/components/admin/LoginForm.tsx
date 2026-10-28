'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(data.get('email') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    });
    if (signInError) {
      setBusy(false);
      setError('That email and password do not match. Please try again.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-7">
      <div>
        <label htmlFor="email" className="eyebrow">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field-input" />
      </div>
      <div>
        <label htmlFor="password" className="eyebrow">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field-input" />
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-[#8b332d]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="label justify-self-start border border-ink bg-ink px-8 py-4 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
