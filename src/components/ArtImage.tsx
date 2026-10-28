'use client';

import { useEffect, useRef, useState } from 'react';
import { artAlt } from '@/lib/alt';
import type { Artwork } from '@/lib/types';

type Props = {
  artwork: Artwork;
  /** The `sizes` attribute: how wide the image will be at each breakpoint. */
  sizes: string;
  priority?: boolean;
  /**
   * natural: the box takes the artwork's true proportions, nothing is cropped (gallery).
   * contain: the parent sets the box; the artwork sits inside it with a margin, like a mounted print.
   */
  fit?: 'natural' | 'contain';
  /** Load the high-resolution file straight away (hero images). */
  highRes?: boolean;
  className?: string;
};

/**
 * Lazy-loaded, responsive artwork image. Uses the small thumbnail by default and
 * lets the browser upgrade to the high-resolution file when the screen needs it.
 * Fades in when loaded and reserves its space up front so the page never jumps.
 */
export function ArtImage({ artwork, sizes, priority = false, fit = 'natural', highRes = false, className = '' }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  const { width, height } = artwork;
  const longEdge = width && height ? Math.max(width, height) : 0;
  const thumbWidth = width && longEdge ? Math.round(width * Math.min(1, 900 / longEdge)) : 0;
  const srcSet =
    !highRes && width && thumbWidth && thumbWidth < width
      ? `${artwork.thumbnail_url} ${thumbWidth}w, ${artwork.image_url} ${width}w`
      : undefined;

  const boxStyle = fit === 'natural' ? { aspectRatio: width && height ? `${width} / ${height}` : '4 / 5' } : undefined;

  return (
    <div className={`relative overflow-hidden bg-mat ${className}`} style={boxStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={highRes ? artwork.image_url : artwork.thumbnail_url}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={artAlt(artwork)}
        width={width ?? undefined}
        height={height ?? undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full transition-[opacity,transform] duration-[900ms] ease-gallery ${
          fit === 'contain' ? 'object-contain p-[7%]' : 'object-cover'
        } ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
