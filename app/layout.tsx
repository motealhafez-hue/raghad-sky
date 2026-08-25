import type { Metadata } from 'next';
import './globals.css';

const title = 'A Sky for Raghad | سماء لرغد';
const description = 'A cinematic birthday journey from twilight to morning, made for Raghad.';

export const metadata: Metadata = {
  metadataBase: new URL('https://raghad-birthday-sky.motealhafez.chatgpt.site'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'A Sky for Raghad—from moonlit night to sunrise' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/owl-atlas.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
