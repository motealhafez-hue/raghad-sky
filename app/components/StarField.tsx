'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

type Star = {
  x: number;
  y: number;
  radius: number;
  depth: number;
  phase: number;
  reveal: number;
  linger: number;
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
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function StarField({
  progressRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let animationFrame = 0;
    let active = true;
    let lastDraw = 0;
    let clearedForDay = false;

    const makeStars = () => {
      const random = seededRandom(8241);
      const count = width < 600 ? 76 : width < 900 ? 112 : 148;
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

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX / width - 0.5;
      pointerRef.current.y = event.clientY / height - 0.5;
    };

    const draw = (time: number) => {
      if (!active) return;
      const progress = progressRef.current;
      const frameInterval = progress > 0.965 ? 240 : reducedMotion ? 140 : width < 700 ? 34 : 22;
      if (time - lastDraw < frameInterval) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = time;
      if (progress > 0.965) {
        if (!clearedForDay) {
          context.clearRect(0, 0, width, height);
          clearedForDay = true;
        }
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      clearedForDay = false;
      context.clearRect(0, 0, width, height);
      const dawnFade = 1 - smooth(0.68, 0.94, progress);
      const pointer = reducedMotion ? { x: 0, y: 0 } : pointerRef.current;

      stars.forEach((star, index) => {
        const reveal = smooth(star.reveal, star.reveal + 0.065, progress);
        const linger = 1 - smooth(star.linger, Math.min(0.98, star.linger + 0.12), progress);
        const twinkle = reducedMotion ? 0.83 : 0.62 + Math.sin(time * (0.00045 + star.depth * 0.00055) + star.phase) * 0.28;
        const alpha = clamp(reveal * linger * dawnFade * twinkle);
        if (alpha < 0.015) return;
        const driftX = pointer.x * star.depth * 13;
        const driftY = pointer.y * star.depth * 9;
        const x = star.x * width + driftX;
        const y = star.y * height + driftY;
        const radius = star.radius * (0.75 + star.depth * 0.45);
        const glow = context.createRadialGradient(x, y, 0, x, y, radius * 5.5);
        glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
        glow.addColorStop(0.18, `rgba(223,227,255,${alpha * 0.72})`);
        glow.addColorStop(1, 'rgba(190,198,255,0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, radius * 5.5, 0, Math.PI * 2);
        context.fill();
        if (index % 41 === 0 && alpha > 0.35) {
          context.strokeStyle = `rgba(255,255,255,${alpha * 0.42})`;
          context.lineWidth = 0.45;
          context.beginPath();
          context.moveTo(x - radius * 4, y);
          context.lineTo(x + radius * 4, y);
          context.moveTo(x, y - radius * 4);
          context.lineTo(x, y + radius * 4);
          context.stroke();
        }
      });

      if (!reducedMotion && progress > 0.18 && progress < 0.7) {
        const cycle = (time % 15000) / 15000;
        if (cycle > 0.74 && cycle < 0.83) {
          const t = (cycle - 0.74) / 0.09;
          const x = width * (0.82 - t * 0.34);
          const y = height * (0.14 + t * 0.2);
          const trail = context.createLinearGradient(x, y, x + 115, y - 66);
          trail.addColorStop(0, 'rgba(255,255,255,.85)');
          trail.addColorStop(1, 'rgba(255,255,255,0)');
          context.strokeStyle = trail;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 115, y - 66);
          context.stroke();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      active = !document.hidden;
      if (active) animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [progressRef, reducedMotion]);

  return <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />;
}
