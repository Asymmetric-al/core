---
title: Core Component Principles
impact: HIGH
impactDescription: Foundation of component architecture decisions
tags: principles, composability, accessibility, customization, performance, transparency, dx
---

## Core Component Principles

These six principles guide all component design decisions. Apply them consistently when building, refactoring, or evaluating components.

### 1. Composability and Reusability

Favor composition over inheritance. Build components that combine and nest to create complex UIs.

**Incorrect (monolithic, hard to customize):**

```tsx
<Accordion data={data} />
```

**Correct (composable, each layer customizable):**

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@asym/ui/components/shadcn/accordion";

<Accordion defaultValue={[]}>
  {items.map((item) => (
    <AccordionItem key={item.id} value={item.id}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.content}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>;
```

### 2. Accessible by Default

Components must be usable by all users. Accessibility is not optional—it's a baseline feature.

**Incorrect (generic div with click handler):**

```tsx
<div onClick={handleClick} className="button">
  Click me
</div>
```

**Correct (semantic button element):**

```tsx
<button onClick={handleClick}>Click me</button>
```

Best practices:

- Use semantic HTML (`<button>`, `<ul>/<li>`, `<nav>`, etc.)
- Provide proper ARIA roles, states, and properties
- Support keyboard navigation for all interactive elements
- Ensure focus management in modals, dropdowns, and overlays

### 3. Customizability and Theming

Components should be easy to restyle or adapt to different design requirements.

**Correct (design tokens and className override):**

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

<Button type="button" variant="outline" className="self-start">
  Project details
</Button>;
```

Best practices:

- Use CSS variables (design tokens) for colors, spacing, typography
- Always allow `className` prop for style overrides
- Provide sensible default styling
- Avoid hard-coded colors, fonts, or spacing values

### 4. Lightweight and Performant

Components should be lean in terms of assets and dependencies.

**Incorrect (heavy dependency for simple task):**

```tsx
import { entireDateLibrary } from "heavy-date-lib";
```

**Correct (native APIs or lightweight alternatives):**

```tsx
const formatDate = (date: Date) => date.toLocaleDateString();
```

Best practices:

- Keep bundle size minimal
- Use tree-shaking friendly imports
- Lazy load heavy features when possible
- Optimize for initial render performance

### 5. Transparency and Code Ownership

Components should not be black boxes. Developers should be able to inspect and modify them.

**Correct (clear, readable implementation):**

```tsx
// The shared implementation is first-party, inspectable source:
// packages/ui/components/shadcn/button-component.tsx
import { Button } from "@asym/ui/components/shadcn/button";

<Button type="button" onClick={handleClick}>
  Project details
</Button>;
```

**Incorrect (obfuscated or overly complex):**

```tsx
export const Button = compose(withHOC1, withHOC2, withHOC3)(BaseButton);
```

### 6. Well-documented and DX-Friendly

Components should come with clear documentation and examples.

**Correct (comprehensive JSDoc):**

```tsx
import type * as React from "react";
import { Button } from "@asym/ui/components/shadcn/button";

/**
 * Project action that preserves the shared Button contract.
 *
 * @example
 * <ProjectAction variant="default" onClick={handleClick}>Open project</ProjectAction>
 *
 * @remarks
 * - Native action, keyboard, disabled and ref behavior stay with Button.
 * - Use ButtonLink or buttonVariants on a link for navigation.
 */
export function ProjectAction(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} />;
}
```

A well-designed component applies all six principles together: **Composes** with other components, **works for everyone** with proper accessibility, **adapts** to different designs via theming, **performs** efficiently, **can be inspected** and modified, and **is easy to learn** through documentation.
