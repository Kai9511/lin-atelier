import type { Metadata } from 'next';
import Link from 'next/link';
import { ArtImage } from '@/components/ArtImage';
import { Reveal } from '@/components/Reveal';
import { getPublishedArtworks, pickHomepageWorks } from '@/lib/artworks';
import { site } from '@/lib/site';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = pickHomepageWorks(await getPublishedArtworks());
  return {
    title: { absolute: `${site.name} | Contemporary Watercolors` },
    description: site.description,
    alternates: { canonical: '/' },
    openGraph: hero
      ? { title: site.name, description: site.description, url: '/', images: [{ url: hero.image_url, alt: hero.title }] }
      : undefined,
  };
}

// Editorial rhythm for the "Selected works" grid: each slot has its own span, offset and mat shape.
const slots = [
  { wrap: 'lg:col-span-7', mat: 'aspect-[5/4]' },
  { wrap: 'lg:col-span-5 lg:mt-40', mat: 'aspect-[4/5]' },
  { wrap: 'lg:col-span-4 lg:col-start-2', mat: 'aspect-[4/5]' },
  { wrap: 'lg:col-span-7 lg:col-start-6 lg:mt-24', mat: 'aspect-[5/4]' },
  { wrap: 'lg:col-span-6 lg:col-start-4', mat: 'aspect-[4/5]' },
];

export default async function HomePage() {
  const all = await getPublishedArtworks();
  const { hero, selected } = pickHomepageWorks(all);

  return (
    <>
      <section className="shell grid items-center gap-10 pb-16 pt-4 lg:min-h-[calc(100svh-92px)] lg:grid-cols-[0.42fr_0.58fr] lg:gap-[6vw] lg:pb-12 lg:pt-0">
        <div className="order-2 lg:order-1 lg:pl-[4vw]">
          <p className="eyebrow mb-7">{site.tagline}</p>
          <h1 className="font-display text-[clamp(3.75rem,8vw,7.75rem)] font-normal leading-[0.88] tracking-[-0.045em]">
            {site.name.split(' ').map((w, i) => (
              <span key={w + i} className="block">
                {w}
              </span>
            ))}
          </h1>
          <p className="mt-9 max-w-[24rem] text-[15px] leading-[1.85] text-ink/75">{site.intro}</p>
          <Link href="/works" className="text-link mt-7">
            View selected works
          </Link>
        </div>

        <div className="order-1 lg:order-2">
          {hero ? (
            <Link
              href={`/works/${hero.slug}`}
              className="group relative block"
              aria-label={`${hero.title}, view artwork`}
            >
              <div className="h-[66svh] min-h-[420px] overflow-hidden lg:h-[calc(100svh-140px)] lg:min-h-[560px]">
                <div className="h-full transition-transform duration-[1400ms] ease-gallery group-hover:scale-[1.02]">
                  <ArtImage
                    artwork={hero}
                    fit="contain"
                    highRes
                    priority
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="h-full w-full"
                  />
                </div>
              </div>
              <p className="label mt-4 flex justify-between text-muted">
                <span>{hero.title}</span>
                <span>{[hero.year, hero.medium].filter(Boolean).join(' · ')}</span>
              </p>
            </Link>
          ) : (
            <div className="flex h-[50svh] items-center justify-center bg-mat text-muted">
              Works will appear here once they are published.
            </div>
          )}
        </div>
      </section>

      {selected.length > 0 && (
        <section className="shell py-24 lg:py-32" aria-labelledby="selected-heading">
          <Reveal className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Selected works</p>
              <h2 id="selected-heading" className="page-title">
                Recent works
              </h2>
            </div>
            <Link href="/works" className="text-link shrink-0">
              View all
            </Link>
          </Reveal>

          <div className="grid gap-x-6 gap-y-16 lg:grid-cols-12 lg:gap-y-10">
            {selected.map((a, i) => {
              const slot = slots[i % slots.length];
              return (
                <Reveal key={a.id} className={slot.wrap} delay={(i % 2) * 90}>
                  <Link href={`/works/${a.slug}`} className="group block">
                    <div className="relative overflow-hidden">
                      <div className="transition-transform duration-[900ms] ease-gallery group-hover:scale-[1.025]">
                        <ArtImage
                          artwork={a}
                          fit="contain"
                          sizes="(min-width: 1024px) 40vw, 92vw"
                          className={`w-full ${slot.mat}`}
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex items-end bg-ink/50 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="translate-y-3 text-[11px] uppercase tracking-label text-paper transition-transform duration-500 ease-gallery group-hover:translate-y-0">
                          View artwork →
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-6 pt-4">
                      <h3 className="font-display text-[22px] leading-tight">{a.title}</h3>
                      <p className="shrink-0 text-[11px] tracking-[0.08em] text-muted">{a.year}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <Reveal className="shell px-5 py-28 text-center lg:py-40">
        <p className="eyebrow mb-8">Artist statement</p>
        <blockquote className="mx-auto max-w-[1000px] text-balance font-display text-[clamp(1.9rem,4.3vw,4.2rem)] leading-[1.18]">
          “{site.statement}”
        </blockquote>
      </Reveal>
    </>
  );
}
