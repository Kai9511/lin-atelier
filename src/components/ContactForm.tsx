'use client';

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { inquiryTopics, inquiryTopicsCn, site } from '@/lib/site';
import { createClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm({ artworkTitles }: { artworkTitles: { slug: string; title: string; title_cn?: string }[] }) {
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
        <p className="font-display text-3xl">谢谢您。</p>
        <p className="font-display text-xl mt-1">Thank you.</p>
        <p className="mt-3 max-w-sm leading-relaxed">
          您的留言已收到，我们将尽快通过邮件回复您。
        </p>
        <p className="mt-1 max-w-sm text-[13px] text-muted">
          Your message has arrived. You will receive a reply by email as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-7" noValidate={false}>
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow">
            <span className="block">姓名</span>
            <span className="block text-[9px]">Name</span>
          </label>
          <input id="name" name="name" required maxLength={200} autoComplete="name" className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow">
            <span className="block">邮箱</span>
            <span className="block text-[9px]">Email</span>
          </label>
          <input id="email" name="email" type="email" required maxLength={320} autoComplete="email" className="field-input" />
        </div>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="topic" className="eyebrow">
            <span className="block">关于</span>
            <span className="block text-[9px]">Regarding</span>
          </label>
          <select id="topic" name="topic" className="field-input cursor-pointer rounded-none">
            {inquiryTopics.map((t) => (
              <option key={t} value={t}>{inquiryTopicsCn[t] ?? t} / {t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="artwork" className="eyebrow">
            <span className="block">作品（可选）</span>
            <span className="block text-[9px]">Artwork (optional)</span>
          </label>
          <select id="artwork" name="artwork" className="field-input cursor-pointer rounded-none">
            <option value="">无特定作品 / None in particular</option>
            {artworkTitles.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title_cn ? `${a.title_cn} / ${a.title}` : a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow">
          <span className="block">留言</span>
          <span className="block text-[9px]">Message</span>
        </label>
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
          {status === 'sending' ? (
            <>
              <span className="block">发送中…</span>
              <span className="block text-[9px]">Sending…</span>
            </>
          ) : (
            <>
              <span className="block">发送</span>
              <span className="block text-[9px]">Send message</span>
            </>
          )}
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
