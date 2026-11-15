---
name: motion
description: "Implement smooth, accessible animations with motion/react (Framer Motion) in React. Use when adding animations, gestures, or layout transitions with motion, AnimatePresence, useScroll, and related APIs. Requires a 'use client' boundary; not for strictly server-rendered components or when no animation is needed."
---

# Motion (`motion/react`) in Core

API usage for `motion/react`. Core's motion contract (tokens, presets, route view transitions, reduced-motion baseline) lives in `docs/ai/skills/anim/SKILL.md`; read it first.

## Rules

- **Import path:** ESLint bans direct `motion/react` and `framer-motion` imports. Import from `@asym/lib/motion`, whose `motion` export is the lazy `m` component; the root `MotionProvider` (`@asym/lib/motion-provider`) supplies `LazyMotion` and `MotionConfig reducedMotion="user"` in every app.
- **Client-only boundary:** Motion requires `'use client'`; keep client islands small.
- **Start simple:** Begin with opacity/translate before adding spring physics.
- **Use the right tool:** `AnimatePresence` for enter/exit and `whileHover`/`whileTap` for gestures.
- **No layout or drag features:** `MotionProvider` loads `domAnimation`, which excludes the `layout` and `drag` features (they are in `domMax`). A `layout` or `drag` prop does nothing under it. Animate `opacity`/`transform` instead; loading `domMax` is a deliberate bundle decision for the shared provider, not a per-component fix.
- **Respect reduced motion:** `MotionConfig` already disables transform and layout animation for reduced-motion users; use `useReducedMotion()` when the component needs a different fallback.
- **Shared timing:** Use `@asym/lib/motion-presets` constants and transitions instead of literal durations and curves.

## Workflow

1. Identify the UX purpose (feedback, transition, focus).
2. Add the smallest `'use client'` boundary.
3. Implement enter/exit or layout transitions correctly.
4. Respect reduced motion preferences.
5. Check performance and bundle size.

## Checklists

### Implementation checklist

- [ ] `'use client'` only where needed
- [ ] Reduced motion behavior defined
- [ ] `AnimatePresence` wraps conditional UI
- [ ] No reliance on `layout` or `drag` props (not loaded by `domAnimation`)

### Review checklist

- [ ] Animations don’t re-run on every render
- [ ] Motion code doesn’t expand the client tree unnecessarily

## Minimal examples

### Enter/exit

```tsx
"use client";

import { AnimatePresence, motion } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";

export function Toast({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={transitionStandard}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

### Reduced motion

```tsx
"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";

export function FadeIn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      {children}
    </motion.div>
  );
}
```

## Common mistakes / pitfalls

- Unmounting without `AnimatePresence` (exit animations never run)
- Expecting `layout` or `drag` to animate under the shared `domAnimation` provider
- Putting Motion in a huge client tree
- Importing from `motion/react` directly or adding another `LazyMotion` provider
- Animating large lists without virtualization
