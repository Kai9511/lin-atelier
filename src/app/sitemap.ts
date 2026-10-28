import type { MetadataRoute } from 'next';
import { getPublishedArtworks } from '@/lib/artworks';
import { site } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await getPublishedArtworks();
  const pages = ['', '/works', '/about', '/contact'].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }));
  const works = artworks.map((a) => ({
    url: `${site.url}/works/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));
  return [...pages, ...works];
}
