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
        <h1 className="page-title">
          <span className="block">作品</span>
          <span className="block text-[0.45em] tracking-normal font-normal mt-2">Works</span>
        </h1>
        <div className="max-w-[34rem] leading-[1.85] text-muted lg:justify-self-end">
          <p>{site.worksIntroCn}</p>
          <p className="text-[13px] mt-1">{site.worksIntro}</p>
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="py-24 text-center text-muted">
          <p>新作即将呈现，敬请期待。</p>
          <p className="text-[13px] opacity-60 mt-1">New work is on its way. Please check back soon.</p>
        </div>
      ) : (
        <Gallery artworks={artworks} />
      )}
    </div>
  );
}
