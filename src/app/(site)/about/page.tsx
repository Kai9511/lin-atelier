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

const sectionTitlesCn: Record<string, string> = {
  'Exhibitions': '展览',
  'Awards & achievements': '奖项与成就',
  'Studio practice': '创作实践',
  'Statement': '陈述',
};

function EntryList({ title, entries }: { title: string; entries: readonly Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <div className="eyebrow mb-6">
        <span className="block">{sectionTitlesCn[title] ?? title}</span>
        <span className="block text-[9px]">{title}</span>
      </div>
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
          <span className="block">关于艺术家</span>
          <span className="block text-[0.45em] tracking-normal font-normal mt-2">About the artist</span>
        </h1>
        <div className="lg:pt-16">
          <div className="eyebrow mb-7">
            <span className="block">创作实践</span>
            <span className="block text-[9px]">Studio practice</span>
          </div>
          {site.bioCn.map((p, i) => {
            const enPara = (site.bio as readonly string[])[i];
            return (
              <div key={i} className="mb-7">
                <p className="text-[17px] leading-[2]">{p}</p>
                {enPara && <p className="text-[14px] leading-[1.8] mt-1">{enPara}</p>}
              </div>
            );
          })}
          {site.cvUrl && (
            <a href={site.cvUrl} className="text-link mt-2" download>
              <span className="block">下载简历</span>
              <span className="block text-[11px]">Download CV</span>
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
        <div className="eyebrow mb-7">
          <span className="block">陈述</span>
          <span className="block text-[9px]">Statement</span>
        </div>
        <p className="text-balance font-display text-[clamp(1.8rem,3.8vw,3.4rem)] leading-[1.2]">
          「{site.statementCn}」
        </p>
        <p className="mt-4 text-[clamp(0.9rem,2vw,1.4rem)] leading-[1.4] italic">
          "{site.statement}"
        </p>
      </Reveal>

      <Reveal className="grid gap-16 lg:grid-cols-2 lg:gap-[9vw]">
        <EntryList title="Exhibitions" entries={site.exhibitions} />
        <EntryList title="Awards & achievements" entries={site.awards} />
      </Reveal>

    </div>
  );
}
