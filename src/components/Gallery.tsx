'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArtImage } from '@/components/ArtImage';
import { Reveal } from '@/components/Reveal';
import type { Artwork } from '@/lib/types';

function unique(values: (string | number | null)[]) {
  return [...new Set(values.filter((v): v is string | number => v !== null && v !== ''))];
}

function Filter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: (string | number)[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[10rem] cursor-pointer appearance-none rounded-none border-0 border-b border-ink bg-transparent py-2.5 pl-0.5 pr-8 text-[12px] outline-none focus:border-b-2"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={String(o)}>
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px]">▾</span>
    </div>
  );
}

export function Gallery({ artworks }: { artworks: Artwork[] }) {
  const [collection, setCollection] = useState('');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('');

  const collections = useMemo(() => unique(artworks.map((a) => a.collection)).sort(), [artworks]);
  const years = useMemo(() => unique(artworks.map((a) => a.year)).sort((a, b) => Number(b) - Number(a)), [artworks]);
  const media = useMemo(() => unique(artworks.map((a) => a.medium)).sort(), [artworks]);

  const filtered = artworks.filter(
    (a) =>
      (!collection || a.collection === collection) &&
      (!year || String(a.year) === year) &&
      (!medium || a.medium === medium),
  );
  const active = Boolean(collection || year || medium);
  const filterKey = `${collection}|${year}|${medium}`;

  return (
    <div>
      <div className="mb-14 flex flex-wrap items-end gap-x-6 gap-y-4 border-b border-line pb-8">
        <Filter id="f-collection" label="Collections" value={collection} options={collections} onChange={setCollection} />
        <Filter id="f-year" label="Years" value={year} options={years} onChange={setYear} />
        <Filter id="f-medium" label="Media" value={medium} options={media} onChange={setMedium} />
        {active && (
          <button
            type="button"
            onClick={() => {
              setCollection('');
              setYear('');
              setMedium('');
            }}
            className="label pb-2.5 underline underline-offset-4"
          >
            Clear
          </button>
        )}
        <p aria-live="polite" className="label ml-auto pb-2.5 text-muted">
          {filtered.length} {filtered.length === 1 ? 'work' : 'works'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-muted">No works match these filters.</p>
      ) : (
        <div key={filterKey} className="animate-fade-in columns-1 gap-x-6 sm:columns-2 lg:columns-3 lg:gap-x-10">
          {filtered.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 80} className="mb-14 break-inside-avoid">
              <Link href={`/works/${a.slug}`} className="group block">
                <div className="relative overflow-hidden">
                  <div className="transition-transform duration-[900ms] ease-gallery group-hover:scale-[1.025]">
                    <ArtImage
                      artwork={a}
                      priority={i < 3}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 bg-ink/55 p-5 text-paper opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="translate-y-3 text-[11px] uppercase tracking-label transition-transform duration-500 ease-gallery group-hover:translate-y-0 group-focus-visible:translate-y-0">
                      {[a.medium, a.dimensions].filter(Boolean).join(' · ')}
                    </span>
                    {a.collection && (
                      <span className="translate-y-3 text-[11px] uppercase tracking-label opacity-75 transition-transform delay-75 duration-500 ease-gallery group-hover:translate-y-0 group-focus-visible:translate-y-0">
                        {a.collection}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-6 pt-4">
                  <h3 className="font-display text-[22px] leading-tight">{a.title}</h3>
                  <p className="shrink-0 text-[11px] tracking-[0.08em] text-muted">{a.year}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
