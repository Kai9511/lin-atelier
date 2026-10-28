'use client';

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { inquiryTopics, site } from '@/lib/site';
import { createClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm({ artworkTitles }: { artworkTitles: { slug: string; title: string }[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Hidden field that real visitors never fill in. Bots do.
    if (String(data.get('website') ?? '')) {
      setStatus('sent');
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus('error');
      setError(`The form is not connected yet. Please write to ${site.email} instead.`);
      return;
    }

    setStatus('sending');
    setError('');
    const supabase = createClient();
    const { error: insertError } = await supabase.from('inquiries').insert({
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      topic: String(data.get('topic') ?? 'Other'),
      artwork_slug: String(data.get('artwork') ?? '') || null,
      message: String(data.get('message') ?? '').trim(),
    });

    if (insertError) {
      setStatus('error');
      setError(`Your message could not be sent. Please try again or write to ${site.email}.`);
      return;
    }
    form.reset();
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div role="status" className="animate-fade-in border-t border-ink py-10">
        <p className="font-display text-3xl">Thank you.</p>
        <p className="mt-3 max-w-sm leading-relaxed text-muted">
          Your message has arrived. You will receive a reply by email as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-7" noValidate={false}>
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow">Name</label>
          <input id="name" name="name" required maxLength={200} autoComplete="name" className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow">Email</label>
          <input id="email" name="email" type="email" required maxLength={320} autoComplete="email" className="field-input" />
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="topic" className="eyebrow">Regarding</label>
          <select id="topic" name="topic" className="field-input cursor-pointer rounded-none">
            {inquiryTopics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="artwork" className="eyebrow">Artwork (optional)</label>
          <select id="artwork" name="artwork" className="field-input cursor-pointer rounded-none">
            <option value="">None in particular</option>
            {artworkTitles.map((a) => (
              <option key={a.slug} value={a.slug}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow">Message</label>
        <textarea id="message" name="message" required rows={5} maxLength={5000} className="field-input resize-y" />
      </div>

      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="label border border-ink bg-ink px-8 py-4 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {status === 'error' && (
          <p role="alert" className="text-[13px] text-[#8b332d]">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
