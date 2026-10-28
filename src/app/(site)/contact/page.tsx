import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { getPublishedArtworks } from '@/lib/artworks';
import { site } from '@/lib/site';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${site.name} about artwork availability, exhibitions, commissions and collaborations.`,
  alternates: { canonical: '/contact' },
  openGraph: { title: `Contact | ${site.name}`, url: '/contact' },
};

export default async function ContactPage() {
  const artworks = await getPublishedArtworks();
  const ig = site.instagram;

  return (
    <div className="shell grid gap-16 pb-16 pt-12 lg:grid-cols-2 lg:gap-[8vw] lg:pt-20">
      <div>
        <h1 className="page-title">
          Start a
          <br />
          conversation.
        </h1>
        <p className="mt-10 max-w-[26rem] leading-[1.85] text-muted">
          For artwork availability, exhibitions, commissions, licensing and collaborations.
        </p>

        <dl className="mt-12 grid gap-6 text-[15px]">
          <div>
            <dt className="eyebrow mb-1">Email</dt>
            <dd>
              <a href={`mailto:${site.email}`} className="border-b border-ink font-display text-2xl sm:text-3xl">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Instagram</dt>
            <dd>
              {ig.url ? (
                <a href={ig.url} target="_blank" rel="noopener noreferrer" className="border-b border-ink">
                  {ig.handle}
                </a>
              ) : (
                ig.handle
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Studio</dt>
            <dd>{site.location}</dd>
          </div>
        </dl>
      </div>

      <div className="lg:pt-6">
        <p className="eyebrow mb-8">Send a message</p>
        <ContactForm artworkTitles={artworks.map((a) => ({ slug: a.slug, title: a.title }))} />
      </div>
    </div>
  );
}
