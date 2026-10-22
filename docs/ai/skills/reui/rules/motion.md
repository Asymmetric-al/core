# Motion

<!-- BEGIN:core-reui-overlay -->

## Core usage

Preserve Core's existing Maia design language and motion tokens. On the
current Pro account, use `lucide-react` for icons; the upstream Motion Icons
recommendation applies only if Ultimate access is explicitly available.
Follow Core's reduced-motion, touch-hover, and shared timing rules in
`docs/ai/rules/frontend.md`, rather than introducing literal timings from the
generic examples below.

<!-- END:core-reui-overlay -->

## Installed motion: never retime it

<!-- gen:installed-motion:start -->

| Installed part     | Duration          |
| ------------------ | ----------------- |
| Overlays           | 100ms             |
| Tooltip            | 150ms (default)   |
| Sheet, sidebar     | 200ms             |
| Navigation menu    | 300ms, exit 150ms |
| rhea control focus | 200ms             |

<!-- gen:installed-motion:end -->

Never add or change `duration-*`, `ease-*`, `animate-*` or `transition-*` on installed parts (`components/ui`, `components/reui`); Button already presses with `active:not-aria-[haspopup]:translate-y-px`.

## House motion: your own code

<!-- gen:house-motion:start -->

| Use                       | Tailwind                                                |
| ------------------------- | ------------------------------------------------------- |
| Hover, press, color       | `transition-colors` (150ms, no duration or ease class)  |
| Reveal or expand          | `duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]`       |
| Large surface (ceiling)   | `duration-300` with the same curve                      |
| An overlay you build      | `duration-100` with the same curve                      |
| Media hover zoom          | `duration-500` with the same curve, `scale-105` at most |
| Width tied to the sidebar | `duration-200 ease-linear`                              |

<!-- gen:house-motion:end -->

- Press on a custom surface (not Button): `transition-transform active:scale-[0.98] motion-reduce:transition-none`.
- Hover color plus press on 1 element: `transition-[color,background-color,border-color,scale]` (`transition-colors` and `transition-transform` override each other; `scale-*` sets `scale`).
- motion/react takes the same values in seconds: `{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }`; hover `{ duration: 0.15 }`.
- Drag, reorder and layout use `const SPRING = { type: "spring", visualDuration: 0.25, bounce: 0 }`. Define `SPRING` only when something drags, reorders or toggles layout.

## Hard rules

- Animate `transform` and `opacity`; color only for hover and press. Never `transition-all`; width, height, top or left only in the sidebar row.
- Never `animate-bounce` or a spring with bounce above 0. `ease-linear` only for progress, spinners, loops and the sidebar; never Tailwind's `ease-in`, `ease-out` or `ease-in-out`.
- `motion/react` only: never framer-motion, GSAP or react-spring.
- At most 1 entrance animation per view (a stagger counts as 1), and every animation has a reduced-motion path. Feedback that appears after an action or a load (an Alert, a field error, a saved notice, data replacing its `Skeleton`) is a reveal, not an entrance: fade it in with the reveal row.
- Never add named `duration-*` utilities or redefine `--ease-out`.
- Loading: a `Skeleton` (it already pulses) in the real layout; a spinner only inside a busy button.
- Motion Icons (Ultimate only): 1 on the primary action is the 1 hover flourish; install it with its `installAnimated` command; never retime it.

## Performance

Each line names its lint rule, or judgement (no check).

- Never animate blur, drop-shadow, backdrop-filter, box-shadow, border-radius, background-position, background-size or a custom property that feeds transform; clip-path and stroke-dashoffset only as a one-shot reveal of 300ms or less, or a loop on an element of 240x240px or less. Name the properties: never a bare `transition` (it also animates box-shadow and filter). (`reui/no-paint-animation`; 240px: judgement (no check))
- A hover lift is `transform` over a static shadow, or a shadow layer whose `opacity` fades; never a transitioned `hover:shadow-*`. (`reui/no-paint-animation`)
- CSS first: hover, press, reveals and ambient loops are Tailwind transitions, `tw-animate-css` or `@keyframes`. motion/react only for exit on unmount, drag, springs that follow input, `layout` and scroll-linked values. (judgement (no check))
- In motion/react, `x`, `y`, `scale`, `rotate`, `pathLength` and every SVG target run on the main thread: never `repeat: Infinity` on them (loop with CSS `@keyframes`), and keep 20 or fewer JS-driven animations running per view. An opacity loop leaves the main thread only on an HTML element without `repeatDelay`, `repeatType: "mirror"` or `onUpdate`. (`reui/no-main-thread-loop`)
- SVG geometry (a rect's `width`, a circle's `r`) does not reflow the page but runs in motion's JS loop: one-shot only. (`reui/no-main-thread-loop`)
- Never set React state per frame (requestAnimationFrame, `useAnimationFrame`, `onUpdate`, scroll or pointermove listeners): bind styles to `useMotionValue`, `useTransform` or a CSS variable on the element. (`reui/no-frame-setstate`)
- A JS-driven loop (motion `repeat`, requestAnimationFrame, canvas) pauses offscreen with `useInView` or IntersectionObserver; `content-visibility: auto` never stops script, and a setInterval loop also pauses on `visibilitychange`. (`reui/loop-offscreen`)
- No permanent `will-change`: no `will-change-*` class or `willChange` style, except during a drag, removed when it ends. (`reui/will-change`)
- Stagger 50ms or less per step (`staggerChildren: 0.05`), only the first 6 items, the whole entrance done in 500ms, first mount only, never on table rows or lists of 20 or more; scroll reveals use `whileInView` with `viewport={{ once: true }}`. (`reui/stagger-budget`; item count and tail: judgement (no check))
- A height reveal (`grid-template-rows`) starts only on a click or key press, runs 200ms or less, 1 at a time; never `initial={{ height: 0 }}`. (`reui/no-layout-transition`)
- The motion `layout` prop on 1 list at a time (about 20 elements), never in data-grid or virtualized rows; drag and drop goes through `@reui/sortable` or `@reui/kanban`. (judgement (no check))
- AnimatePresence `mode="wait"` only with an exit of 150ms or less; `initial={false}` around content present at first render. (`reui/stagger-budget`)
- Never hide the hero or the largest heading behind a motion/react `initial` at opacity 0 (hidden until JavaScript runs). (judgement (no check))
- At most 3 ambient loops per view: CSS `@keyframes` on transform or opacity, a period of 2s or more, exempt from the duration table; once 3 run in a view they pause offscreen (a `content-visibility: auto` wrapper with `contain-intrinsic-size: auto <h>` where nothing paints outside it, or IntersectionObserver toggling `animation-play-state`). At most 50 animating elements per view (Skeletons, loaders and CSS opacity loops not counted). A static blur above 12px, at most 1 per view, only on a surface that neither moves nor sits over motion. (judgement (no check))

## Reduced motion

- Reduced motion is a substitute, not an off switch: replace movement (translate, scale, rotate, slide, zoom, layout, parallax, auto-scroll) with an opacity fade of 150ms or less or an instant change. Keep color and opacity feedback, focus, progress bars, loaders, the Skeleton pulse, chevrons and the switch thumb. (`reui/reduced-motion`)
- The reduced state is the resting state: content never waits at opacity 0, hidden or offset for an animation that will not play; a count-up shows its final value. (`reui/reduced-motion`)
- In every mode an entrance moves 8px or less and starts at scale 0.95 or more; nothing moves a surface larger than half the viewport. (`reui/reduced-motion`; half the viewport: judgement (no check))
- `<MotionConfig reducedMotion="user">` once at the app root (its default ignores the OS) AND a `motion-reduce:` path on every CSS animation (MotionConfig never reaches CSS). An example or block wraps its own motion subtree. (`reui/reduced-motion`)
- MotionConfig makes only transform keys and width, height, top and left instant; opacity, filter, clipPath, pathLength, color and a `transform` string keep animating, so a loop or those keys branch on `useReducedMotion()` and rest on the final value. (`reui/reduced-motion`)
- `useReducedMotion()` is null on the server: never let it pick markup (JSX, className, `initial`) or reach `animate` under `initial={false}`; branch only animate, transition, `while*` or exit values. (`reui/reduced-motion-ssr`)
- No SMIL (`<animate>`, `<animateMotion>`, `<animateTransform>`); canvas and requestAnimationFrame loops draw 1 resting frame under `prefers-reduced-motion: reduce`. (`reui/no-smil`, `reui/reduced-motion`)
- Smooth scroll only under `motion-safe:scroll-smooth`. A focus ring appears at once: never `transition-all`, `transition-shadow` or a bare `transition` on it. (`reui/reduced-motion`, `reui/focus-transition`)
- Loaders and typing dots keep their opacity pulse; every decorative loop gets `motion-reduce:animate-none`, never an inline `style={{ animation }}` (it beats the class). (`reui/reduced-motion`)
- Anything that moves on its own for more than 5 seconds (autoplay, marquee, ticker) gets a visible Pause control, pauses on hover and focus, and never autoplays under reduced motion. (`reui/pausable-autoplay`)
- Installed overlays keep their 100ms fade, zoom and 8px slide under reduced motion: disclosed, not edited; an app that needs WCAG 2.3.3 adds its own override. (judgement (no check))
