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

function inToCm(dim: string): string | null {
  const m = dim.match(/^([\d.]+)\s*×\s*([\d.]+)\s*in$/i);
  if (m) {
    const w = (parseFloat(m[1]) * 2.54).toFixed(1);
    const h = (parseFloat(m[2]) * 2.54).toFixed(1);
    return `${w} × ${h} cm`;
  }
  const m2 = dim.match(/^([\d.]+)\s*in$/i);
  if (m2) return `${(parseFloat(m2[1]) * 2.54).toFixed(1)} cm`;
  return null;
}

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
    { kCn: '媒材', k: 'Medium', vCn: a.medium_cn, v: a.medium, vcm: null as string | null },
    { kCn: '尺寸', k: 'Dimensions', vCn: null as string | null | undefined, v: a.dimensions, vcm: a.dimensions ? inToCm(a.dimensions) : null },
    { kCn: '系列', k: 'Collection', vCn: a.collection_cn, v: a.collection, vcm: null as string | null },
  ].filter((f) => f.v);

  return (
    <article className="shell pb-8 pt-6 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="mb-8 flex items-center justify-between lg:mb-12">
        <Link href="/works" className="label hover:underline hover:underline-offset-4">
          <span className="block">← 返回作品</span>
          <span className="block text-[9px]">← Back to works</span>
        </Link>
        <p className="label text-muted tabular-nums">
          {String(position).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-[6vw]">
        <ArtworkViewer artwork={a} />

        <div className="lg:sticky lg:top-28 lg:self-start lg:pt-4">
          <h1 className="font-display text-[clamp(2.6rem,5vw,4.6rem)] font-normal leading-none tracking-[-0.03em]">
            {a.title_cn && <span className="block">{a.title_cn}</span>}
            <span className={a.title_cn ? 'block text-[0.45em] tracking-normal font-normal mt-2' : ''}>{a.title}</span>
          </h1>
          {a.year && <p className="mt-5 text-base text-muted">{a.year}</p>}

          {facts.length > 0 && (
            <dl className="mt-12 border-t border-line">
              {facts.map((f) => (
                <div key={f.k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4 text-[13px]">
                  <dt className="text-muted">
                    <span className="block">{f.kCn}</span>
                    <span className="block text-[10px]">{f.k}</span>
                  </dt>
                  <dd>
                    {f.vCn && <span className="block">{f.vCn}</span>}
                    <span className={f.vCn ? 'block text-[11px] text-muted' : ''}>{f.v}</span>
                    {f.vcm && <span className="block text-[11px] text-muted">{f.vcm}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {(a.description || a.description_cn) && (
            <div className="mt-10 max-w-[30rem] text-[14px] leading-[1.9] text-ink/80">
              {a.description_cn && <p>{a.description_cn}</p>}
              {a.description && <p className={a.description_cn ? 'mt-1 text-[13px]' : ''}>{a.description}</p>}
            </div>
          )}

          <Link href={`/contact`} className="text-link mt-10">
            <span className="block">询问此件作品</span>
            <span className="block text-[11px]">Enquire about this work</span>
          </Link>
        </div>
      </div>

      {previous && next && (
        <nav aria-label="More artworks" className="mt-20 grid grid-cols-2 border-t border-line lg:mt-28">
          <Link href={`/works/${previous.slug}`} className="group py-8 pr-4">
            <p className="label text-muted">
              <span className="block">← 上一件作品</span>
              <span className="block text-[9px]">← Previous artwork</span>
            </p>
            <p className="mt-2 font-display text-xl transition-transform duration-500 ease-gallery group-hover:-translate-x-1 sm:text-3xl">
              {previous.title_cn && <span className="block">{previous.title_cn}</span>}
              <span className={previous.title_cn ? 'block text-[0.7em] font-normal tracking-normal' : ''}>{previous.title}</span>
            </p>
          </Link>
          <Link href={`/works/${next.slug}`} className="group border-l border-line py-8 pl-4 text-right sm:pl-8">
            <p className="label text-muted">
              <span className="block">下一件作品 →</span>
              <span className="block text-[9px]">Next artwork →</span>
            </p>
            <p className="mt-2 font-display text-xl transition-transform duration-500 ease-gallery group-hover:translate-x-1 sm:text-3xl">
              {next.title_cn && <span className="block">{next.title_cn}</span>}
              <span className={next.title_cn ? 'block text-[0.7em] font-normal tracking-normal' : ''}>{next.title}</span>
            </p>
          </Link>
        </nav>
      )}
    </article>
  );
}
