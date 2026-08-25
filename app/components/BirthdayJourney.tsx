'use client';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { AmbientAudio } from './AmbientAudio';
import { OwlScene } from './OwlScene';
import { StarField } from './StarField';
import { birthdayStory } from '../content/story';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function ConstellationLayer() {
  return (
    <svg className="constellation-layer" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="constellation constellation-one">
        <path pathLength="1" d="M112 248 L214 178 L316 264 L422 142 L512 238 L626 166" />
        {[['112','248'],['214','178'],['316','264'],['422','142'],['512','238'],['626','166']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" />)}
      </g>
      <g className="constellation constellation-two">
        <path pathLength="1" d="M604 418 L690 342 L778 402 L862 306 L928 388" />
        {[['604','418'],['690','342'],['778','402'],['862','306'],['928','388']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" />)}
      </g>
    </svg>
  );
}

function Moon() {
  return (
    <div className="moon-wrap" aria-hidden="true">
      <div className="moon">
        <i className="crater crater-one" />
        <i className="crater crater-two" />
        <i className="crater crater-three" />
        <i className="crater crater-four" />
      </div>
    </div>
  );
}

function Sunrise() {
  return (
    <div className="sunrise" aria-hidden="true">
      <div className="sun-halo" />
      <div className="sun-disc" />
      <div className="distant-horizon horizon-back" />
      <div className="distant-horizon horizon-front" />
    </div>
  );
}

export function BirthdayJourney() {
  const mainRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    const stage = stageRef.current;
    if (!main || !stage) return;
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let lenisFrame = 0;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (!reducedMotion && !coarsePointer) {
      lenis = new Lenis({ duration: 1.12, smoothWheel: true, wheelMultiplier: 0.82, touchMultiplier: 1.05 });
      const frame = (time: number) => {
        lenis?.raf(time);
        lenisFrame = requestAnimationFrame(frame);
      };
      lenis.on('scroll', ScrollTrigger.update);
      lenisFrame = requestAnimationFrame(frame);
    }

    const applyProgress = (progress: number) => {
      progressRef.current = progress;
      const night = smooth(0.055, 0.3, progress) * (1 - smooth(0.68, 0.9, progress));
      const dawn = smooth(0.64, 0.82, progress) * (1 - smooth(0.9, 1, progress));
      const day = smooth(0.82, 0.985, progress);
      const constellations = smooth(0.24, 0.39, progress) * (1 - smooth(0.66, 0.83, progress));
      const moonPhase = smooth(0.12, 0.58, progress);
      const moonFade = 1 - smooth(0.7, 0.88, progress);
      const moonX = 84 - moonPhase * 48 - smooth(0.58, 0.8, progress) * 18;
      const moonY = 66 - Math.sin(Math.min(1, progress / 0.68) * Math.PI) * 47;
      stage.style.setProperty('--progress', `${progress}`);
      main.style.setProperty('--progress', `${progress}`);
      stage.style.setProperty('--night', `${night}`);
      stage.style.setProperty('--dawn', `${dawn}`);
      stage.style.setProperty('--day', `${day}`);
      stage.style.setProperty('--constellation', `${constellations}`);
      stage.style.setProperty('--moon-x', `${moonX}vw`);
      stage.style.setProperty('--moon-y', `${moonY}vh`);
      stage.style.setProperty('--moon-opacity', `${smooth(0.09, 0.21, progress) * moonFade}`);
      stage.style.setProperty('--moon-scale', `${0.68 + smooth(0.18, 0.52, progress) * 0.46}`);
      stage.style.setProperty('--sunrise', `${smooth(0.77, 0.96, progress)}`);
      stage.style.setProperty('--haze', `${smooth(0.62, 0.9, progress)}`);
    };

    const journeyTrigger = ScrollTrigger.create({
      trigger: main,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => applyProgress(self.progress),
    });

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.story-chapter').forEach((section) => {
        const copy = section.querySelector('.chapter-copy');
        if (!copy) return;
        gsap.fromTo(copy, { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 34, filter: reducedMotion ? 'blur(0px)' : 'blur(4px)' }, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: reducedMotion ? 0.01 : 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 84%', toggleActions: 'play none none reverse' },
        });
      });
    }, main);

    applyProgress(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    ScrollTrigger.refresh();
    return () => {
      context.revert();
      journeyTrigger.kill();
      lenis?.destroy();
      cancelAnimationFrame(lenisFrame);
    };
  }, [reducedMotion]);

  return (
    <main ref={mainRef} className="journey-shell">
      <div ref={stageRef} className="sky-stage" aria-hidden="true">
        <div className="sky-layer twilight-layer" />
        <div className="sky-layer night-layer" />
        <div className="sky-layer dawn-layer" />
        <div className="sky-layer day-layer" />
        <div className="atmospheric-haze" />
        <StarField progressRef={progressRef} reducedMotion={reducedMotion} />
        <ConstellationLayer />
        <Moon />
        <OwlScene progressRef={progressRef} reducedMotion={reducedMotion} />
        <Sunrise />
        <div className="grain" />
      </div>

      <div className="experience-ui">
        <AmbientAudio labels={birthdayStory.audioLabels} />
      </div>

      <div className="story-track">
        {birthdayStory.chapters.map((chapter, index) => (
          <section
            className={`story-chapter align-${chapter.align} ${chapter.final ? 'final-chapter' : ''}`}
            id={chapter.id}
            key={chapter.id}
            data-final={chapter.final ? 'true' : undefined}
            aria-labelledby={`${chapter.id}-heading`}
          >
            {chapter.floating && (
              <div className="floating-phrases" aria-hidden="true">
                {chapter.floating.map((phrase) => (
                  <span key={phrase.english} style={{ left: `${phrase.x}%`, top: `${phrase.y}%` }}>
                    <b dir="auto">{phrase.english}</b>
                    <em lang="ar" dir="rtl">{phrase.arabic}</em>
                  </span>
                ))}
              </div>
            )}
            <div className="chapter-copy">
              <p className="chapter-eyebrow">{chapter.eyebrow}</p>
              {index === 0 ? (
                <>
                  <h1 id={`${chapter.id}-heading`} className="opening-name">
                    {birthdayStory.nameLatin}<span>·</span><b lang="ar" dir="rtl">{birthdayStory.nameArabic}</b>
                  </h1>
                  <p className="opening-line" dir="auto">{birthdayStory.openingInvitation.english}</p>
                  <p className="arabic-line" lang="ar" dir="rtl">{birthdayStory.openingInvitation.arabic}</p>
                  <div className="scroll-cue" aria-hidden="true"><i /><span>Follow the sky · اتبعي السماء</span></div>
                </>
              ) : chapter.final ? (
                <div className="final-message">
                  <p className="final-for">For every beautiful morning ahead</p>
                  <h2 id={`${chapter.id}-heading`}>{birthdayStory.finalHeading.english}</h2>
                  <h3 lang="ar" dir="rtl">{birthdayStory.finalHeading.arabic}</h3>
                  <div className="final-divider"><i /><span>✦</span><i /></div>
                  <p dir="auto">{birthdayStory.finalMessage.english}</p>
                  <p className="final-arabic" lang="ar" dir="rtl">{birthdayStory.finalMessage.arabic}</p>
                </div>
              ) : (
                <>
                  <h2 id={`${chapter.id}-heading`} className="sr-only">{chapter.eyebrow}</h2>
                  <div className="english-copy" dir="auto">
                    {chapter.english.map((line) => <p key={line}>{line}</p>)}
                  </div>
                  <div className="arabic-copy" lang="ar" dir="rtl">
                    {chapter.arabic.map((line) => <p key={line}>{line}</p>)}
                  </div>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
