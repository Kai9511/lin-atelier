import type { Metadata } from 'next';
import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${site.name}: an independent watercolor practice centered on attentive looking. Biography, statement, exhibitions and awards.`,
  alternates: { canonical: '/about' },
  openGraph: { title: `About | ${site.name}`, url: '/about' },
};

type Entry = { year: string; title: string; venue: string };

function EntryList({ title, entries }: { title: string; entries: readonly Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h2 className="eyebrow mb-6">{title}</h2>
      <ul className="border-t border-line">
        {entries.map((e) => (
          <li key={`${e.year}-${e.title}`} className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line py-4 text-[14px]">
            <span className="tabular-nums text-muted">{e.year}</span>
            <span>
              {e.title}
              <span className="block text-[13px] text-muted">{e.venue}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  const img = site.aboutImage;
  return (
    <div className="shell pb-16 pt-12 lg:pt-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-[9vw]">
        <h1 className="page-title">
          About
          <br />
          the artist
        </h1>
        <div className="lg:pt-16">
          <p className="eyebrow mb-7">Studio practice</p>
          {site.bio.map((p) => (
            <p key={p} className="mb-7 text-[17px] leading-[2]">
              {p}
            </p>
          ))}
          {site.cvUrl && (
            <a href={site.cvUrl} className="text-link mt-2" download>
              Download CV
            </a>
          )}
        </div>
      </div>

      <Reveal className="mt-20 lg:mt-28">
        <figure>
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 1480px) 1376px, 100vw"
            className="mx-auto h-auto max-h-[70vh] w-full max-w-[1090px] object-cover"
          />
        </figure>
      </Reveal>

      <Reveal className="mx-auto my-24 max-w-[1000px] text-center lg:my-36">
        <p className="eyebrow mb-7">Statement</p>
        <p className="text-balance font-display text-[clamp(1.8rem,3.8vw,3.4rem)] leading-[1.2]">“{site.statement}”</p>
      </Reveal>

      <Reveal className="grid gap-16 lg:grid-cols-2 lg:gap-[9vw]">
        <EntryList title="Exhibitions" entries={site.exhibitions} />
        <EntryList title="Awards & achievements" entries={site.awards} />
      </Reveal>
    </div>
  );
}
