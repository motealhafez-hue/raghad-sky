import type { Metadata } from 'next';
import './globals.css';

const title = 'A Sky for Raghad';
const description = 'A quiet birthday journey through a sky made for Raghad—from first light to morning.';

export const metadata: Metadata = {
  metadataBase: new URL('https://raghad-birthday-sky.motealhafez.chatgpt.site'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/og-raghad-v2.jpg', width: 1200, height: 630, alt: 'A Sky for Raghad—from moonlit night to sunrise' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-raghad-v2.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="fonts-pending">
      <head>
        <link rel="preload" href="/fonts/source-serif-4-latin-v1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-latin-v1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/noto-naskh-arabic-v1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/owl-atlas-v5.avif" as="image" type="image/avif" />
      </head>
      <body className="experience-loading">{children}</body>
    </html>
  );
}
