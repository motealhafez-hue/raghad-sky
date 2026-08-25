'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value: number) => value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

export function OwlScene({
  progressRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const owlRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame = 0;
    const update = (time: number) => {
      const owl = owlRef.current;
      const branch = branchRef.current;
      if (!owl || !branch) return;
      const progress = progressRef.current;
      const local = clamp((progress - 0.46) / 0.235);
      const visible = progress > 0.435 && progress < 0.735;
      owl.style.opacity = visible ? '1' : '0';
      branch.style.opacity = progress > 0.425 && progress < 0.615 ? '1' : '0';

      let frame = 0;
      let x = 73;
      let y = 56;
      let rotation = -2;
      let scale = 0.82;
      if (local < 0.32) {
        frame = reducedMotion ? 0 : Math.floor((time / 850) % 4);
      } else if (local < 0.5) {
        frame = 4 + Math.min(3, Math.floor(((local - 0.32) / 0.18) * 4));
        y -= ease((local - 0.32) / 0.18) * 4;
        rotation = -5;
      } else {
        const flight = ease((local - 0.5) / 0.5);
        frame = reducedMotion ? 10 : 8 + Math.floor((time / 125) % 8);
        x = 73 - flight * 87;
        y = 52 - Math.sin(flight * Math.PI) * 37 + flight * 2;
        rotation = -12 + Math.sin(flight * Math.PI * 2) * 8;
        scale = 0.82 + Math.sin(flight * Math.PI) * 0.18;
      }

      const column = frame % 4;
      const row = Math.floor(frame / 4);
      owl.style.setProperty('--owl-x', `${x}vw`);
      owl.style.setProperty('--owl-y', `${y}vh`);
      owl.style.setProperty('--owl-rotation', `${rotation}deg`);
      owl.style.setProperty('--owl-scale', `${scale}`);
      owl.style.setProperty('--owl-bg-x', `${column * 33.333}%`);
      owl.style.setProperty('--owl-bg-y', `${row * 33.333}%`);
      branch.style.setProperty('--branch-flex', `${local > 0.48 ? 2.2 : -1.2}deg`);
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [progressRef, reducedMotion]);

  return (
    <div className="owl-world" aria-hidden="true">
      <div ref={branchRef} className="branch"><i /><i /><i /></div>
      <div ref={owlRef} className="owl-sprite" />
    </div>
  );
}
