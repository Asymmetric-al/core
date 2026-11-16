---
name: react-component-dev
description: "Build reusable, accessible React components with predictable APIs and ref forwarding. Use when creating or refactoring components or defining component APIs, favoring composition over configuration and slots/children over many boolean props. Not needed for style-only or content-only edits that do not change a component API."
---

# React component development in Core

Core runs React 19 (`react` in `package.json`). Shared components live in `packages/ui`; read `packages/ui/AGENTS.md` before adding or changing one, and use the `moai-library-shadcn` and `base-ui` skills for shadcn and primitive work.

## Rules

- **Composition over configuration:** Prefer `children` and named parts (`Card`, `CardHeader`, `CardTitle`) over many boolean props.
- **Refs are props:** In React 19, a function component receives `ref` as a prop. Type props with `React.ComponentProps<"element">` and spread them; do not add `forwardRef` to new components.
- **Base UI composition:** Use the `render` prop for polymorphism; never Radix `asChild`.
- **Styling:** Merge classes with `cn` from `@asym/ui/lib/utils`, express variants with CVA, and use semantic tokens (`bg-card`, `text-muted-foreground`) rather than raw palette colors. The design-system lint enforces this.
- **Accessibility:** Use semantic HTML first; add ARIA only when needed (`accessibility-review`).
- **Predictable props:** Follow controlled/uncontrolled conventions; extract complex behavior into hooks.
- **Ownership:** Reusable components belong in `packages/ui`; apps compose them and do not fork them.

## Checklist

- [ ] Single responsibility; small, composable API
- [ ] Props typed from `React.ComponentProps`, spread onto the DOM element; no new `forwardRef`
- [ ] `data-slot`, `cn`, CVA, and semantic tokens follow neighboring components
- [ ] Semantic HTML and keyboard interaction work
- [ ] Shared components live in `packages/ui`

## Example

Shared components follow this shape (see `packages/ui/components/shadcn/card.tsx`):

```tsx
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}
```
