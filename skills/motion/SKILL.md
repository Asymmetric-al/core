# Motion (Framer Motion) — Skill

**Name:** `motion`
**Purpose:** Implement smooth, accessible animations with `motion/react` in React.
Use this skill whenever adding animations, gestures, or layout transitions.

**Applies when:** Using `motion/react` (`motion`, `AnimatePresence`, `useScroll`, etc.).
**Do not use when:** No animations are needed or the component is strictly server-rendered.

## Rules

- **Client-only boundary:** Motion requires `'use client'`; keep client islands small.
- **Start simple:** Begin with opacity/translate before adding spring physics.
- **Use the right tool:** `AnimatePresence` for enter/exit, `layout` for layout, `whileHover`/`whileTap` for gestures.
- **Respect reduced motion:** Use `useReducedMotion()`.
- **Bundle discipline:** Use `LazyMotion` for larger motion surfaces.

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
- [ ] Layout transitions use `layout`

### Review checklist

- [ ] Animations don’t re-run on every render
- [ ] Motion code doesn’t expand the client tree unnecessarily

## Minimal examples

### Enter/exit

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

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
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

### Layout animation

```tsx
"use client";

import { motion } from "motion/react";

export function Expander({ open }: { open: boolean }) {
  return (
    <motion.div layout className="overflow-hidden rounded-md border p-3">
      <div className="font-medium">Title</div>
      {open ? <div className="mt-2 text-sm">More content...</div> : null}
    </motion.div>
  );
}
```

### Reduced motion

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function FadeIn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

## Common mistakes / pitfalls

- Unmounting without `AnimatePresence` (exit animations never run)
- Animating layout without `layout`
- Putting Motion in a huge client tree
- Animating large lists without virtualization
