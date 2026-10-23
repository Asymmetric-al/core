---
title: Component Styling with Tailwind CSS
impact: HIGH
impactDescription: Predictable, maintainable styling patterns
tags: styling, tailwind, cn, clsx, tailwind-merge, cva, class-variance-authority
---

## Component Styling with Tailwind CSS

<!-- CORE-COMPONENTS-CN-START -->

**Core shared class helper:** consume the existing helper through the shared UI
boundary:

```tsx
import { cn } from "@asym/ui/lib/utils";
```

Do not create a competing local `cn` implementation or add `clsx`/`tailwind-merge`
for these recipes. The generic npm dependency examples below are retained
upstream material and are **non-operative in Core**. Current workspace manifests
and `packages/ui/lib/utils.ts` own the implementation and dependency choices.
<!-- CORE-COMPONENTS-CN-END -->

Use Tailwind CSS with Core’s shared `cn` helper for class merging and conditional classes, and existing variant APIs (CVA).

### The `cn` Utility Function

```tsx
import { cn } from "@asym/ui/lib/utils";
```

**Why:** Core’s shared `cn` helper resolves class conflicts consistently with the installed UI implementation.

### Class Merging

**Incorrect:**

```tsx
// Without class merging, conflicting classes both apply
className = "bg-primary bg-background"; // Both classes apply, causing conflicts
className = "px-4 py-2 px-8"; // Both px-4 and px-8 apply
```

**Correct:**

```tsx
import { cn } from "@asym/ui/lib/utils";

cn("bg-primary", "bg-background"); // "bg-background"
cn("px-4 py-2", "px-8"); // "py-2 px-8"
cn("text-sm", "text-lg"); // "text-lg"
```

### Component Pattern: Order Matters

Core consumers use existing variants and placement APIs. The native/CVA examples
below illustrate a justified new passive authoring owner after shared-component
discovery; they do not permit recreating Button or overriding shared appearance.

Apply classes in this order:

1. **Base styles** (always applied)
2. **Variant styles** (based on props)
3. **Conditional styles** (based on state)
4. **User overrides** (className prop)

**Incorrect:**

```tsx
// Wrong order: user className comes before variants, preventing overrides
className={cn(className, variant === 'muted' && 'bg-muted')}
```

**Correct:**

```tsx
const Component = ({
  className,
  variant,
  isActive,
  ...props
}: ComponentProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm", // 1. Base
        variant === "muted" && "bg-muted text-muted-foreground", // 2. Variants
        isActive && "ring-2 ring-ring", // 3. Conditionals
        className, // 4. User overrides
      )}
      {...props}
    />
  );
};
```

### Conditional Classes with Core’s `cn`

```tsx
cn("base", isActive && "active");
cn("base", { active: isActive, disabled: isDisabled });
cn(["base", isLarge ? "text-lg" : "text-sm"]);
```

### Class Variance Authority (CVA)

For components with multiple variants:

```tsx
import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@asym/ui/lib/utils";

// Passive authoring illustration, not a replacement for shared Card or Button.
const summaryVariants = cva("rounded-lg border bg-card text-card-foreground", {
  variants: {
    density: { default: "p-4", compact: "p-2" },
    emphasis: { default: "", muted: "bg-muted text-muted-foreground" },
  },
  defaultVariants: { density: "default", emphasis: "default" },
});

type SummarySectionProps = React.ComponentPropsWithRef<"section"> &
  VariantProps<typeof summaryVariants>;

export function SummarySection({
  className,
  density,
  emphasis,
  ...props
}: SummarySectionProps) {
  return (
    <section
      className={cn(summaryVariants({ density, emphasis }), className)}
      {...props}
    />
  );
}
```

**Key points:**

- Define CVA variants **outside** the component
- Use `VariantProps<typeof variants>` for TypeScript types
- Always merge with `className` prop using `cn`

### Best Practices

**1. Extract Repeated Patterns:**

```tsx
// In an authorized host owner; shared controls already supply their focus style.
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';
export const disabled = 'disabled:pointer-events-none disabled:opacity-50';

className={cn(focusRing, disabled, className)}
```

**2. Use CSS Variables for Dynamic Values:**

This generic CSS-variable example illustrates mechanics only. In Core, use an
existing named runtime adapter/contract for dynamic values; it is not an inline-
style, arbitrary-color or shared-control restyling allowance.

**Incorrect:**

```tsx
// Dynamic class generation (not detected by Tailwind)
<div className={`bg-[${dynamicColor}]`} />
```

**Correct:**

```tsx
// CSS variables
<div
  className="bg-[var(--color)]"
  style={{ "--color": dynamicColor } as React.CSSProperties}
/>
```

**3. Document Variants:**

```tsx
type ButtonProps = {
  /** The visual style @default "default" */
  variant?: "default" | "destructive" | "outline" | "ghost";
  /** The size @default "default" */
  size?: "sm" | "default" | "lg" | "icon";
};
```

### Common Patterns

**State-Based Styling:**

```tsx
// Decorative passive state only; existing primitives own visibility/focus.
<span
  aria-hidden="true"
  className={cn(
    "transition-opacity duration-(--duration-standard) motion-reduce:transition-none",
    isHighlighted ? "opacity-100" : "opacity-50",
  )}
/>
```

**CVA with Additional Conditionals:**

```tsx
<div
  className={cn(
    baseVariants({ variant, size }),
    isActive && "ring-2 ring-ring",
    isDisabled && "opacity-50 cursor-not-allowed",
    className,
  )}
/>
```
