---
name: motion
description: Use this skill whenever implementing **React animations** with Motion (`motion/react`, formerly `framer-motion`): gestures (hover/tap/drag), layout transitions, exit animations (`AnimatePresence`), scroll/viewport effects citeturn4view2.
---

# Motion (Framer Motion) — Skill

**Name:** `motion`

Use this skill whenever implementing **React animations** with Motion (`motion/react`, formerly `framer-motion`):
- gestures (hover/tap/drag)
- layout transitions
- exit animations (`AnimatePresence`)
- scroll/viewport effects citeturn4view2

---

## Goal

Create **smooth, intentional** animations that don’t break UX or performance.

Priorities:
1. Correct component boundaries (`'use client'` in Next.js)
2. Accessible motion (reduced-motion)
3. Predictable enter/exit and layout transitions
4. Keep bundles small

---

## Core principles

### 1) Client-only boundary (Next.js)
- Motion components require `'use client'`
- Keep client islands small (wrap only animated parts)

### 2) Prefer simple transitions first
- Start with opacity + translate
- Add spring physics only when it improves feel

### 3) Use the right tool
- Enter/exit → `AnimatePresence`
- Layout changes → `layout` / `LayoutGroup`
- Gestures → `whileHover`, `whileTap`, `drag`
- Scroll/viewport → `whileInView`, `useScroll`, `useTransform`

### 4) Respect reduced motion
- Use `useReducedMotion()` and reduce/disable non-essential motion

### 5) Bundle discipline
- Use `LazyMotion` when motion is a large dependency surface (especially apps with many routes) citeturn4view2

---

## Common mistakes to prevent

- Exit animations not running because component is unmounted without `AnimatePresence`
- Animating layout without `layout`
- Putting Motion in a huge client tree in Next.js
- Animating large lists without virtualization / without limiting re-renders

---

## Review checklist

- [ ] `'use client'` only where needed
- [ ] Reduced motion behavior is defined
- [ ] `AnimatePresence` wraps conditional UI
- [ ] Layout transitions use `layout`
- [ ] Animations don’t re-run on every render
- [ ] Bundle impact is considered (`LazyMotion`)

---

## Minimal examples

### Enter/exit (modal or toast)
```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

export function Toast({ open, children }: { open: boolean; children: React.ReactNode }) {
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
      {open ? <div className="mt-2 text-sm">More content…</div> : null}
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

---

## How to apply this skill

1. Identify the UX purpose (feedback, transition, focus)
2. Add the smallest `'use client'` boundary
3. Implement enter/exit or layout correctly
4. Ensure reduced-motion is respected
5. Check list/route performance and bundle size
