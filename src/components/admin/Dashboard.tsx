'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { revalidatePublic } from '@/app/admin/actions';
import { BUCKET } from '@/lib/env';
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, processImage } from '@/lib/image';
import { uniqueSlug } from '@/lib/slug';
import { createClient } from '@/lib/supabase/client';
import type { Artwork, ExtraPhoto } from '@/lib/types';

type FormState = {
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  collection: string;
  description: string;
  alt_text: string;
  featured: boolean;
  published: boolean;
};

type Notice = { kind: 'ok' | 'error'; text: string } | null;

type PhotoDraft = {
  id: string;
  file: File;
  srcUrl: string;
};

const emptyForm = (): FormState => ({
  title: '',
  year: String(new Date().getFullYear()),
  medium: 'Watercolor on paper',
  dimensions: '',
  collection: '',
  description: '',
  alt_text: '',
  featured: false,
  published: true,
});

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : ((err as { message?: string } | null)?.message ?? 'Something went wrong.');

const byOrder = (a: Artwork, b: Artwork) =>
  a.display_order - b.display_order || b.created_at.localeCompare(a.created_at);

export function Dashboard({ initial, loadError }: { initial: Artwork[]; loadError?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Artwork[]>(() => [...initial].sort(byOrder));
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(loadError ? { kind: 'error', text: loadError } : null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLElement>(null);

  const collections = useMemo(
    () => [...new Set(items.map((i) => i.collection).filter((c): c is string => Boolean(c)))].sort(),
    [items],
  );

  // Revoke object URLs on cleanup
  useEffect(() => {
    const urls = photos.map((p) => p.srcUrl);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm());
    setPhotos([]);
    if (fileInput.current) fileInput.current.value = '';
  }

  function startEdit(a: Artwork) {
    setEditing(a);
    setForm({
      title: a.title,
      year: a.year ? String(a.year) : '',
      medium: a.medium ?? '',
      dimensions: a.dimensions ?? '',
      collection: a.collection ?? '',
      description: a.description ?? '',
      alt_text: a.alt_text ?? '',
      featured: a.featured,
      published: a.published,
    });
    setPhotos([]);
    if (fileInput.current) fileInput.current.value = '';
    setNotice(null);
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    if (picked.some((f) => !ACCEPTED_TYPES.includes(f.type))) {
      setNotice({ kind: 'error', text: 'Please choose JPG, PNG or WebP images.' });
      e.target.value = '';
      return;
    }
    if (picked.some((f) => f.size > MAX_UPLOAD_BYTES)) {
      setNotice({ kind: 'error', text: 'One or more files exceed 30 MB.' });
      e.target.value = '';
      return;
    }
    setNotice(null);
    setPhotos((prev) => [
      ...prev,
      ...picked.map((f) => ({ id: crypto.randomUUID(), file: f, srcUrl: URL.createObjectURL(f) })),
    ]);
    e.target.value = '';
  }

  function setPhotoAsPrimary(id: string) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const p = prev.find((ph) => ph.id === id);
      if (p) URL.revokeObjectURL(p.srcUrl);
      return prev.filter((ph) => ph.id !== id);
    });
  }

  async function setPrimary(ep: ExtraPhoto, index: number) {
    if (!editing || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const existingExtras = [...((editing.extra_photos ?? []) as ExtraPhoto[])];
      const oldPrimary: ExtraPhoto = {
        cropped_url: editing.image_url,
        original_url: editing.original_url ?? editing.image_url,
        cropped_path: editing.image_path ?? '',
        original_path: editing.original_path ?? '',
        thumb_url: editing.thumbnail_url,
        thumb_path: editing.thumbnail_path ?? undefined,
        width: editing.width ?? 0,
        height: editing.height ?? 0,
      };
      const newExtras = existingExtras.filter((_, i) => i !== index);
      newExtras.push(oldPrimary);
      const patch: Partial<Artwork> = {
        image_url: ep.cropped_url,
        thumbnail_url: ep.thumb_url ?? ep.cropped_url,
        image_path: ep.cropped_path || null,
        thumbnail_path: (ep.thumb_path ?? ep.cropped_path) || null,
        original_url: ep.original_url,
        original_path: ep.original_path || null,
        width: ep.width,
        height: ep.height,
        extra_photos: newExtras,
      };
      const { error } = await supabase.from('artworks').update(patch).eq('id', editing.id);
      if (error) throw error;
      await reload();
      setEditing((prev) => (prev ? { ...prev, ...patch } : null));
      setNotice({ kind: 'ok', text: 'Primary photo updated.' });
    } catch (err) {
      setNotice({ kind: 'error', text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    setItems((data ?? []) as Artwork[]);
    try { await revalidatePublic(); } catch { /* public pages refresh within a minute */ }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    if (!editing && photos.length === 0) {
      setNotice({ kind: 'error', text: 'Choose at least one photo to upload.' });
      return;
    }

    setBusy(true);
    setNotice(null);
    const uploaded: string[] = [];
    const bucket = supabase.storage.from(BUCKET);

    try {
      let primaryPatch: Partial<Artwork> = {};
      const newExtras: ExtraPhoto[] = [];

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const processed = await processImage(p.file);
        const folder = crypto.randomUUID();
        const fullPath = `${folder}/full.${processed.ext}`;
        const thumbPath = `${folder}/thumb.${processed.ext}`;
        const opts = { contentType: processed.contentType, cacheControl: '31536000' };

        const [r1, r2] = await Promise.all([
          bucket.upload(fullPath, processed.full, opts),
          bucket.upload(thumbPath, processed.thumb, opts),
        ]);
        if (r1.error) throw r1.error;
        if (r2.error) throw r2.error;
        uploaded.push(fullPath, thumbPath);

        const fullUrl = bucket.getPublicUrl(fullPath).data.publicUrl;
        const thumbUrl = bucket.getPublicUrl(thumbPath).data.publicUrl;

        const isPrimary = i === 0 && !editing;
        const isReplace = i === 0 && editing && photos.length > 0;

        if (isPrimary || isReplace) {
          primaryPatch = {
            image_url: fullUrl,
            thumbnail_url: thumbUrl,
            image_path: fullPath,
            thumbnail_path: thumbPath,
            original_url: null,
            original_path: null,
            width: processed.width,
            height: processed.height,
          };
        } else {
          newExtras.push({
            cropped_url: fullUrl,
            original_url: fullUrl,
            cropped_path: fullPath,
            original_path: fullPath,
            thumb_url: thumbUrl,
            thumb_path: thumbPath,
            width: processed.width,
            height: processed.height,
          });
        }
      }

      const year = form.year.trim() ? Number(form.year) : null;
      if (year !== null && (!Number.isInteger(year) || year < 1000 || year > 2999)) {
        throw new Error('Year must be a four-digit number such as 2026.');
      }
      const fields = {
        title: form.title.trim(),
        year,
        medium: form.medium.trim() || null,
        dimensions: form.dimensions.trim() || null,
        collection: form.collection.trim() || null,
        description: form.description.trim() || null,
        alt_text: form.alt_text.trim() || null,
        featured: form.featured,
        published: form.published,
      };

      if (editing) {
        const existingExtras: ExtraPhoto[] = (editing.extra_photos ?? []) as ExtraPhoto[];
        const mergedExtras = [...existingExtras, ...newExtras];
        const patch = {
          ...fields,
          ...primaryPatch,
          ...(newExtras.length > 0 ? { extra_photos: mergedExtras } : {}),
        };
        const { error } = await supabase.from('artworks').update(patch as Partial<Artwork>).eq('id', editing.id);
        if (error) throw error;
        if (photos.length > 0) {
          const old = [editing.image_path, editing.thumbnail_path, editing.original_path].filter((p): p is string => Boolean(p));
          if (old.length) await bucket.remove(old);
        }
      } else {
        const slug = uniqueSlug(fields.title, items.map((i) => i.slug));
        const order = items.length ? Math.min(...items.map((i) => i.display_order)) - 1 : 0;
        const { error } = await supabase.from('artworks').insert({
          slug, ...fields, ...primaryPatch,
          extra_photos: newExtras,
          display_order: order,
        });
        if (error) throw error;
      }

      await reload();
      setNotice({
        kind: 'ok',
        text: editing
          ? `Saved "${fields.title}".`
          : fields.published
            ? `Published "${fields.title}". It is now on the site.`
            : `Saved "${fields.title}" as a draft.`,
      });
      resetForm();
    } catch (err) {
      if (uploaded.length) await bucket.remove(uploaded);
      setNotice({ kind: 'error', text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  }

  async function update(id: string, values: Partial<Artwork>, okText: string) {
    setBusy(true);
    setNotice(null);
    try {
      const { error } = await supabase.from('artworks').update(values).eq('id', id);
      if (error) throw error;
      await reload();
      setNotice({ kind: 'ok', text: okText });
    } catch (err) {
      setNotice({ kind: 'error', text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length || busy) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const changes = next
      .map((a, i) => ({ id: a.id, order: i * 10, current: a.display_order }))
      .filter((c) => c.order !== c.current);
    setBusy(true);
    setNotice(null);
    try {
      const results = await Promise.all(
        changes.map((c) => supabase.from('artworks').update({ display_order: c.order }).eq('id', c.id)),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      await reload();
    } catch (err) {
      setNotice({ kind: 'error', text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Artwork) {
    if (confirmId !== a.id) {
      setConfirmId(a.id);
      window.setTimeout(() => setConfirmId((c) => (c === a.id ? null : c)), 4000);
      return;
    }
    setConfirmId(null);
    setBusy(true);
    setNotice(null);
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', a.id);
      if (error) throw error;
      const extraPaths = ((a.extra_photos ?? []) as ExtraPhoto[]).flatMap((p) => [p.cropped_path, p.original_path, ...(p.thumb_path ? [p.thumb_path] : [])]);
      const paths = [a.image_path, a.thumbnail_path, a.original_path, ...extraPaths].filter((p): p is string => Boolean(p));
      if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
      if (editing?.id === a.id) resetForm();
      await reload();
      setNotice({ kind: 'ok', text: `Deleted "${a.title}".` });
    } catch (err) {
      setNotice({ kind: 'error', text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  }

  const btn = 'label underline underline-offset-4 hover:text-muted disabled:no-underline disabled:opacity-30';

  return (
    <div className="shell grid gap-12 py-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-16">
      <section ref={formTop} aria-labelledby="form-heading" className="scroll-mt-6 self-start bg-[#efeee9] p-6 sm:p-8 lg:sticky lg:top-6">
        <h1 id="form-heading" className="font-display text-3xl">
          {editing ? 'Edit artwork' : 'Add artwork'}
        </h1>

        <form onSubmit={onSubmit} className="mt-7 grid gap-5">
          {/* ── Photo upload ── */}
          <div>
            <p className="eyebrow mb-2">
              {editing ? 'Add more photos (optional)' : 'Photos'}
            </p>

            {/* Existing photos in edit mode */}
            {editing && (
              <div className="mb-3 space-y-2">
                {editing.image_url && (
                  <div className="flex items-center gap-3 rounded border border-line bg-white/60 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editing.thumbnail_url} alt="" className="h-14 w-14 shrink-0 bg-mat object-contain" />
                    <p className="min-w-0 text-[11px] text-muted">
                      <span className="block font-medium text-ink">Current primary photo</span>
                      {editing.original_url && <span className="block">Original stored ✓</span>}
                    </p>
                  </div>
                )}
                {((editing.extra_photos ?? []) as ExtraPhoto[]).map((ep, i) => (
                  <div key={ep.cropped_url} className="flex items-center gap-3 rounded border border-line bg-white/60 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ep.thumb_url ?? ep.cropped_url} alt="" className="h-14 w-14 shrink-0 bg-mat object-contain" />
                    <p className="min-w-0 flex-1 text-[11px] text-muted">Extra photo {i + 1}</p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setPrimary(ep, i)}
                      className="label shrink-0 text-[10px] text-muted underline underline-offset-2 hover:text-ink disabled:opacity-40"
                    >
                      Set as primary
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photo preview list */}
            {photos.length > 0 && (
              <div className="mb-3 space-y-2">
                {photos.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 rounded border border-line bg-white/60 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.srcUrl} alt="" className="h-14 w-14 shrink-0 bg-mat object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-ink">
                        {i === 0 && !editing ? 'Primary photo' : `Photo ${i + 1}`}
                      </p>
                    </div>
                    {i !== 0 && !editing && (
                      <button
                        type="button"
                        onClick={() => setPhotoAsPrimary(p.id)}
                        className="label shrink-0 text-[10px] text-muted underline underline-offset-2 hover:text-ink"
                      >
                        Set as primary
                      </button>
                    )}
                    <button type="button" onClick={() => removePhoto(p.id)} className="label text-[10px] text-muted hover:text-[#8b332d]">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File picker button */}
            <label
              htmlFor="photos"
              className="flex min-h-[80px] cursor-pointer items-center justify-center border border-dashed border-ink/40 bg-white/60 px-4 py-3 text-center text-[13px] text-muted transition-colors hover:border-ink"
            >
              {photos.length > 0 ? '+ Add more photos' : editing ? 'Choose photos to add' : 'Choose photos (one or more)'}
            </label>
            <input
              ref={fileInput}
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPickFiles}
              className="sr-only"
            />
          </div>

          <div>
            <label htmlFor="title" className="eyebrow">Title</label>
            <input id="title" required maxLength={200} value={form.title} onChange={(e) => set('title', e.target.value)} className="field-input" />
          </div>
          <div className="grid grid-cols-[6rem_1fr] gap-5">
            <div>
              <label htmlFor="year" className="eyebrow">Year</label>
              <input id="year" inputMode="numeric" maxLength={4} value={form.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, ''))} className="field-input" />
            </div>
            <div>
              <label htmlFor="dimensions" className="eyebrow">Dimensions</label>
              <input id="dimensions" placeholder="8 × 10 in" value={form.dimensions} onChange={(e) => set('dimensions', e.target.value)} className="field-input" />
            </div>
          </div>
          <div>
            <label htmlFor="medium" className="eyebrow">Medium</label>
            <input id="medium" placeholder="Watercolor on paper" value={form.medium} onChange={(e) => set('medium', e.target.value)} className="field-input" />
          </div>
          <div>
            <label htmlFor="collection" className="eyebrow">Collection / Series</label>
            <input
              id="collection"
              list="collections"
              placeholder="Choose one, or type a new name"
              value={form.collection}
              onChange={(e) => set('collection', e.target.value)}
              className="field-input"
            />
            <datalist id="collections">
              {collections.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="description" className="eyebrow">Description</label>
            <textarea id="description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="field-input resize-y" />
          </div>
          <div>
            <label htmlFor="alt_text" className="eyebrow">Image description for screen readers (optional)</label>
            <input id="alt_text" placeholder="What the painting shows" value={form.alt_text} onChange={(e) => set('alt_text', e.target.value)} className="field-input" />
          </div>

          <div className="grid gap-3 text-[13px]">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-ink" />
              Feature on the homepage
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4 accent-ink" />
              Published (visible to visitors)
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="label border border-ink bg-ink px-6 py-3.5 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:opacity-50"
            >
              {busy ? 'Working…' : editing ? 'Save changes' : form.published ? 'Publish artwork' : 'Save as draft'}
            </button>
            {(editing || photos.length > 0 || form.title) && (
              <button type="button" onClick={resetForm} disabled={busy} className="label border border-ink px-6 py-3.5 hover:bg-ink hover:text-paper disabled:opacity-50">
                {editing ? 'Cancel' : 'Clear'}
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="list-heading" className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="list-heading" className="font-display text-3xl">
            Works <span className="text-muted">({items.length})</span>
          </h2>
          <p className="text-[12px] text-muted">Order here is the order on the site.</p>
        </div>

        <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
          {notice && (
            <p
              role={notice.kind === 'error' ? 'alert' : 'status'}
              className={`text-[13px] ${notice.kind === 'error' ? 'text-[#8b332d]' : 'text-ink'}`}
            >
              {notice.kind === 'ok' ? '✓ ' : ''}
              {notice.text}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 border-t border-line py-16 text-center text-muted">
            No artwork yet. Add your first piece with the form.
          </p>
        ) : (
          <ul className="mt-2 border-t border-line">
            {items.map((a, i) => (
              <li
                key={a.id}
                className={`grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-line py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] ${
                  editing?.id === a.id ? 'bg-mat/60' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.thumbnail_url} alt="" className="h-[72px] w-[72px] bg-mat object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl leading-tight">{a.title}</p>
                  <p className="mt-1 truncate text-[12px] text-muted">
                    {[a.year, a.collection, a.dimensions].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-label">
                    {a.published ? (
                      <span className="border border-ink px-2 py-0.5">Published</span>
                    ) : (
                      <span className="border border-dashed border-muted px-2 py-0.5 text-muted">Draft</span>
                    )}
                    {a.featured && <span className="bg-ink px-2 py-0.5 text-paper">Featured</span>}
                  </p>
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-1 sm:max-w-[15rem] sm:justify-end">
                  <button type="button" className={btn} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${a.title} earlier`}>↑ Up</button>
                  <button type="button" className={btn} disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${a.title} later`}>↓ Down</button>
                  <button type="button" className={btn} disabled={busy} onClick={() => update(a.id, { featured: !a.featured }, a.featured ? `Removed "${a.title}" from the homepage.` : `"${a.title}" is featured on the homepage.`)}>
                    {a.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button type="button" className={btn} disabled={busy} onClick={() => update(a.id, { published: !a.published }, a.published ? `"${a.title}" is now hidden.` : `"${a.title}" is now published.`)}>
                    {a.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className={btn} disabled={busy} onClick={() => startEdit(a)}>Edit</button>
                  {a.published && <Link href={`/works/${a.slug}`} target="_blank" className={btn}>View ↗</Link>}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(a)}
                    className={`label underline underline-offset-4 disabled:opacity-30 ${confirmId === a.id ? 'font-medium text-[#8b332d]' : 'hover:text-[#8b332d]'}`}
                  >
                    {confirmId === a.id ? 'Click again to delete' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
