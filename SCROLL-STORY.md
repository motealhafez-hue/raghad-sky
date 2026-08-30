# A Sky for Raghad — scroll and animation record

The journey uses the measured center of every actual chapter as a semantic anchor. Longer text changes physical pacing without shifting a chapter’s intended atmosphere. Native scrolling drives one batched update; GSAP/ScrollTrigger scrubs chapter copy.

| Slide | Scroll stage | Sky and scene | Owl and branch | Visible words |
| --- | --- | --- | --- | --- |
| 1 | Twilight / 0% | Twilight gradient; first deterministic stars begin revealing. | Hidden. | Name, two opening lines, scroll cue. |
| 2 | Early night / ~9% | Stars deepen; moon begins its curved rise. | Hidden. | “Quiet beginnings” copy. |
| 3 | Night waking / ~18% | Night palette strengthens; moon rises. | Hidden. | “The exception” copy. |
| 4 | Constellations / ~27% | Constellation lines draw with scroll; star depth increases. | Hidden. | “What the sky remembers” copy. |
| 5 | Moonlit night / ~36% | Moon reaches its clearest presence. | Hidden. | “Through my eyes” copy. |
| 6 | Kept words / ~45% | Floating words move only as scroll progress changes. | Branch enters; owl approaches its perched pose. | “The words you kept” plus three floating phrases. |
| 7 | Messenger / ~55% | Deep night remains stable around the action. | Perched frames, crouch, wing spread, push-off, and flight frames are derived only from scroll. Feet align to the upper branch surface before takeoff. | “A messenger” copy. |
| 8 | To strive / ~64% | Constellations soften; the visual holds around the verse. | Scroll-driven flight continues and exits; branch flex reverses naturally with reverse scrolling. | English lead and the Arabic verse only. |
| 9 | Turning / ~73% | Dawn begins; stars fade in staggered order. | Hidden after departure. | “What changes us” copy. |
| 10 | Last light / ~82% | Horizon bloom grows; moon softens. | Hidden. | “A little longer” copy. |
| 11 | Morning / ~91% | Sky crosses into sunrise and daylight. | Hidden. | “Morning” copy. |
| 12 | Day / 100% | Bright daylight, haze, sun glow, and stable page background. | Hidden. | Final birthday message, heart, and `Angel without wings?`. |

## Motion invariants

- Owl position, scale, rotation, body pose, wing pose, and atlas frame are pure functions of semantic scroll progress.
- Stopping the scroll freezes the exact transform and the exact wing/frame state. No owl animation loop or timer exists.
- Reverse scrolling reverses every owl and branch state deterministically.
- The owl canvas redraws only when its frame or rendered size changes.
- Text entry, reading hold, and exit are scrubbed by ScrollTrigger; they never finish on an elapsed-time tween after scrolling stops.
- Shooting stars use short scroll ranges, not wall-clock time.
- Only subtle star twinkle uses a lightweight loop; it pauses in a hidden tab and stops after daylight.
- Reduced motion removes continuous twinkle, pointer parallax, rapid owl frame changes, and text motion while preserving all copy.

## Readiness and fallbacks

- Scrolling remains locked behind a silent readiness screen until one owl atlas format has decoded.
- Atlas order: `owl-atlas-v5.avif` → `owl-atlas-v5.webp` → `owl-atlas-v5.png`.
- The selected image object decodes once and stays in memory for all 16 canvas frames.
- Required local WOFF2 fonts are given at most 1500 ms. If they miss that budget, CSS variables lock to the session fallbacks, so no late font swap can move the story.
- Sound remains off until the visitor presses `Play the sky`.
