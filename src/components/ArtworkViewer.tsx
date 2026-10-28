'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { artAlt } from '@/lib/alt';
import type { Artwork } from '@/lib/types';

/**
 * The large image on an artwork page. Click (or press Enter) to open the
 * full-screen viewer; Esc, the Close button or a click anywhere closes it.
 */
export function ArtworkViewer({ artwork }: { artwork: Artwork }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [viewerLoaded, setViewerLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  const alt = artAlt(artwork);

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${artwork.title} full screen`}
        className="group relative flex w-full cursor-zoom-in items-center justify-center bg-mat px-4 py-8 sm:px-10 sm:py-14"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={artwork.image_url}
          alt={alt}
          width={artwork.width ?? undefined}
          height={artwork.height ?? undefined}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{ aspectRatio: artwork.width && artwork.height ? `${artwork.width} / ${artwork.height}` : undefined }}
          className={`h-auto max-h-[72vh] w-auto max-w-full object-contain transition-opacity duration-[900ms] ease-gallery ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <span className="label absolute bottom-4 right-5 text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          Full screen
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${artwork.title}, full screen`}
          onClick={close}
          className="fixed inset-0 z-[100] flex animate-fade-in cursor-zoom-out items-center justify-center bg-ink/95 p-4 sm:p-10"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="label absolute right-5 top-5 z-10 p-2 text-paper/80 hover:text-paper"
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.image_url}
            alt={alt}
            onLoad={() => setViewerLoaded(true)}
            className={`max-h-full max-w-full object-contain transition-opacity duration-700 ease-gallery ${
              viewerLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <p className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[11px] uppercase tracking-label text-paper/60">
            {artwork.title}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </p>
        </div>
      )}
    </>
  );
}
