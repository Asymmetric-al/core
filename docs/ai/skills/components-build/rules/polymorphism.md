---
title: Polymorphism Patterns
impact: MEDIUM
impactDescription: Flexible element rendering
tags: polymorphism, as-prop, element-type, typescript, semantic-html
---

## Polymorphism Patterns

Use the existing Core component's public host API before adding polymorphism.
Shared actions use `Button`; navigation uses `ButtonLink` or `buttonVariants` on
an anchor/Next Link. Base UI parts compose hosts through `render`, with their
actual supported native props and forwarded ref.

The generic `as` examples below are upstream background for justified **passive**
content/layout wrappers. They do not add `as` to shared components, replace an
interaction primitive, or permit a div to stand in for a native action. New
reusable behavior belongs to its reviewed `packages/ui` owner.

### Core Interactive Hosts

Choose the existing component for the native action or navigation semantics:

```tsx
import Link from "next/link";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";

<ButtonLink href="/home">Go Home</ButtonLink>;
<ButtonLink render={<Link href="/projects" />}>Projects</ButtonLink>;
<Button type="submit">Submit</Button>;
```

### Generic Passive Implementation (Background)

```tsx
function Component({ as: Element = "div", children, ...props }) {
  return <Element {...props}>{children}</Element>;
}
```

### Generic Passive Types (Background)

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  children?: React.ReactNode;
} & React.ComponentPropsWithRef<E>;

function Component<E extends React.ElementType = "div">({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Element = as || "div";
  return <Element {...props}>{children}</Element>;
}
```

### Common Use Cases

**Typography Components:**

```tsx
function Text({ as: Element = 'span', variant = 'body', className, ...props }) {
  return (
    <Element
      className={cn(
        'text-base',
        variant === 'heading' && 'text-2xl font-bold',
        className
      )}
      {...props}
    />
  );
}

<Text as="h1" variant="heading">Title</Text>
<Text as="p" variant="body">Paragraph</Text>
```

**Layout Components:**

```tsx
function Flex({ as: Element = 'div', className, ...props }) {
  return <Element className={cn('flex', className)} {...props} />;
}

<Flex as="header" className="justify-between"><Logo /><Navigation /></Flex>
<Flex as="main" className="flex-col"><Content /></Flex>
```

**Interactive Elements:**

```tsx
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";

<Button type="button" onClick={handleClick}>
  Open details
</Button>;
<ButtonLink href="/projects">Projects</ButtonLink>;
```

### Best Practices

**1. Default to Semantic Elements:**

**Incorrect (too generic):**

```tsx
function Component({ as: Element = "div", ...props }) {}
```

**Correct (semantic defaults):**

```tsx
function Article({ as: Element = "article", ...props }) {}
function Navigation({ as: Element = "nav", ...props }) {}
function Heading({ as: Element = "h2", ...props }) {}
```

**2. Document Valid Elements:**

```tsx
interface BoxProps {
  /**
   * The HTML element to render as
   * @default 'div'
   */
  as?: "div" | "section" | "article" | "aside" | "main" | "header" | "footer";
}
```

**3. Forward the Existing Host Contract:**

```tsx
import type * as React from "react";
import { Button } from "@asym/ui/components/shadcn/button";

function ProjectAction(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} />;
}
```

### Common Pitfalls

**Invalid HTML Nesting:**

```tsx
// Incorrect: Invalid - button inside button
<Button><Button>Nested</Button></Button>

// Incorrect: Invalid - div inside p
<Text as="p"><Box as="div">Invalid</Box></Text>

// Correct: Valid nesting
<Text as="div"><Box as="div">Valid</Box></Text>
```

**Missing Accessibility:**

```tsx
// ❌ Missing accessibility
<Box as="nav"><MenuItems /></Box>

// ✅ Proper accessibility
<Box as="nav" aria-label="Main navigation"><MenuItems /></Box>
```

**Performance:**

```tsx
// ❌ Creates new component on every render
function Parent() {
  const CustomDiv = (props) => <div {...props} />;
  return <Component as={CustomDiv} />;
}

// ✅ Stable component reference
const CustomDiv = (props) => <div {...props} />;
function Parent() {
  return <Component as={CustomDiv} />;
}
```

### Key Benefits

1. **Semantic HTML Flexibility** - Use the most appropriate element
2. **Component Reusability** - One component serves multiple purposes
3. **Accessibility** - Choose elements for best accessibility
4. **Style System Integration** - Maintain styling while changing elements
