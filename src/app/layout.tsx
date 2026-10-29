import type { Metadata, Viewport } from 'next';
import { DM_Sans, Libre_Caslon_Display } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const libreCaslon = Libre_Caslon_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-libre-caslon',
  display: 'swap',
});

const title = `${site.name} | Contemporary Watercolors`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title,
    description: site.description,
    url: '/',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: '#f7f6f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" className={`${dmSans.variable} ${libreCaslon.variable}`}>
      <body>{children}</body>
    </html>
  );
}
