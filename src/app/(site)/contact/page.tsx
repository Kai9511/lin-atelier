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

  return (
    <div className="shell grid gap-16 pb-16 pt-12 lg:grid-cols-2 lg:gap-[8vw] lg:pt-20">
      <div>
        <h1 className="page-title">
          <span className="block">开启一段对话。</span>
          <span className="block text-[0.45em] tracking-normal font-normal mt-2">Start a conversation.</span>
        </h1>
        <div className="mt-10 max-w-[26rem] leading-[1.85] text-muted">
          <p>关于作品购询、展览、委托创作、授权与合作事宜。</p>
          <p className="text-[13px] mt-1">For artwork availability, exhibitions, commissions, licensing and collaborations.</p>
        </div>

        <dl className="mt-12 grid gap-6 text-[15px]">
          <div>
            <dt className="eyebrow mb-1">
              <span className="block">邮箱</span>
              <span className="block text-[9px]">Email</span>
            </dt>
            <dd>
              <a href={`mailto:${site.email}`} className="border-b border-ink font-display text-2xl sm:text-3xl">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">
              <span className="block">工作室</span>
              <span className="block text-[9px]">Studio</span>
            </dt>
            <dd>
              <span className="block">{site.locationCn}</span>
              <span className="block text-[13px]">{site.location}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="lg:pt-6">
        <div className="eyebrow mb-8">
          <span className="block">发送留言</span>
          <span className="block text-[9px]">Send a message</span>
        </div>
        <ContactForm artworkTitles={artworks.map((a) => ({ slug: a.slug, title: a.title, title_cn: a.title_cn }))} />
      </div>
    </div>
  );
}
