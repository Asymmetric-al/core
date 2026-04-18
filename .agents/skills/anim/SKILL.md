# Tasteful Web Animation — Skill

**Name:** `anim`
**Purpose:** Tasteful, subtle web animations following Emil Kowalski's philosophy and animations.dev principles. Use this skill when adding motion to interfaces — hover states, page transitions, micro-interactions, loading states, or any UI animation — so motion stays refined and purposeful, not decorative noise.

**Applies when:** Adding or reviewing UI motion (CSS, Web APIs, or React); hover and press feedback; entrances/exits; modals, toasts, menus; loading and skeleton patterns; staggered reveals; page or view transitions.

**Do not use when:** Motion would hurt clarity or accessibility; the task is only `motion/react` plumbing — pair with the `motion` skill for API specifics. Skip motion for validation errors, critical errors, actively read content, and high-frequency live updates.

## Workflow

1. Decide what the motion communicates (feedback, hierarchy, spatial continuity) — not decoration.
2. Choose a duration tier: micro-interactions 150–250ms, standard transitions 200–350ms, orchestrations 400–600ms total; keep total under ~1s unless it is true loading feedback.
3. Animate **transform** and **opacity** when possible; entrance **ease-out**, exit **ease-in**, exit **faster** than entrance; pair opacity with a small translate for entrances.
4. Define **reduced-motion** behavior (`prefers-reduced-motion` or `useReducedMotion`); avoid layout-affecting properties and animating on every re-render.
5. Validate at 2× and 0.5× speed, check exits, and sanity-check on lower-end hardware.

## Core Philosophy

**Animation should be invisible.** When done right, users don't notice animation — they notice that the interface feels _good_. The moment someone says "nice animation," you've probably overdone it.

> "The best animations are the ones you don't notice." — Emil Kowalski

## The 40 Rules of Tasteful Animation

### Timing & Duration

1. **Micro-interactions: 150-250ms.** Hovers, button presses, toggles. Anything faster feels instant (good); anything slower feels sluggish (bad).

2. **Standard transitions: 200-350ms.** Modals opening, panels sliding, content appearing. This is your bread and butter.

3. **Complex orchestrations: 400-600ms total.** Page transitions, multi-step reveals. Never longer unless you have a very good reason.

4. **Exit animations should be faster than entrances.** Users are waiting to do something next. Enter at 300ms, exit at 200ms.

5. **Stagger delays: 30-60ms between items.** Longer staggers (100ms+) feel like a slideshow. Keep it tight.

6. **Never animate for more than 1 second total.** If your animation takes longer, it's not an animation - it's a loading screen.

### Easing & Physics

7. **Default to ease-out for entrances.** Elements arriving should decelerate naturally, like a car pulling into a parking spot.

8. **Use ease-in for exits.** Elements leaving should accelerate away, like releasing a bowstring.

9. **Use ease-in-out sparingly.** Only for elements that move from point A to point B while staying on screen (dragging, repositioning).

10. **Never use linear easing for UI.** Linear is for progress bars and looping background animations only. Real objects don't move linearly.

11. **Prefer spring physics for organic motion.** Springs have natural overshoot and settle. In Motion for React, use `transition={{ type: "spring", stiffness: 400, damping: 25 }}` (tune as needed); in CSS, use `cubic-bezier()` or `linear()` curves that approximate a spring.

12. **Match easing to physical metaphor.** Dropping? Ease-in with bounce. Rising? Ease-out. Sliding? Ease-in-out.

13. **Consistent easing across related elements.** If a modal and its backdrop animate together, they must use the same curve.

### What to Animate

14. **Animate transform and opacity only (when possible).** These are GPU-accelerated and won't cause layout thrashing.

15. **Never animate width, height, top, left, margin, or padding.** These trigger expensive layout recalculations. Use transform: scale() or translate() instead.

16. **Animate from a definite state to a definite state.** Never animate to/from `auto` or computed values without measuring first.

17. **Scale from center for growth, from origin for menus.** Dropdowns scale from their trigger. Modals scale from center. Be intentional.

18. **Opacity changes should accompany movement.** Don't just fade - fade AND move. `opacity: 0` + `translateY(8px)` → `opacity: 1` + `translateY(0)`.

19. **Keep movement distances small.** 4-16px for micro-interactions. 20-40px for larger reveals. Anything more looks cartoony.

### Interaction States

20. **Hover: instant on, 150ms off.** Respond immediately when hovering; ease out when leaving so it doesn't "snap" away.

21. **Active/pressed: scale(0.97-0.98).** Subtle compression. Never go below 0.95 - that's cartoon territory.

22. **Focus: never animate the focus ring itself.** Focus indicators are for accessibility. Animate the element, not the indicator.

23. **Disabled elements: no animation.** Disabled means disabled. Don't tease users with hover effects on things they can't click.

24. **Loading states: subtle pulse or skeleton shimmer.** Not spinners unless absolutely necessary. Keep the rhythm calm.

### Entrance & Exit Patterns

25. **Fade + rise for content appearing.** `opacity: 0, y: 8` → `opacity: 1, y: 0`. The classic for a reason.

26. **Fade + sink for content disappearing.** Reverse is not always best. Sometimes exit down, not up, for natural gravity.

27. **Scale for emphasis, translate for navigation.** Opening something important? Scale. Moving to a new view? Slide.

28. **Modals: scale(0.96) + opacity, not scale(0).** Starting from nothing looks cheap. Start nearly there.

29. **Toasts: slide from edge + fade.** Come from where they'll return to. Slide in from right, slide out to right.

30. **Menus: transform-origin at trigger, scale + opacity.** Dropdowns should bloom from their source.

### Orchestration & Staggering

31. **Lead with the most important element.** In a stagger sequence, the primary content animates first.

32. **Background elements animate first, foreground last.** Backdrop → container → content → actions.

33. **Use stagger for related items only.** A list of cards? Stagger. Unrelated UI elements? Animate together.

34. **Keep stagger groups small (3-7 items).** More than that and the last item waits too long.

35. **Exit in reverse order or all-at-once.** Either mirror the entrance stagger (last in, first out) or don't stagger exits at all.

### Performance & Accessibility

36. **Always respect `prefers-reduced-motion`.** Not optional. Wrap motion in `@media (prefers-reduced-motion: no-preference)` or check the query in JS.

37. **Use `will-change` only when needed, remove after.** Apply before animation starts, remove after it ends. Never leave it on permanently.

38. **Avoid animating during scroll.** Scroll-linked animations can jank. Use `scroll-timeline` or Intersection Observer sparingly.

39. **Test on low-end devices.** That buttery M3 Mac animation becomes a slideshow on a $200 Android.

40. **Don't animate layout on mobile.** Mobile browsers struggle with layout animations. Keep it to transforms and opacity.

## CSS Implementation Patterns

### Standard Transition Setup

```css
.element {
  transition:
    transform 200ms ease-out,
    opacity 200ms ease-out;
}

/* Hover: instant on, fade off */
.element:hover {
  transform: translateY(-2px);
  transition-duration: 0ms; /* instant on */
}
.element:not(:hover) {
  transition-duration: 150ms; /* ease off */
}
```

### Fade + Rise Entrance

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entering {
  animation: fadeInUp 250ms ease-out forwards;
}
```

### Spring-like Easing (CSS)

```css
/* Approximated spring curve */
:root {
  --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Stagger Pattern

```css
.item {
  animation: fadeInUp 200ms ease-out backwards;
}
.item:nth-child(1) {
  animation-delay: 0ms;
}
.item:nth-child(2) {
  animation-delay: 40ms;
}
.item:nth-child(3) {
  animation-delay: 80ms;
}
.item:nth-child(4) {
  animation-delay: 120ms;
}
.item:nth-child(5) {
  animation-delay: 160ms;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Motion (Framer Motion) Patterns

### Fade + Rise

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 4 }}
  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
/>
```

### Spring Physics

```tsx
<motion.div
  animate={{ scale: 1 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>
```

### Stagger Children

```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.04 } },
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
    />
  ))}
</motion.ul>
```

### Exit Before Enter (AnimatePresence)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  />
</AnimatePresence>
```

## Common Mistakes to Avoid

- **Bouncy everything.** Bounce is for celebration (confetti, success). Not for opening menus.
- **Slow fades.** If opacity takes more than 200ms, it feels like lag, not elegance.
- **Scale(0) to scale(1).** Looks like things popping into existence from nothing. Start at 0.95+.
- **Inconsistent directions.** If modals enter from bottom, they exit to bottom. Pick a direction and commit.
- **Animating on mount unconditionally.** First page load? Maybe. Every re-render? Definitely not.
- **Forgetting exit animations.** Things snapping away is jarring. Every entrance needs an exit strategy.
- **Using animation to hide slow code.** If you're animating to mask loading, fix the loading instead.
- **Too many things moving at once.** One focal animation, everything else is secondary or static.

## When NOT to Animate

- Form validation errors (use color/icon changes instead)
- Critical error states (don't delay bad news)
- Content the user is actively reading
- High-frequency updates (live data, timers)
- Anything the user will see hundreds of times per session

## Checklists

### Implementation checklist

- [ ] Durations within recommended bands; exits faster than entrances where relevant
- [ ] Primarily transform + opacity (exceptions documented)
- [ ] Reduced motion behavior defined and tested
- [ ] Stagger only for related groups; small counts (about 3–7)

### Review checklist

- [ ] Motion supports the task; it is not the main attraction
- [ ] No motion used to mask slow loads or errors

### Testing checklist

- [ ] Does it feel good at 2x speed? (If not, it's too slow)
- [ ] Does it feel good at 0.5x speed? (If not, it's too fast or lacks easing)
- [ ] Does it work with reduced motion enabled?
- [ ] Does the exit feel as considered as the entrance?
- [ ] Would a user notice if you removed it? (If yes, reconsider)
- [ ] Does it work on a $200 Android phone?

## Shared implementation (this monorepo)

The repo motion contract has **two synchronized halves**:

1. **CSS tokens** in `packages/ui/styles/globals.css` (`:root`) — used by every Tailwind class, Radix surface, and CSS rule.
2. **TS constants** in `packages/lib/motion-presets.ts` — used by every `motion/react` component.

When updating one half, update the other so consumers stay in lockstep.

### CSS tokens (`packages/ui/styles/globals.css :root`)

```css
/* Easing — strong cubic-bezier variants, not the weak built-ins */
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-soft: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out-soft: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1); /* iOS curve */

/* Duration tiers — product UI stays under 300ms unless ceremonial */
--duration-press: 120ms; /* button/tile press feedback */
--duration-micro: 150ms; /* hover, color change */
--duration-standard: 220ms; /* tooltip, popover, dropdown, select */
--duration-modal: 220ms; /* dialog open/close */
--duration-drawer: 320ms; /* sheet / vaul drawer */
--duration-route: 240ms; /* matches asym-vt-route-* */
--duration-shared: 280ms; /* matches asym-vt-share-* */

/* Stagger — keep tight (30–80ms) */
--stagger-tight: 45ms;
--stagger-medium: 60ms;

/* Transform tokens — never go below 0.95 (cartoon territory) */
--scale-press: 0.98;
--scale-hover-subtle: 1.02;
--scale-entrance: 0.96;
```

### CSS utilities (composable, defined in the same file)

| Utility               | What it does                                       | Touch-safe?   | Pair with                           |
| --------------------- | -------------------------------------------------- | ------------- | ----------------------------------- |
| `.press-feedback`     | `:active` scale to `var(--scale-press)`            | Yes (`:active` fires on tap) | Default on every `<Button>` already |
| `.hover-lift`         | `:hover` `translateY(-2px)`                        | Yes (`@media (hover: hover)`) | Cards, tiles                        |
| `.hover-scale-subtle` | `:hover` `scale(var(--scale-hover-subtle))`        | Yes (`@media (hover: hover)`) | Buttons, badges, marketing CTAs     |

The three utilities **share** one `transition-property` declaration so you can stack them on the same element without one overriding another's transition list.

### TS constants (`@asym/lib/motion-presets`)

`EASE_OUT_SOFT`, `EASE_IN_SOFT`, `EASE_IN_OUT_SOFT`, `EASE_DRAWER`, `DURATION_PRESS`, `DURATION_MICRO`, `DURATION_STANDARD`, `DURATION_ROUTE`, `DURATION_SHARED`, `DURATION_DRAWER`, `DURATION_SLOW`, `STAGGER_TIGHT`, `STAGGER_MEDIUM`, `SCALE_HOVER_SUBTLE`, `SCALE_TAP_SUBTLE`, `SCALE_ENTRANCE`. Each mirrors the matching CSS token.

Pre-built `Transition` objects: `transitionStandard`, `transitionSlow`, `transitionExitQuick`, `springTap` (gestures only).

Reduced-motion-aware helpers:

- `propsHeroEntrance(reduceMotion, delay?, y?)` — fade + small rise.
- `propsFadeRiseInView(reduceMotion, options?)` — fade + rise on scroll-in.
- `propsScaleFadeInView(reduceMotion, options?)` — fade + scale from `SCALE_ENTRANCE`.

### `@asym/lib/motion`

Re-exports `motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`, plus `MotionProvider` (a `LazyMotion features={domAnimation}` wrapper). Use these in any client component that already imports from `motion/react`.

## Repo motion standard (operative rules)

These rules are enforced informally by code review; the audit's Phase 7 doc is the source of truth.

### When NOT to animate (in this repo)

- Anything triggered by `⌘K`, `⌘B`, or other keyboard shortcuts. Command palette is intentionally instant — see `packages/ui/components/shadcn/command.tsx`.
- Form validation errors — color/icon/text only.
- Live data, timers, ticker counters — `tabular-nums` and no animation.
- Sortable/filtered list reordering at high frequency — use VT shared morphs or no animation; do not add per-row springs (`packages/missionary/components/tasks/task-row.tsx` is the canonical example).
- Disabled controls — no hover/press feedback (handled by `disabled:pointer-events-none disabled:opacity-50` on `Button`).

### Hover on touch

- Any `hover:scale-*`, `hover:-translate-*`, `hover:shadow-*` lift effect must be wrapped in `@media (hover: hover) and (pointer: fine)`.
- Easiest path: use `.hover-lift` or `.hover-scale-subtle` (both already gated). For ad-hoc `group-hover:` patterns where the parent owns the trigger, use the Tailwind arbitrary variant: `[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[var(--scale-hover-subtle)]`.

### Button press

- All pressable elements get press feedback via the `Button` base (which now includes `.press-feedback`). Native `<button>` elements that don't use the `Button` primitive should add `.press-feedback` directly.
- Never add `active:scale-[0.98]` inline — it duplicates the contract.

### Popover / tooltip / dropdown origin

- Radix-based surfaces use `transform-origin: var(--radix-*-content-transform-origin)`. Already correct in shared primitives — keep it.
- Modals (`Dialog`, full-screen overlays) keep `transform-origin: center`.

### Route transitions

- Owned by `RouteMainViewTransitionBoundary`. Every `apps/*/app/.../layout.tsx` shell wraps the changing region only.
- When a page header / shell uses `motion.div` and is also inside `RouteMainViewTransitionBoundary`, suppress the per-page entrance via `useWithinViewTransitionRouteLayer()` (the `PageShell` pattern is the template).
- Do not add `motion.div layout` on the swapping region.

### CSS transitions vs `motion/react` tweens vs springs

- **CSS transitions** for all state changes (open/close, hover, press, color).
- **`motion/react` tweens** for orchestrated entrances and exits (page mounts, hero strips, lists).
- **Springs** only for gestures and decorative interactions. Not for stat cards, list rows, or buttons.

### Tooltip pattern

- Default `delayDuration={300}`, `skipDelayDuration={0}` — first tooltip waits, subsequent tooltips inside the warm window are instant.
- The sidebar's `<TooltipProvider delayDuration={0}>` is a deliberate exception (collapsed-icon sidebar tooltips should be instant).

### Reduced motion

- The repo-wide `prefers-reduced-motion: reduce` baseline lives **only** in `packages/ui/styles/globals.css`. Apps must not redeclare it.
- Every motion primitive in TS calls `useReducedMotion()` and returns `transition: { duration: 0 }`, `initial: false`, or skips the motion entirely. Pattern examples: `MotionPreset`, `RippleButton`, `AppIcon`, `task-row`, `task-stats`, `feed-post`'s `FloatingEmoji`.
- View Transitions are zeroed in CSS (`globals.css` under `@media (prefers-reduced-motion: reduce)`).

## Repo examples to copy

- **Best primitive example**: `packages/ui/components/shadcn/page-shell.tsx` (motion + tokens + view-transition awareness in one file).
- **Best button**: `packages/ui/components/shadcn/button.tsx` (`press-feedback` on the base; `hover-scale-subtle` for `maia` variants; no `transition: all`).
- **Best card hover**: `apps/admin/features/mission-control/components/tiles/tile-card.tsx` (uses `hover-lift` only, no per-effect translate stack).
- **Best list row**: `packages/missionary/components/tasks/task-row.tsx` (one stagger entrance, no per-row `motion.layout`, no per-element springs, hover lift via `hover-lift`).

## Common mistakes / pitfalls

- Linear easing on interactive UI
- Animating layout properties on mobile or in lists
- Ignoring exit choreography
- Staggering unrelated elements or long lists
- Hover/press feedback on disabled controls

---

_"Animation is not about moving things. It's about not making users wait."_ — Emil Kowalski
