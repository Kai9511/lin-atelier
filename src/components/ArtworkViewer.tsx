'use client';

import { useState } from 'react';
import { artAlt } from '@/lib/alt';
import type { Artwork, ExtraPhoto } from '@/lib/types';

export function ArtworkViewer({ artwork }: { artwork: Artwork }) {
  const [loaded, setLoaded] = useState(false);
  const alt = artAlt(artwork);

  return (
    <div className="flex w-full items-center justify-center bg-mat px-4 py-8 sm:px-10 sm:py-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
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
    </div>
  );
}

export function ExtraPhotosSection({ artwork }: { artwork: Artwork }) {
  const extras = (artwork.extra_photos ?? []) as ExtraPhoto[];
  if (extras.length === 0) return null;

  return (
    <div className="mt-16 border-t border-line pt-10 lg:mt-20">
      <p className="label mb-6 text-muted">
        <span className="block">更多图片</span>
        <span className="block text-[9px]">More photos</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {extras.map((ep) => (
          <div
            key={ep.cropped_url}
            className="flex w-full items-center justify-center bg-mat px-4 py-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ep.thumb_url ?? ep.cropped_url}
              alt=""
              width={ep.width}
              height={ep.height}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: ep.width && ep.height ? `${ep.width} / ${ep.height}` : undefined }}
              className="h-auto max-h-[50vh] w-auto max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
