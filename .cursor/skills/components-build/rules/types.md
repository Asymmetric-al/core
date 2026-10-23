---
title: Component Types
impact: HIGH
impactDescription: Type-safe, flexible component interfaces
tags: types, typescript, props, html-attributes, export, single-element
---

## Component Types

Proper typing is essential for creating flexible, customizable, and type-safe component interfaces.

### Single Element Wrapping

Prefer small composable parts with clear host contracts. Preserve existing
non-DOM roots and compound implementations; this is not an instruction to add a
wrapper element or rewrite a shared primitive:

**Incorrect (hard to customize):**

```tsx
const Card = ({ title, description, footer, ...props }) => (
  <div {...props}>
    <div className="card-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <div className="card-footer">{footer}</div>
  </div>
);
```

**Correct (composable, each layer customizable):**

```tsx
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardFooter>Footer</CardFooter>
</Card>;
```

### Extending HTML Attributes

New passive DOM wrappers inherit their host attributes and ref. Wrappers around
an existing component derive that component's actual props instead of replacing
its state, render or event contract with a generic HTML type:

```tsx
import type * as React from "react";

// A justified new passive wrapper, after checking existing shared parts.
export type SummarySectionProps = React.ComponentPropsWithRef<"section">;
export const SummarySection = (props: SummarySectionProps) => (
  <section {...props} />
);
```

**Common HTML Attribute Types:**

```tsx
type DivProps = React.ComponentProps<"div">;
type ButtonProps = React.ComponentProps<"button">;
type InputProps = React.ComponentProps<"input">;
type FormProps = React.ComponentProps<"form">;
type LinkProps = React.ComponentProps<"a">;
```

### Exporting Types

Expose an owned component's prop contract. For existing shared components without
a named props export, use `React.ComponentProps<typeof Part>`:

```tsx
import type * as React from "react";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";

type CardProps = React.ComponentProps<typeof Card>;
type ButtonVariant = React.ComponentProps<typeof Button>["variant"];
export type ProjectCardProps = CardProps & { projectId: string };

// Consume feature metadata before forwarding the existing DOM props.
const ProjectCard = ({ projectId, className, ...props }: ProjectCardProps) => (
  <Card
    data-project-id={projectId}
    className={cn("self-start", className)}
    {...props}
  />
);
```

**Naming convention:** Export types as `<ComponentName>Props`.

### Best Practices

**1. Preserve Merged Props and Existing Behavior:**

```tsx
import { cn } from "@asym/ui/lib/utils";

// Destructure props that need merging; forward the remainder unchanged.
const { className, ...rest } = props;
<div className={cn("flex gap-2", className)} {...rest} />;

// A later className spread must not overwrite the merged value.
// Preserve each primitive's existing state, event and ref composition contract.
```

**2. Avoid Prop Name Conflicts:**

```tsx
// ❌ Conflicts with HTML title attribute
type CardProps = React.ComponentProps<"div"> & { title: string };

// ✅ Use a different name
type CardProps = React.ComponentProps<"div"> & { heading: string };
```

**3. Document Custom Props:**

```tsx
import type * as React from "react";
import { Dialog } from "@asym/ui/components/shadcn/dialog";

// Preserve open/defaultOpen/onOpenChange and actual callback details.
export type ProjectDialogProps = React.ComponentProps<typeof Dialog>;

// modal controls interaction/focus behavior (including 'trap-focus').
// It is not a portal switch; shared DialogContent owns its portal.
```

### Polymorphic Types

For justified new passive wrappers only, the generic `as` typing is background.
Existing Core interactive parts retain their public `render`, host props and
ref contract; it does not add `as` to Button:

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithRef<E>;

function Component<E extends React.ElementType = "div">({
  as,
  ...props
}: PolymorphicProps<E>) {
  const Element = as || "div";
  return <Element {...props} />;
}
```

### Quick Reference

| Pattern         | Usage                           | Example                                                 |
| --------------- | ------------------------------- | ------------------------------------------------------- |
| Basic extension | Extend single HTML element      | `React.ComponentProps<'div'>`                           |
| Custom props    | Add component-specific props    | `React.ComponentProps<'button'> & { variant?: string }` |
| Polymorphic     | Render as different elements    | `PolymorphicProps<T>`                                   |
| Type extraction | Get specific prop type          | `React.ComponentProps<typeof Button>["variant"]`        |
| Type extension  | Extend existing component props | `CardProps & { isLoading?: boolean }`                   |
