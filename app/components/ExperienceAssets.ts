'use client';

import { useEffect, useState } from 'react';

type AtlasAsset = {
  image: HTMLImageElement;
  url: string;
};

type ExperienceAssets = {
  atlas: AtlasAsset | null;
  ready: boolean;
};

const atlasSources = [
  '/owl-atlas-v5.avif',
  '/owl-atlas-v5.webp',
  '/owl-atlas-v5.png',
];

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.onload = async () => {
      try {
        await image.decode();
        resolve(image);
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error(`Unable to load ${url}`));
    image.src = url;
  });
}

async function loadFirstSupportedAtlas(): Promise<AtlasAsset> {
  for (const url of atlasSources) {
    try {
      const image = await loadImage(url);
      if (image.naturalWidth === 1536 && image.naturalHeight === 1024) {
        return { image, url };
      }
    } catch {
      // The next source is the intended format fallback.
    }
  }
  throw new Error('No owl atlas format could be decoded.');
}

async function settleCriticalFonts() {
  if (!document.fonts?.load) return 'fallback' as const;

  let timeout = 0;
  const fallback = new Promise<'fallback'>((resolve) => {
    timeout = window.setTimeout(() => resolve('fallback'), 1500);
  });
  const fonts = Promise.all([
    document.fonts.load('400 1em "Source Serif 4 Local"', 'A Sky for Raghad'),
    document.fonts.load('500 1em "Inter Local"', 'Play the sky'),
    document.fonts.load('400 1em "Noto Naskh Arabic Local"', 'وَأَنَّ سَعْيَهُ'),
  ]).then(() => 'ready' as const).catch(() => 'fallback' as const);

  const result = await Promise.race([fonts, fallback]);
  window.clearTimeout(timeout);
  return result;
}

export function useExperienceAssets(): ExperienceAssets {
  const [atlas, setAtlas] = useState<AtlasAsset | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const html = document.documentElement;
    const body = document.body;

    const prepare = async () => {
      const [fontMode, decodedAtlas] = await Promise.all([
        settleCriticalFonts(),
        loadFirstSupportedAtlas(),
      ]);
      if (cancelled) return;

      html.classList.remove('fonts-pending', 'fonts-ready', 'fonts-fallback');
      html.classList.add(fontMode === 'ready' ? 'fonts-ready' : 'fonts-fallback');
      html.dataset.owlAtlas = decodedAtlas.url;
      html.dataset.experienceReadyAt = `${Math.round(performance.now())}`;
      body.classList.remove('experience-loading');
      body.classList.add('experience-ready');
      setAtlas(decodedAtlas);
      setReady(true);
    };

    void prepare();
    return () => {
      cancelled = true;
    };
  }, []);

  return { atlas, ready };
}
