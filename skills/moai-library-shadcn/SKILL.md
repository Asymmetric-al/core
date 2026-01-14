---
name: moai-library-shadcn
description: Use this skill whenever working with **shadcn/ui**: component selection and composition, Tailwind tokens/theme customization, accessibility and Radix primitives, building/maintaining a coherent design system citeturn4view3.
---

# shadcn/ui Design System — Skill

**Name:** `moai-library-shadcn`

Use this skill whenever working with **shadcn/ui**:
- component selection and composition
- Tailwind tokens/theme customization
- accessibility and Radix primitives
- building/maintaining a coherent design system citeturn4view3

---

## Goal

Build an **owned, consistent, accessible** component system using shadcn/ui.

Priorities:
1. Consistency (tokens + patterns)
2. Accessibility (Radix defaults, correct semantics)
3. Maintainable component ownership (copied-in code)
4. Clear composition patterns (not prop explosions)

---

## Core principles

### 1) Remember what shadcn/ui is
- Not a packaged component library
- You **copy components into your repo** and own them (so treat them like first-party code) citeturn4view3

### 2) Tokens over one-off styles
- Centralize colors, radii, spacing, typography via Tailwind config/CSS variables
- Components consume tokens; pages should not redefine them

### 3) Prefer Radix primitives for behavior
- Use Radix for focus management, keyboard handling, aria defaults
- Avoid re-implementing popovers/menus/dialog behavior

### 4) Component APIs should be composable
- Provide slots (`children`) and sensible defaults
- Expose escape hatches (`className`, `asChild`) where appropriate
- Avoid dozens of boolean props

### 5) Accessibility is a feature
- Labels, descriptions, error text
- Focus rings visible and consistent
- Reduced motion support where animations exist

---

## Common mistakes to prevent

- Forking components wildly without updating tokens
- Inconsistent spacing/radius across components
- Using non-semantic elements for controls
- Duplicating similar components instead of extracting a base

---

## Review checklist

- [ ] Tokens are centralized (colors/radius/typography)
- [ ] Components follow the same spacing/radius patterns
- [ ] Radix-based components keep keyboard support intact
- [ ] `className` is merged consistently
- [ ] `asChild` used correctly (no invalid DOM nesting)
- [ ] Forms include labels + error messaging

---

## Minimal examples

### Token-first button usage
```tsx
import { Button } from "@/components/ui/button";

export function Actions() {
  return (
    <div className="flex gap-2">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
```

### Composable card pattern
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Panel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>…</CardContent>
    </Card>
  );
}
```

---

## How to apply this skill

1. Identify the design token(s) involved (color/spacing/radius)
2. Choose the closest existing shadcn/ui component
3. Prefer composition + Radix primitives over custom behavior
4. Keep API surface small and consistent
5. Add an example usage and verify keyboard/a11y
