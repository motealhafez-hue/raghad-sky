'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { AmbientAudio } from './AmbientAudio';
import { useExperienceAssets } from './ExperienceAssets';
import { OwlScene, type OwlSceneHandle } from './OwlScene';
import { StarField, type StarFieldHandle } from './StarField';
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
        {([['112', '248'], ['214', '178'], ['316', '264'], ['422', '142'], ['512', '238'], ['626', '166']] as const)
          .map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" />)}
      </g>
      <g className="constellation constellation-two">
        <path pathLength="1" d="M604 418 L690 342 L778 402 L862 306 L928 388" />
        {([['604', '418'], ['690', '342'], ['778', '402'], ['862', '306'], ['928', '388']] as const)
          .map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" />)}
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

function FinalHeart() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="final-heart">
      <button
        type="button"
        className={liked ? 'heart-button is-liked' : 'heart-button'}
        aria-label={liked ? 'Remove like' : 'Like'}
        aria-pressed={liked}
        onClick={() => setLiked((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
      </button>
      <p dir="auto">Angel without wings?</p>
    </div>
  );
}

export function BirthdayJourney() {
  const mainRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const owlRef = useRef<OwlSceneHandle>(null);
  const starsRef = useRef<StarFieldHandle>(null);
  const { atlas, ready } = useExperienceAssets();
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
    if (!ready || !atlas || !main || !stage) return;

    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const body = document.body;
    const sections = Array.from(main.querySelectorAll<HTMLElement>('.story-chapter'));
    let anchors: number[] = [];
    let updateFrame = 0;

    const rebuildAnchors = () => {
      const pageY = window.scrollY;
      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      anchors = sections.map((section) => {
        const top = section.getBoundingClientRect().top + pageY;
        return clamp(top + section.offsetHeight * 0.5 - window.innerHeight * 0.5, 0, maxScroll);
      });
      anchors[0] = 0;
      anchors[anchors.length - 1] = maxScroll;
      for (let index = 1; index < anchors.length; index += 1) {
        anchors[index] = Math.max(anchors[index], anchors[index - 1] + 1);
      }
    };

    const semanticProgress = () => {
      const scrollY = clamp(window.scrollY, 0, root.scrollHeight - window.innerHeight);
      if (!anchors.length || scrollY <= anchors[0]) return 0;
      const lastIndex = anchors.length - 1;
      if (scrollY >= anchors[lastIndex]) return 1;
      for (let index = 0; index < lastIndex; index += 1) {
        if (scrollY <= anchors[index + 1]) {
          const segment = clamp((scrollY - anchors[index]) / Math.max(1, anchors[index + 1] - anchors[index]));
          return (index + segment) / lastIndex;
        }
      }
      return 1;
    };

    const applyProgress = () => {
      updateFrame = 0;
      const progress = semanticProgress();
      const night = smooth(0.055, 0.3, progress) * (1 - smooth(0.68, 0.9, progress));
      const dawn = smooth(0.64, 0.82, progress) * (1 - smooth(0.9, 1, progress));
      const day = smooth(0.82, 0.985, progress);
      const backdrop = smooth(0.74, 0.98, progress);
      const backdropColor = `rgb(${Math.round(9 + 239 * backdrop)} ${Math.round(11 + 212 * backdrop)} ${Math.round(38 + 151 * backdrop)})`;
      const constellations = smooth(0.24, 0.39, progress) * (1 - smooth(0.66, 0.83, progress));
      const moonPhase = smooth(0.12, 0.58, progress);
      const moonFade = 1 - smooth(0.7, 0.88, progress);
      const moonX = 84 - moonPhase * 48 - smooth(0.58, 0.8, progress) * 18;
      const moonY = 66 - Math.sin(Math.min(1, progress / 0.68) * Math.PI) * 47;

      main.dataset.semanticProgress = progress.toFixed(5);
      stage.style.setProperty('--progress', `${progress}`);
      main.style.setProperty('--progress', `${progress}`);
      main.style.setProperty('--phrase-shift', `${(progress * -18).toFixed(2)}px`);
      stage.style.setProperty('--night', `${night}`);
      stage.style.setProperty('--dawn', `${dawn}`);
      stage.style.setProperty('--day', `${day}`);
      stage.style.setProperty('--constellation', `${constellations}`);
      stage.style.setProperty('--moon-x', `${moonX}vw`);
      stage.style.setProperty('--moon-y', `${moonY}svh`);
      stage.style.setProperty('--moon-opacity', `${smooth(0.09, 0.21, progress) * moonFade}`);
      stage.style.setProperty('--moon-scale', `${0.68 + smooth(0.18, 0.52, progress) * 0.46}`);
      stage.style.setProperty('--sunrise', `${smooth(0.77, 0.96, progress)}`);
      stage.style.setProperty('--haze', `${smooth(0.62, 0.9, progress)}`);
      root.style.backgroundColor = backdropColor;
      body.style.backgroundColor = backdropColor;
      starsRef.current?.update(progress);
      owlRef.current?.update(progress);
    };

    const requestProgress = () => {
      if (!updateFrame) updateFrame = requestAnimationFrame(applyProgress);
    };

    const context = gsap.context(() => {
      sections.forEach((section, index) => {
        const copy = section.querySelector<HTMLElement>('.chapter-copy');
        if (!copy) return;
        if (reducedMotion) {
          gsap.set(copy, { opacity: 1, y: 0, filter: 'none' });
          return;
        }

        if (index === 0) {
          gsap.set(copy, { opacity: 1, y: 0, filter: 'blur(0px)' });
          gsap.to(copy, {
            opacity: 0,
            y: -18,
            filter: 'blur(2px)',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'bottom 54%', end: 'bottom 18%', scrub: true },
          });
          return;
        }

        if (section.dataset.final === 'true') {
          gsap.fromTo(copy,
            { opacity: 0, y: 26, filter: 'blur(3px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top 91%', end: 'top 47%', scrub: true },
            },
          );
          return;
        }

        gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 92%', end: 'bottom 12%', scrub: true },
        })
          .fromTo(copy,
            { opacity: 0, y: 28, filter: 'blur(3px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'none', duration: 0.17 },
          )
          .to(copy, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'none', duration: 0.66 })
          .to(copy, { opacity: 0, y: -18, filter: 'blur(2px)', ease: 'none', duration: 0.17 });
      });
    }, main);

    const journeyTrigger = ScrollTrigger.create({
      trigger: main,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: requestProgress,
      onRefresh: () => {
        rebuildAnchors();
        requestProgress();
      },
    });
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('resize', onResize, { passive: true });

    rebuildAnchors();
    applyProgress();
    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(updateFrame);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('resize', onResize);
      journeyTrigger.kill();
      context.revert();
      root.style.removeProperty('background-color');
      body.style.removeProperty('background-color');
    };
  }, [atlas, ready, reducedMotion]);

  return (
    <>
      {!ready && (
        <div className="readiness-screen" role="status" aria-label="Loading the sky">
          <span aria-hidden="true" />
        </div>
      )}
      <main ref={mainRef} className={ready ? 'journey-shell is-ready' : 'journey-shell'} aria-busy={!ready}>
        <div ref={stageRef} className="sky-stage" aria-hidden="true">
          <div className="sky-layer twilight-layer" />
          <div className="sky-layer night-layer" />
          <div className="sky-layer dawn-layer" />
          <div className="sky-layer day-layer" />
          <div className="atmospheric-haze" />
          <StarField ref={starsRef} reducedMotion={reducedMotion} />
          <ConstellationLayer />
          <Moon />
          {atlas && <OwlScene ref={owlRef} atlasImage={atlas.image} reducedMotion={reducedMotion} />}
          <Sunrise />
          <div className="grain" />
        </div>

        <div className="experience-ui">
          <div className="scroll-progress" aria-hidden="true"><i /></div>
          <AmbientAudio labels={birthdayStory.audioLabels} />
        </div>

        <div className="story-track">
          {birthdayStory.chapters.map((chapter, index) => (
            <section
              className={`story-chapter align-${chapter.align} length-${chapter.length ?? 'standard'} ${chapter.final ? 'final-chapter' : ''}`}
              id={chapter.id}
              key={chapter.id}
              data-final={chapter.final ? 'true' : undefined}
              data-chapter-index={index + 1}
              aria-labelledby={`${chapter.id}-heading`}
            >
              {chapter.floating && (
                <div className="floating-phrases" aria-hidden="true">
                  {chapter.floating.map((phrase) => (
                    <span key={phrase.text} style={{ left: `${phrase.x}%`, top: `${phrase.y}%` }}>
                      <b dir="auto">{phrase.text}</b>
                    </span>
                  ))}
                </div>
              )}
              <div className="chapter-copy">
                <p className="chapter-eyebrow" dir="auto">{chapter.eyebrow}</p>
                {index === 0 ? (
                  <>
                    <h1 id={`${chapter.id}-heading`} className="opening-name" dir="auto">{birthdayStory.name}</h1>
                    <div className="opening-lines">
                      {birthdayStory.openingLines.map((line) => <p className="opening-line" dir="auto" key={line}>{line}</p>)}
                    </div>
                    <div className="scroll-cue" aria-hidden="true"><i /><span>{birthdayStory.scrollCue}</span></div>
                  </>
                ) : chapter.final ? (
                  <div className="final-message">
                    <p className="final-for" dir="auto">{birthdayStory.finalIntro}</p>
                    <h2 id={`${chapter.id}-heading`} dir="auto">{birthdayStory.finalHeading}</h2>
                    <div className="final-divider" aria-hidden="true"><i /><span>✦</span><i /></div>
                    <div className="final-paragraphs">
                      {birthdayStory.finalParagraphs.map((paragraph) => (
                        <p dir="auto" key={paragraph.join(' ')}>
                          {paragraph.map((line, lineIndex) => <span key={line}>{lineIndex > 0 && <br />}{line}</span>)}
                        </p>
                      ))}
                    </div>
                    <FinalHeart />
                  </div>
                ) : (
                  <>
                    <h2 id={`${chapter.id}-heading`} className="sr-only">{chapter.eyebrow}</h2>
                    <div className="story-blocks">
                      {chapter.blocks.map((block, blockIndex) => (
                        <div className={`story-block tone-${block.tone ?? 'body'} ${block.gapBefore ? 'has-gap' : ''}`} key={`${chapter.id}-${blockIndex}`}>
                          {block.lines.map((line) => (
                            <p
                              key={line}
                              lang={block.tone === 'verse' ? 'ar' : undefined}
                              dir={block.tone === 'verse' ? 'rtl' : 'auto'}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
