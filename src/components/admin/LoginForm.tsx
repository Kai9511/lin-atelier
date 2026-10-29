'use client';

import { useActionState } from 'react';
import { loginAdmin } from '@/app/admin/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, null);

  return (
    <form action={action} className="grid gap-7">
      <div>
        <label htmlFor="username" className="eyebrow">Username</label>
        <input id="username" name="username" type="text" required autoComplete="username" className="field-input" />
      </div>
      <div>
        <label htmlFor="password" className="eyebrow">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field-input" />
      </div>
      {state?.error && (
        <p role="alert" className="text-[13px] text-[#8b332d]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="label justify-self-start border border-ink bg-ink px-8 py-4 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
