import { cache } from 'react';
import { demoArtworks } from '@/data/demo';
import { isSupabaseConfigured } from '@/lib/env';
import { createPublicClient } from '@/lib/supabase/public';
import { artworkTranslations } from '@/lib/translations';
import type { Artwork } from '@/lib/types';

function applyTranslations(artworks: Artwork[]): Artwork[] {
  return artworks.map((a) => {
    const t = artworkTranslations[a.slug];
    if (!t) return a;
    return { ...a, ...t };
  });
}

/** Every published artwork in display order. Deduplicated per request. */
export const getPublishedArtworks = cache(async (): Promise<Artwork[]> => {
  if (!isSupabaseConfigured) return applyTranslations(demoArtworks);

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Could not load artworks:', error.message);
    return [];
  }
  return applyTranslations((data ?? []) as Artwork[]);
});

export async function getArtworkNeighbours(slug: string) {
  const all = await getPublishedArtworks();
  const index = all.findIndex((a) => a.slug === slug);
  if (index === -1) return null;
  return {
    artwork: all[index],
    previous: all.length > 1 ? all[(index - 1 + all.length) % all.length] : null,
    next: all.length > 1 ? all[(index + 1) % all.length] : null,
    position: index + 1,
    total: all.length,
  };
}

/** Homepage picks: featured works first, then the rest. The first is the hero. */
export function pickHomepageWorks(all: Artwork[]) {
  const featured = all.filter((a) => a.featured);
  const rest = all.filter((a) => !a.featured);
  const pool = [...featured, ...rest];
  return { hero: pool[0] ?? null, selected: pool.slice(1, 6) };
}
