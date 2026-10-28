import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkViewer } from '@/components/ArtworkViewer';
import { artAlt } from '@/lib/alt';
import { getArtworkNeighbours, getPublishedArtworks } from '@/lib/artworks';
import { site } from '@/lib/site';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const all = await getPublishedArtworks();
  return all.map((a) => ({ slug: a.slug }));
}

const absolute = (url: string) => (url.startsWith('http') ? url : `${site.url}${url}`);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtworkNeighbours(slug);
  if (!data) return { title: 'Artwork not found', robots: { index: false } };
  const a = data.artwork;
  const details = [a.medium, a.dimensions, a.year].filter(Boolean).join(', ');
  const description = a.description ? `${a.description} ${details}.` : `${a.title} by ${site.name}. ${details}.`;
  return {
    title: a.title,
    description,
    alternates: { canonical: `/works/${a.slug}` },
    openGraph: {
      type: 'article',
      title: `${a.title} | ${site.name}`,
      description,
      url: `/works/${a.slug}`,
      images: [{ url: a.image_url, width: a.width ?? undefined, height: a.height ?? undefined, alt: artAlt(a) }],
    },
    twitter: { card: 'summary_large_image', title: `${a.title} | ${site.name}`, description, images: [a.image_url] },
  };
}

export default async function ArtworkPage({ params }: Params) {
  const { slug } = await params;
  const data = await getArtworkNeighbours(slug);
  if (!data) notFound();
  const { artwork: a, previous, next, position, total } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: a.title,
    image: absolute(a.image_url),
    url: `${site.url}/works/${a.slug}`,
    creator: { '@type': 'Person', name: site.name },
    ...(a.medium ? { artMedium: a.medium } : {}),
    ...(a.year ? { dateCreated: String(a.year) } : {}),
    ...(a.description ? { description: a.description } : {}),
    ...(a.collection ? { isPartOf: { '@type': 'CreativeWorkSeries', name: a.collection } } : {}),
  };

  const facts = [
    ['Medium', a.medium],
    ['Dimensions', a.dimensions],
    ['Collection', a.collection],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <article className="shell pb-8 pt-6 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="mb-8 flex items-center justify-between lg:mb-12">
        <Link href="/works" className="label hover:underline hover:underline-offset-4">
          ← Back to works
        </Link>
        <p className="label text-muted tabular-nums">
          {String(position).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-[6vw]">
        <ArtworkViewer artwork={a} />

        <div className="lg:sticky lg:top-28 lg:self-start lg:pt-4">
          <h1 className="font-display text-[clamp(2.6rem,5vw,4.6rem)] font-normal leading-none tracking-[-0.03em]">
            {a.title}
          </h1>
          {a.year && <p className="mt-5 text-base text-muted">{a.year}</p>}

          {facts.length > 0 && (
            <dl className="mt-12 border-t border-line">
              {facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4 text-[13px]">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {a.description && <p className="mt-10 max-w-[30rem] text-[14px] leading-[1.9] text-ink/80">{a.description}</p>}

          <Link href={`/contact`} className="text-link mt-10">
            Enquire about this work
          </Link>
        </div>
      </div>

      {previous && next && (
        <nav aria-label="More artworks" className="mt-20 grid grid-cols-2 border-t border-line lg:mt-28">
          <Link href={`/works/${previous.slug}`} className="group py-8 pr-4">
            <p className="label text-muted">← Previous artwork</p>
            <p className="mt-2 font-display text-xl transition-transform duration-500 ease-gallery group-hover:-translate-x-1 sm:text-3xl">
              {previous.title}
            </p>
          </Link>
          <Link href={`/works/${next.slug}`} className="group border-l border-line py-8 pl-4 text-right sm:pl-8">
            <p className="label text-muted">Next artwork →</p>
            <p className="mt-2 font-display text-xl transition-transform duration-500 ease-gallery group-hover:translate-x-1 sm:text-3xl">
              {next.title}
            </p>
          </Link>
        </nav>
      )}
    </article>
  );
}
