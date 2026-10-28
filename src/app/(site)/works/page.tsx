import type { Metadata } from 'next';
import { Gallery } from '@/components/Gallery';
import { getPublishedArtworks } from '@/lib/artworks';
import { site } from '@/lib/site';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const all = await getPublishedArtworks();
  const first = all[0];
  return {
    title: 'Works',
    description: `Watercolor and ink studies by ${site.name}: botanical subjects, remembered landscapes, travel notes and intimate observations.`,
    alternates: { canonical: '/works' },
    openGraph: {
      title: `Works | ${site.name}`,
      url: '/works',
      images: first ? [{ url: first.image_url, alt: first.title }] : undefined,
    },
  };
}

export default async function WorksPage() {
  const artworks = await getPublishedArtworks();

  return (
    <div className="shell pb-16 pt-12 lg:pt-20">
      <div className="mb-16 grid gap-8 lg:mb-24 lg:grid-cols-2 lg:items-end">
        <h1 className="page-title">Works</h1>
        <p className="max-w-[34rem] leading-[1.85] text-muted lg:justify-self-end">{site.worksIntro}</p>
      </div>

      {artworks.length === 0 ? (
        <p className="py-24 text-center text-muted">New work is on its way. Please check back soon.</p>
      ) : (
        <Gallery artworks={artworks} />
      )}
    </div>
  );
}
