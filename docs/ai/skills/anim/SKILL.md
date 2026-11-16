---
name: anim
description: "Core's motion contract: shared easing, duration, stagger, and scale tokens; press/hover utilities; motion/react import rules; route view transitions; tooltip timing; and the reduced-motion baseline. Use when adding or reviewing interface motion in Core — hover and press feedback, entrances and exits, modals, toasts, menus, loading and skeleton states, staggered reveals, page or view transitions. Load emil-design-engineering for animation craft and the motion skill for motion/react API specifics."
---

# Core motion contract

Use this skill for the repository's operative motion rules. For animation
craft (timing, easing, choreography, when not to animate), load
`docs/ai/skills/emil-design-engineering/SKILL.md` first. For `motion/react`
API details, use the `motion` skill.

## Workflow

1. Decide what the motion communicates (feedback, hierarchy, spatial continuity). If it is decoration, leave it out.
2. Use the shared tokens, utilities, and presets below instead of raw durations, curves, or scales.
3. Animate `transform` and `opacity`; entrances ease out, exits ease in and run faster than entrances.
4. Define reduced-motion behavior and check the route view-transition rules when the element sits inside an app shell.
5. Run `node scripts/check-motion-patterns.mjs <files>` on changed files; `tests/unit/motion-contract.test.ts` guards the banned class patterns.

## Two synchronized halves

1. **CSS tokens** in `packages/ui/styles/globals.css` (`:root`) — the baseline for Tailwind, Base UI surfaces, and global CSS.
2. **TS constants** in `packages/lib/motion-presets.ts` (`@asym/lib/motion-presets`) — the pair for `motion/react` and shared helpers. Prefer these over raw literals.

When updating one half, update the other.

### CSS tokens (`packages/ui/styles/globals.css :root`)

```css
/* Easing */
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

/* Stagger */
--stagger-tight: 45ms;
--stagger-medium: 60ms;

/* Transform — never below 0.95 */
--scale-press: 0.98;
--scale-hover-subtle: 1.02;
--scale-entrance: 0.96;
```

The values in `globals.css` are authoritative; keep this copy in sync when tokens change.

### CSS utilities (same file)

| Utility               | What it does                                                                  | Touch-safe?                                       | Pair with                         |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------- |
| `.press-feedback`     | `:active` scale to `var(--scale-press)`                                       | Yes (`:active` fires on tap)                      | Already on every `<Button>`       |
| `.hover-lift`         | `:hover` `translateY(-2px)`                                                   | Yes (`@media (hover: hover) and (pointer: fine)`) | Cards, tiles, list rows           |
| `.hover-scale-subtle` | `:hover` `scale(var(--scale-hover-subtle))`                                   | Yes (`@media (hover: hover) and (pointer: fine)`) | Buttons, badges, marketing CTAs   |
| `.spinner-essential`  | infinite spin exempt from the reduced-motion kill (essential status feedback) | Yes                                               | `Loader2` loading indicators only |

The first three share one `transition-property` declaration, so they can be stacked on one element without overriding each other's transition list.

### TS constants (`@asym/lib/motion-presets`)

`EASE_OUT_SOFT`, `EASE_IN_SOFT`, `EASE_IN_OUT_SOFT`, `EASE_DRAWER`, `DURATION_PRESS`, `DURATION_MICRO`, `DURATION_STANDARD`, `DURATION_ROUTE`, `DURATION_SHARED`, `DURATION_DRAWER`, `DURATION_SLOW`, `STAGGER_TIGHT`, `STAGGER_MEDIUM`, `SCALE_HOVER_SUBTLE`, `SCALE_TAP_SUBTLE`, `SCALE_ENTRANCE`. They match the CSS tokens in numeric intent, not always in name (`DURATION_SLOW` is a TS-only marketing/hero tier; `SCALE_TAP_SUBTLE` matches `--scale-press`).

Pre-built `Transition` objects: `transitionStandard`, `transitionSlow`, `transitionExitQuick`, `springTap` (gestures only).

Reduced-motion-aware helpers:

- `propsHeroEntrance(reduceMotion, delay?, y?)` — fade + small rise.
- `propsFadeRiseInView(reduceMotion, options?)` — fade + rise on scroll-in.
- `propsScaleFadeInView(reduceMotion, options?)` — fade + scale from `SCALE_ENTRANCE`.

### `@asym/lib/motion` and `@asym/lib/motion-provider`

ESLint (`tooling/eslint-config/restricted-imports.mjs`) bans importing `motion/react` or `framer-motion` directly. Import from `@asym/lib/motion`, which exports `motion` (the lazy `m` component), `AnimatePresence`, `LayoutGroup`, `LazyMotion`, `domAnimation`, `useInView`, `useReducedMotion`, and the common types.

Because `motion` is the lazy `m` component, it needs the `MotionProvider` from `@asym/lib/motion-provider` above it (`LazyMotion features={domAnimation}` plus `MotionConfig reducedMotion="user"`). Each app's root `layout.tsx` already mounts it.

## Repo motion standard (operative rules)

`packages/ui/styles/globals.css` and `packages/lib/motion-presets.ts` are the runtime contract. This file and the Motion section of `docs/ai/rules/frontend.md` describe how to apply it; keep them in sync when policy changes.

### When not to animate

- Anything triggered by `⌘K`, `⌘B`, or other keyboard shortcuts. The command palette is intentionally instant (`packages/ui/components/shadcn/command.tsx`).
- Form validation errors. Use color, icon, and text for visual feedback; errors must still be named, associated, and exposed programmatically.
- Live data, timers, ticker counters — `tabular-nums`, no animation.
- Sortable or filtered list reordering at high frequency — no per-row springs or per-row `layout` (`packages/missionary/components/tasks/task-row.tsx`).
- Disabled controls — no hover or press feedback (`Button` applies `disabled:pointer-events-none disabled:opacity-50`).

### Hover on touch

- Any `hover:scale-*`, `hover:-translate-*`, or `hover:shadow-*` lift must be wrapped in `@media (hover: hover) and (pointer: fine)`; `scripts/check-motion-patterns.mjs` flags ungated `hover:scale-*`.
- Prefer `.hover-lift` or `.hover-scale-subtle` (both gated). For `group-hover:` patterns, use the arbitrary variant `[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[var(--scale-hover-subtle)]`.

### Transitions and press feedback

- Never use `transition-all`; list properties (`transition-colors`, `transition-[transform,box-shadow]`).
- `Button` (`packages/ui/components/shadcn/button-variants.ts`) includes `.press-feedback` in its base and `hover-scale-subtle` on the `maia` variants. Native `<button>` elements that do not use `Button` add `.press-feedback` directly.
- Never add `active:scale-*` inline; it duplicates the contract.
- Do not animate layout properties (height, width, margins, padding, offsets) in `motion/react` props; the motion guard flags them.

### Popover, tooltip, and dropdown origin

- Base UI popup surfaces use `transform-origin: var(--transform-origin)` (`origin-(--transform-origin)` in Tailwind). Shared primitives already do this.
- Modals (`Dialog`, full-screen overlays) keep `transform-origin: center`.

### Route transitions

- `RouteMainViewTransitionBoundary` (`@asym/ui/components/view-transitions`) owns route transitions. It wraps the content region of each app shell: `apps/admin/app/mc-shell.tsx`, `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`, and `apps/missionary/components/app-shell.tsx`.
- It is a no-op unless `NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED=true`, the browser supports view transitions, and reduced motion is off.
- Its `<ViewTransition>` is keyed by pathname, because a persistent layout never remounts on its own. When enabled, the route-content subtree remounts on every navigation (`template.tsx` semantics: client state below the shell resets).
- Page bodies inside the boundary get no unconditional entrance: gate CSS `animate-in` classes and `motion` `initial` props with `useWithinViewTransitionRouteLayer()` from `@asym/lib/view-transitions`. `packages/ui/components/primitives/page-shell.tsx` is the template (`!withinRouteVt && "motion-safe:animate-in ..."`).
- For an `AnimatePresence` list inside the boundary, gate only the first mount with `<AnimatePresence initial={!withinRouteVt}>`; a per-item `initial` ternary would also remove the add/remove animation.
- View-transition CSS in `globals.css` must use the class selector form `::view-transition-old(.asym-vt-route-exit)` (leading dot). React applies `enter`/`exit`/`share` values as `view-transition-class`; an undotted ident targets a view-transition name and matches nothing (guarded by `tests/unit/motion-contract.test.ts`).
- Do not add `motion.div layout` on the swapping region.

### CSS transitions, tweens, and springs

- **CSS transitions** for state changes (open/close, hover, press, color).
- **`motion/react` tweens** for orchestrated entrances and exits (page mounts, hero strips, lists).
- **Springs** only for gestures and decorative interactions — not for stat cards, list rows, or buttons.

### Tooltip timing

- The shared `TooltipProvider` (`packages/ui/components/shadcn/tooltip.tsx`) defaults to `delay={300}` and keeps Base UI's default `timeout` (400ms), the window in which moving between grouped triggers skips the open delay.
- The admin, donor, and missionary root layouts wrap the app in `<TooltipProvider delay={0}>`, and the rich-text toolbar sets its own `delay={0}`. Change these deliberately; do not infer instant behavior from `timeout`.

### Reduced motion

- The repo-wide `prefers-reduced-motion: reduce` baseline lives only in `packages/ui/styles/globals.css`, which also zeroes view transitions. Apps must not redeclare it.
- `MotionProvider` sets `MotionConfig reducedMotion="user"`, which disables transform and layout animations for every `motion` component.
- New or refactored `motion/react` code that needs more than that uses `useReducedMotion()` and returns `transition: { duration: 0 }`, `initial: false`, or skips motion. Examples: `packages/ui/components/primitives/motion-preset.tsx`, `packages/ui/components/primitives/ripple-button.tsx`, `packages/missionary/components/tasks/task-row.tsx`, `packages/missionary/components/tasks/task-stats.tsx`.

## Repo examples

- **Entrance gated by the route layer**: `packages/ui/components/primitives/page-shell.tsx` (tokens, `motion-safe`, view-transition awareness).
- **Button**: `packages/ui/components/shadcn/button-variants.ts` (`press-feedback` on the base, `hover-scale-subtle` for `maia` variants, no `transition-all`).
- **List row**: `packages/missionary/components/tasks/task-row.tsx` (one stagger entrance, no per-row `layout`, no per-element springs, `hover-lift`).

## Checklist

- [ ] Shared tokens, utilities, or presets used instead of raw literals.
- [ ] Mostly `transform` and `opacity`; no layout-property animation.
- [ ] No `transition-all`, inline `active:scale-*`, or ungated hover lift.
- [ ] `motion/react` APIs imported from `@asym/lib/motion`.
- [ ] Entrances inside the route boundary gated with `useWithinViewTransitionRouteLayer()`.
- [ ] Reduced-motion behavior defined; no app-level redeclaration of the baseline.
- [ ] `node scripts/check-motion-patterns.mjs <files>` passes for changed files.
