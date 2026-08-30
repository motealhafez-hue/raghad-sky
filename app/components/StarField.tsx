'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  radius: number;
  depth: number;
  phase: number;
  reveal: number;
  linger: number;
};

export type StarFieldHandle = {
  update: (progress: number) => void;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function seededRandom(seed = 1977) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export const StarField = forwardRef<StarFieldHandle, { reducedMotion: boolean }>(function StarField(
  { reducedMotion },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const updateRef = useRef<(progress: number) => void>(() => undefined);

  useImperativeHandle(forwardedRef, () => ({
    update(progress: number) {
      updateRef.current(progress);
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let animationFrame = 0;
    let lastDraw = 0;
    let hidden = document.hidden;
    const pointer = { x: 0, y: 0 };
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    const makeStars = () => {
      const random = seededRandom(8241);
      const count = width < 600 ? 72 : width < 900 ? 104 : 142;
      stars = Array.from({ length: count }, (_, index) => ({
        x: random(),
        y: random() * 0.88,
        radius: 0.45 + random() * (index % 17 === 0 ? 1.8 : 1.05),
        depth: 0.25 + random() * 0.75,
        phase: random() * Math.PI * 2,
        reveal: index < 7 ? -0.04 : 0.045 + random() * 0.29,
        linger: 0.69 + random() * 0.22,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.1 : 1.4);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    };

    const drawShootingStar = (progress: number) => {
      const bursts = [[0.235, 0.252], [0.515, 0.532]];
      const active = bursts.find(([start, end]) => progress >= start && progress <= end);
      if (!active || reducedMotion) return;
      const t = (progress - active[0]) / (active[1] - active[0]);
      const x = width * (0.82 - t * 0.34);
      const y = height * (0.14 + t * 0.2);
      const trail = context.createLinearGradient(x, y, x + 115, y - 66);
      trail.addColorStop(0, 'rgba(255,255,255,.82)');
      trail.addColorStop(1, 'rgba(255,255,255,0)');
      context.strokeStyle = trail;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 115, y - 66);
      context.stroke();
    };

    const draw = (time: number) => {
      const progress = progressRef.current;
      context.clearRect(0, 0, width, height);
      canvas.dataset.progress = progress.toFixed(5);
      if (progress > 0.965) return;

      const dawnFade = 1 - smooth(0.68, 0.94, progress);
      stars.forEach((star, index) => {
        const reveal = smooth(star.reveal, star.reveal + 0.065, progress);
        const linger = 1 - smooth(star.linger, Math.min(0.98, star.linger + 0.12), progress);
        const twinkle = reducedMotion ? 0.84 : 0.66 + Math.sin(time * (0.00035 + star.depth * 0.00045) + star.phase) * 0.22;
        const alpha = clamp(reveal * linger * dawnFade * twinkle);
        if (alpha < 0.015) return;
        const driftX = reducedMotion || coarsePointer ? 0 : pointer.x * star.depth * 11;
        const driftY = reducedMotion || coarsePointer ? 0 : pointer.y * star.depth * 8;
        const x = star.x * width + driftX;
        const y = star.y * height + driftY;
        const radius = star.radius * (0.75 + star.depth * 0.45);
        const glow = context.createRadialGradient(x, y, 0, x, y, radius * 5.2);
        glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
        glow.addColorStop(0.18, `rgba(223,227,255,${alpha * 0.72})`);
        glow.addColorStop(1, 'rgba(190,198,255,0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, radius * 5.2, 0, Math.PI * 2);
        context.fill();
        if (index % 41 === 0 && alpha > 0.35) {
          context.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
          context.lineWidth = 0.45;
          context.beginPath();
          context.moveTo(x - radius * 4, y);
          context.lineTo(x + radius * 4, y);
          context.moveTo(x, y - radius * 4);
          context.lineTo(x, y + radius * 4);
          context.stroke();
        }
      });
      drawShootingStar(progress);
    };

    const tick = (time: number) => {
      animationFrame = 0;
      if (hidden || reducedMotion || progressRef.current > 0.965) return;
      const interval = width < 700 ? 38 : 26;
      if (time - lastDraw >= interval) {
        draw(time);
        lastDraw = time;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!animationFrame && !hidden && !reducedMotion && progressRef.current <= 0.965) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    updateRef.current = (progress: number) => {
      progressRef.current = progress;
      if (reducedMotion || progress > 0.965) draw(0);
      else startLoop();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (coarsePointer || reducedMotion || !width || !height) return;
      pointer.x = event.clientX / width - 0.5;
      pointer.y = event.clientY / height - 0.5;
    };
    const onResize = () => {
      resize();
      draw(reducedMotion ? 0 : performance.now());
      startLoop();
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        draw(reducedMotion ? 0 : performance.now());
        startLoop();
      }
    };

    resize();
    draw(0);
    startLoop();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(animationFrame);
      updateRef.current = () => undefined;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />;
});
