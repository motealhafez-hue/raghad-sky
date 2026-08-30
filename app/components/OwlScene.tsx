'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (value: number) => value < 0.5
  ? 2 * value * value
  : 1 - Math.pow(-2 * value + 2, 2) / 2;

export type OwlSceneHandle = {
  update: (progress: number) => void;
};

type OwlSceneProps = {
  atlasImage: HTMLImageElement;
  reducedMotion: boolean;
};

export const OwlScene = forwardRef<OwlSceneHandle, OwlSceneProps>(function OwlScene(
  { atlasImage, reducedMotion },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef(-1);
  const sizeRef = useRef('');

  const drawFrame = useCallback((frame: number, force = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.6);
    const pixelWidth = Math.max(1, Math.round(bounds.width * dpr));
    const pixelHeight = Math.max(1, Math.round(bounds.height * dpr));
    const sizeKey = `${pixelWidth}x${pixelHeight}`;
    if (!force && frameRef.current === frame && sizeRef.current === sizeKey) return;

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const column = frame % 4;
    const row = Math.floor(frame / 4);
    const cellWidth = atlasImage.naturalWidth / 4;
    const cellHeight = atlasImage.naturalHeight / 4;
    context.globalCompositeOperation = 'source-over';
    context.drawImage(
      atlasImage,
      column * cellWidth,
      row * cellHeight,
      cellWidth,
      cellHeight,
      0,
      0,
      bounds.width,
      bounds.height,
    );

    // A one-percent edge feather removes atlas seams without clipping wing tips.
    context.globalCompositeOperation = 'destination-in';
    const horizontal = context.createLinearGradient(0, 0, bounds.width, 0);
    horizontal.addColorStop(0, 'rgba(0,0,0,0)');
    horizontal.addColorStop(0.012, 'rgba(0,0,0,1)');
    horizontal.addColorStop(0.988, 'rgba(0,0,0,1)');
    horizontal.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = horizontal;
    context.fillRect(0, 0, bounds.width, bounds.height);
    const vertical = context.createLinearGradient(0, 0, 0, bounds.height);
    vertical.addColorStop(0, 'rgba(0,0,0,0)');
    vertical.addColorStop(0.012, 'rgba(0,0,0,1)');
    vertical.addColorStop(0.988, 'rgba(0,0,0,1)');
    vertical.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = vertical;
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.globalCompositeOperation = 'source-over';

    frameRef.current = frame;
    sizeRef.current = sizeKey;
    canvas.dataset.frame = `${frame}`;
  }, [atlasImage]);

  const update = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const branch = branchRef.current;
    if (!canvas || !branch) return;

    progressRef.current = progress;
    const local = clamp((progress - 0.405) / 0.285);
    const appearance = smooth(0.405, 0.438, progress);
    const departure = 1 - smooth(0.675, 0.715, progress);
    const opacity = appearance * departure;
    const branchOpacity = smooth(0.395, 0.43, progress) * (1 - smooth(0.565, 0.625, progress));

    let frame = 0;
    let state = 'perched';
    let x = window.innerWidth < 700 ? 72 : 73.5;
    let y = window.innerWidth < 700 ? 56.5 : 54.3;
    let rotation = -2;
    let scale = window.innerWidth < 700 ? 0.88 : 0.82;

    if (!reducedMotion) {
      if (local < 0.3) {
        frame = Math.min(3, Math.floor((local / 0.3) * 4));
      } else if (local < 0.51) {
        state = local < 0.41 ? 'crouch' : 'takeoff';
        const takeoff = clamp((local - 0.3) / 0.21);
        frame = 4 + Math.min(3, Math.floor(takeoff * 4));
        y += smooth(0, 0.44, takeoff) * 1.1 - smooth(0.42, 1, takeoff) * 4.8;
        rotation = -2 - takeoff * 7;
        scale += takeoff * 0.05;
      } else {
        state = 'flight';
        const flight = ease(clamp((local - 0.51) / 0.49));
        // Exactly 1.75 scroll-driven wing cycles; no elapsed time is consulted.
        frame = 8 + (Math.min(13, Math.floor(flight * 14)) % 8);
        x -= flight * (window.innerWidth < 700 ? 92 : 88);
        y = 50.5 - Math.sin(flight * Math.PI) * (window.innerWidth < 700 ? 31 : 36) + flight * 3;
        rotation = -11 + Math.sin(flight * Math.PI * 2) * 7.5;
        scale += Math.sin(flight * Math.PI) * 0.17;
      }
    }

    canvas.style.opacity = `${opacity}`;
    canvas.style.setProperty('--owl-x', `${x}vw`);
    canvas.style.setProperty('--owl-y', `${y}svh`);
    canvas.style.setProperty('--owl-rotation', `${rotation}deg`);
    canvas.style.setProperty('--owl-scale', `${scale}`);
    canvas.dataset.progress = progress.toFixed(5);
    canvas.dataset.state = reducedMotion ? 'reduced-static' : state;
    branch.style.opacity = `${branchOpacity}`;
    const takeoffFlex = smooth(0.455, 0.535, progress) * (1 - smooth(0.555, 0.625, progress));
    branch.style.setProperty('--branch-flex', `${-1.15 + takeoffFlex * 3.65}deg`);
    branch.dataset.progress = progress.toFixed(5);
    drawFrame(reducedMotion ? 0 : frame);
  }, [drawFrame, reducedMotion]);

  useImperativeHandle(forwardedRef, () => ({ update }), [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      sizeRef.current = '';
      update(progressRef.current);
    });
    observer.observe(canvas);
    update(progressRef.current);
    return () => observer.disconnect();
  }, [update]);

  return (
    <div className="owl-world" aria-hidden="true">
      <div ref={branchRef} className="branch">
        <span className="branch-limb" />
        <span className="branch-bark bark-one" />
        <span className="branch-bark bark-two" />
        <span className="branch-highlight highlight-one" />
        <span className="branch-highlight highlight-two" />
        <span className="branch-knot" />
        <span className="branch-twig twig-one"><i /></span>
        <span className="branch-twig twig-two"><i /></span>
        <span className="branch-twig twig-three" />
      </div>
      <canvas ref={canvasRef} className="owl-canvas" />
    </div>
  );
});
