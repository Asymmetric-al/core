# Components.build Specification

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

**Version 1.0.0**  
components.build  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring UI component libraries. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive guidelines for building modern, composable, and accessible UI components. This specification provides patterns and best practices for creating React components that are composable, accessible, customizable, and well-documented.

---

## Table of Contents

1. [Overview](#1-overview) — **MEDIUM**
   - 1.1 [Components.build Overview](#11-componentsbuild-overview)
2. [Principles](#2-principles) — **HIGH**
   - 2.1 [Core Component Principles](#21-core-component-principles)
3. [Definitions](#3-definitions) — **MEDIUM**
   - 3.1 [Component Artifact Definitions](#31-component-artifact-definitions)
4. [Composition](#4-composition) — **HIGH**
   - 4.1 [Component Composition](#41-component-composition)
5. [Accessibility](#5-accessibility) — **CRITICAL**
   - 5.1 [Accessibility Guidelines](#51-accessibility-guidelines)
6. [State](#6-state) — **HIGH**
   - 6.1 [State Management Patterns](#61-state-management-patterns)
7. [Types](#7-types) — **HIGH**
   - 7.1 [Component Types](#71-component-types)
8. [Polymorphism](#8-polymorphism) — **MEDIUM**
   - 8.1 [Polymorphism Patterns](#81-polymorphism-patterns)
9. [Render Composition](#9-render-composition) — **MEDIUM**
   - 9.1 [Base UI render Composition](#91-base-ui-render-composition)
10. [Data Attributes](#10-data-attributes) — **LOW**

- 10.1 [Data Attributes for Styling](#101-data-attributes-for-styling)

11. [Styling](#11-styling) — **HIGH**

- 11.1 [Component Styling with Tailwind CSS](#111-component-styling-with-tailwind-css)

12. [Design Tokens](#12-design-tokens) — **MEDIUM**

- 12.1 [Design Tokens](#121-design-tokens)

13. [Documentation](#13-documentation) — **MEDIUM**

- 13.1 [Component Documentation](#131-component-documentation)

14. [Registry](#14-registry) — **LOW**

- 14.1 [Component Registries](#141-component-registries)

15. [NPM](#15-npm) — **LOW**

- 15.1 [Publishing to NPM](#151-publishing-to-npm)

16. [Marketplaces](#16-marketplaces) — **LOW**

- 16.1 [Component Marketplaces](#161-component-marketplaces)

---

## 1. Overview

**Impact: MEDIUM**

Specification scope, goals, and philosophy. Introduction to the
components.build standard for building modern UI components.

### 1.1 Components.build Overview

**Impact: MEDIUM (Foundation for understanding the specification)**

The components.build specification is an open-source standard for building modern, composable, and accessible UI components. It provides high-level guidelines, best practices, and common terminology for designing UI components that integrate smoothly into any codebase.

**What This Specification Is:**

This spec is **not**:

- A tutorial or course on React

- A promotion for any specific component library or registry

- A replacement for framework documentation

This spec **is**:

- A set of high-level guidelines and best practices

- A common terminology for designing UI components

- A standard for ensuring components meet modern expectations

- A framework for creating components that integrate smoothly across projects

**Who This Is For:**

This specification is written for:

- **Open-source maintainers** building and distributing component libraries

- **Senior front-end engineers** designing component APIs and design systems

- **Developers** familiar with JavaScript/TypeScript and React

**Framework Scope:**

While examples use React (with JSX/TSX) for concreteness, the fundamental concepts apply to other frameworks (Vue, Svelte, Angular). The philosophy is **framework-agnostic**.

**Core Goals:**

The specification aims to help developers create components that are:

1. **Composable** - Components combine and nest to create complex UIs

2. **Accessible** - Usable by everyone, including users with disabilities

3. **Easy to adopt** - Integrate smoothly into any codebase

4. **Consistent** - Follow modern expectations and patterns

5. **Well-documented** - Clear guidelines and terminology

**Key Philosophy:**

- **Composition over configuration** - Build flexible, composable APIs

- **Accessibility by default** - Not an afterthought, but a requirement

- **Developer experience** - Components should be easy to understand, customize, and integrate

- **Transparency** - Source code should be inspectable and modifiable

- **Standards alignment** - Follow web standards and modern best practices

**Example:**

The following examples illustrate the difference between components that don't follow the specification and those that do:

**Incorrect:**

```tsx
// Hard-coded styles, no accessibility, not composable
function Button() {
  return (
    <button
      style={{ backgroundColor: "#007bff", color: "white", padding: "10px" }}
    >
      Click me
    </button>
  );
}
```

**Correct:**

```tsx
// Compose the existing shared component and class helper.
import type * as React from "react";
import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";

export function ProjectActions({
  className,
  ...props
}: Omit<React.ComponentPropsWithRef<"div">, "children">) {
  return (
    <div className={cn("flex gap-2", className)} {...props}>
      <Button type="button">Open project</Button>
      <Button type="button" variant="outline">
        Project settings
      </Button>
    </div>
  );
}
```

**Specification Authors:**

Co-authored by:

- **Hayden Bleasel** ([@haydenbleasel](https://x.com/haydenbleasel))

- **shadcn** ([@shadcn](https://x.com/shadcn))

Adapted as an AI skill by:

- **Jordan Gilliam** ([@nolansym](https://x.com/nolansym))

Reference: [https://components.build](https://components.build)

---

## 2. Principles

**Impact: HIGH**

Core design principles for component architecture including
composability, accessibility, customization, performance, transparency, and DX.

### 2.1 Core Component Principles

**Impact: HIGH (Foundation of component architecture decisions)**

These six principles guide all component design decisions. Apply them consistently when building, refactoring, or evaluating components.

Favor composition over inheritance. Build components that combine and nest to create complex UIs.

**Incorrect: monolithic, hard to customize**

```tsx
<Accordion data={data} />
```

**Correct: composable, each layer customizable**

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

Components must be usable by all users. Accessibility is not optional—it's a baseline feature.

**Incorrect: generic div with click handler**

```tsx
<div onClick={handleClick} className="button">
  Click me
</div>
```

**Correct: semantic button element**

```tsx
<button onClick={handleClick}>Click me</button>
```

Best practices:

- Use semantic HTML (`<button>`, `<ul>/<li>`, `<nav>`, etc.)

- Provide proper ARIA roles, states, and properties

- Support keyboard navigation for all interactive elements

- Ensure focus management in modals, dropdowns, and overlays

Components should be easy to restyle or adapt to different design requirements.

**Correct: design tokens and className override**

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

Components should be lean in terms of assets and dependencies.

**Incorrect: heavy dependency for simple task**

```tsx
import { entireDateLibrary } from "heavy-date-lib";
```

**Correct: native APIs or lightweight alternatives**

```tsx
const formatDate = (date: Date) => date.toLocaleDateString();
```

Best practices:

- Keep bundle size minimal

- Use tree-shaking friendly imports

- Lazy load heavy features when possible

- Optimize for initial render performance

Components should not be black boxes. Developers should be able to inspect and modify them.

**Correct: clear, readable implementation**

```tsx
// The shared implementation is first-party, inspectable source:
// packages/ui/components/shadcn/button-component.tsx
import { Button } from "@asym/ui/components/shadcn/button";

<Button type="button" onClick={handleClick}>
  Project details
</Button>;
```

**Incorrect: obfuscated or overly complex**

```tsx
export const Button = compose(withHOC1, withHOC2, withHOC3)(BaseButton);
```

Components should come with clear documentation and examples.

**Correct: comprehensive JSDoc**

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

---

## 3. Definitions

**Impact: MEDIUM**

Common terminology and component type definitions including
primitive, compound, headless, and styled components.

### 3.1 Component Artifact Definitions

**Impact: MEDIUM (Essential for correct component classification)**

Precise terminology for classifying and naming UI artifacts.

The **lowest-level building block** providing behavior and accessibility without styling. Completely headless.

**Core example:** Base UI Dialog root, behind the shared `Dialog` export. Other
primitive libraries in the upstream taxonomy are terminology examples, not
approved dependencies in Core.

A **styled, reusable UI unit** that adds visual design to primitives or composes multiple elements.

**Examples:** shadcn/ui components, Material UI, Ant Design

A **specific composition** solving a UI/UX problem. Documentation-focused, not a reusable component.

**Examples:** Form validation with inline errors, confirming destructive actions, typeahead search

An **opinionated, production-ready composition** solving a concrete interface use case.

**Examples:** Pricing table, auth screens, onboarding stepper, AI chat panel

A **complete, single-route view** composed of multiple blocks.

A **multi-page collection** or full-site scaffold bundling pages, routing, layouts, and providers.

**Examples:** SaaS starter, e-commerce template, dashboard starter

A **helper** for developer ergonomics or composition; not rendered UI.

**Examples:** React hooks, class utilities, keybinding helpers, focus scopes

1. **Behavior/a11y only, no styling?** → **Primitive**

2. **Styled, reusable UI element?** → **Component**

3. **Concrete product use case with opinionated composition?** → **Block**

4. **Multi-page scaffold with routing/providers?** → **Template**

5. **Documentation of recurring solution?** → **Pattern**

6. **Non-visual logic?** → **Utility**

**Incorrect: mislabeling a styled component as a primitive**

```tsx
import { DialogContent } from "@asym/ui/components/shadcn/dialog";

// Wrong classification: DialogContent is already a styled shared component,
// not a behavior-only primitive. Its owning source supplies Maia presentation.
type BehaviorOnlyPrimitive = typeof DialogContent;
```

**Correct: proper classification based on styling presence**

```tsx
import type * as React from "react";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";

// Block - feature composition of existing shared components.
// Caller-owned controlled or uncontrolled root props are forwarded unchanged.
function ProjectDialog(
  props: Omit<React.ComponentProps<typeof Dialog>, "children">,
) {
  return (
    <Dialog {...props}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        Project details
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Project details</DialogTitle>
        Review the details before continuing.
      </DialogContent>
    </Dialog>
  );
}
```

- **Props API** - Public configuration surface, typed and documented

- **Children/Slots** - Placeholders for caller-provided structure

- **Render Prop** - Function child delegating rendering

- **Controlled** - Value driven by props (parent is source of truth)

- **Uncontrolled** - Primitive-owned value initialized with its actual default
  prop (`defaultValue`, `defaultChecked` or `defaultOpen`); later default changes
  do not control the current value.

- **Provider/Context** - Supplies shared state to subtree

- **Portal** - Rendering outside DOM hierarchy for layering

- **Headless** - Behavior without styling

- **Styled** - Ships with default visual design

- **Variants** - Style/behavior permutations via props

- **Design Tokens** - Named values for theming

---

## 4. Composition

**Impact: HIGH**

Compose existing shared parts without duplicating state or behavior.

### 4.1 Component Composition

**Impact: HIGH (Compose existing shared parts without duplicating state or behavior)**

Compose the existing Core parts before building a new primitive. Shared Base UI components already own state coordination, keyboard navigation, ARIA and focus behavior; do not recreate them with a parallel Context or an inert `asChild` prop.

#### Compose the Shared Parts

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@asym/ui/components/shadcn/accordion";

<Accordion defaultValue={["details"]}>
  <AccordionItem value="details">
    <AccordionTrigger>Project details</AccordionTrigger>
    <AccordionContent>Compose the content for this feature.</AccordionContent>
  </AccordionItem>
</Accordion>;
```

Import the existing flat exports shown above. Do not invent an `Accordion.Root` namespace or replace `value`/`defaultValue`/`onValueChange` with a custom `open`/`setOpen` state API.

#### Compose a Trigger Host

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import { DialogTrigger } from "@asym/ui/components/shadcn/dialog";

<DialogTrigger render={<Button type="button" variant="outline" />}>
  Open details
</DialogTrigger>;
```

Use this trigger inside the existing Dialog root. The `render` host receives the primitive's merged props and ref. Custom hosts must forward both to the same DOM node; do not discard them, manually clone the child or nest interactive elements.

See [Base UI render composition](rules/as-child.md) for native button versus link semantics, and [state management](rules/state.md) for controlled and uncontrolled use.

#### Keep Ownership Clear

- **Root** owns the existing primitive's state and coordinates its parts.
- **Item** groups the primitive's related trigger and content.
- **Trigger** retains the primitive's interaction and accessible state.
- **Content** retains its visibility, focus and lifecycle behavior.
- **Title / Description** provide the accessible name and supporting context.

Feature-specific wrappers may arrange these parts and forward their existing public props/ref. Extend the shared component through `packages/ui` when new reusable behavior is needed; do not introduce an app-local primitive or state abstraction.

#### Verify the Result

Check the actual exported types and rendered host, then verify keyboard navigation, names, focus and disabled behavior at the composed feature boundary. Keep semantic tokens and exact `base-maia` presentation.

References: [Base UI composition](https://base-ui.com/react/handbook/composition), `packages/ui/components/shadcn/accordion.tsx`, and `packages/ui/components/shadcn/dialog.tsx`.

---

## 5. Accessibility

**Impact: CRITICAL**

Building accessible components with keyboard navigation, screen
reader support, ARIA attributes, and focus management.

### 5.1 Accessibility Guidelines

**Impact: CRITICAL (Essential for inclusive component design)**

Accessibility (a11y) is not optional—it's a fundamental requirement. Every component must be usable by everyone, including people with visual, motor, auditory, or cognitive disabilities.

Always start with the most appropriate HTML element:

**Incorrect: generic div**

```tsx
<div onClick={handleClick} className="button">
  Click me
</div>
```

**Correct: semantic element**

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

<Button type="button" onClick={handleClick}>
  Open project
</Button>;
```

**Live-region examples (avoid duplicate announcements):**

```tsx
// Polite announcement
<div role="status" aria-live="polite">{savedMessage && "Saved"}</div>

// Assertive announcement
<div role="alert" aria-live="assertive">{errorMessage}</div>
```

Every interactive element must be keyboard accessible. Reuse the existing
shared Dialog, DropdownMenu and Tabs parts for modal, menu and tab behavior;
a role and tabIndex alone do not implement keyboard navigation, focus
containment/restoration, dismissal or tab/panel relationships.

Use ARIA attributes when necessary. Shared DialogTitle/Description and Tabs
parts generate their relationships; do not create missing labelledby targets.

Support users with visual impairments using existing foreground/background and
ring tokens. Shared controls own their focus presentation; generic CSS examples
are background for authorized host authoring, not app-global overrides.

1. **Don't use ARIA if you can use semantic HTML**

2. **Don't change native semantics unless necessary**

3. **All interactive elements must be keyboard accessible**

4. **Don't hide focusable elements** - Never use `aria-hidden="true"` on focusable elements

5. **All interactive elements must have accessible names**

**Placeholder as labels:**

```tsx
// ❌ Placeholder disappears
<input placeholder="Email address" />

// ✅ Persistent label
<label>Email address <input type="email" /></label>
```

**Empty buttons:**

```tsx
// ❌ No accessible name
<button><TrashIcon /></button>

// ✅ Screen reader text
<button aria-label="Delete item"><TrashIcon aria-hidden="true" /></button>
```

**Disabled elements:**

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

// The form owns submission; Button owns native disabled behavior.
<>
  <Button type="submit" disabled={!isValid} aria-describedby="submit-help">
    Submit
  </Button>
  <span id="submit-help">{!isValid && "Fill required fields"}</span>
</>;
```

**Allow zooming:**

```html
<!-- Allow zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 6. State

**Impact: HIGH**

Controlled and uncontrolled state through the existing shared primitive APIs.

### 6.1 State Management Patterns

**Impact: HIGH (Reuse the shared primitive’s controlled and uncontrolled APIs)**

Use the existing shared primitive's state API before adding state machinery. Core has no shared controllable-state hook to import. Do not add a Radix helper dependency or implement a second abstraction for these recipes.

#### Uncontrolled State

Let the primitive manage state and supply only its initial default:

```tsx
import { Switch } from "@asym/ui/components/shadcn/switch";

<Switch aria-label="Email notifications" defaultChecked={false} />;
```

`defaultChecked` supplies the initial value; later changes to the prop do not control the current state. Use this mode when the parent does not need to own the value.

#### Controlled State

Keep the confirmed value in the parent and pass the primitive's matching change callback:

```tsx
import * as React from "react";
import { Switch } from "@asym/ui/components/shadcn/switch";

function NotificationPreference() {
  const [enabled, setEnabled] = React.useState(false);
  return (
    <Switch
      aria-label="Email notifications"
      checked={enabled}
      onCheckedChange={setEnabled}
    />
  );
}
```

Use controlled state for coordination, validation or persistence. Keep a component in the same mode for its lifetime; pass a defined controlled value from its first render.

#### Value-Based Primitives

Use the actual primitive's value type and public exports. The shared Accordion uses an array of expanded item values:

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@asym/ui/components/shadcn/accordion";

<Accordion defaultValue={["details"]}>
  <AccordionItem value="details">
    <AccordionTrigger>Details</AccordionTrigger>
    <AccordionContent>Project details</AccordionContent>
  </AccordionItem>
</Accordion>;
```

For controlled expansion, pass `value={expandedItems}` and `onValueChange={setExpandedItems}` with parent state typed to the shared Accordion's value contract. Do not replace that API with a boolean `open`/`setOpen` pair.

#### Preserve the Primitive Contract

| Existing primitive | Controlled prop | Initial default  | Change callback   |
| ------------------ | --------------- | ---------------- | ----------------- |
| Switch / Checkbox  | `checked`       | `defaultChecked` | `onCheckedChange` |
| Accordion / Tabs   | `value`         | `defaultValue`   | `onValueChange`   |
| Dialog / Popover   | `open`          | `defaultOpen`    | `onOpenChange`    |

- Inspect the existing component's exported props; value types and callback details vary by primitive.
- Forward the existing state props, callback arguments and ref when a wrapper is required.
- Preserve `false`, `0` and empty values; do not use truthiness to decide whether a prop is controlled.
- Do not combine controlled and default props to create competing state owners, or mirror a controlled prop into another local state variable.
- Let the shared primitive own keyboard, ARIA, disabled and focus behavior.

References: `packages/ui/components/shadcn/switch.tsx`, `packages/ui/components/shadcn/accordion.tsx`, and [Base UI composition](https://base-ui.com/react/handbook/composition).

---

## 7. Types

**Impact: HIGH**

TypeScript patterns for inheriting native host props/ref, deriving existing
shared-part props, and exporting clear contracts without changing host ownership.

### 7.1 Component Types

**Impact: HIGH (Type-safe, flexible component interfaces)**

Proper typing is essential for creating flexible, customizable, and type-safe component interfaces.

Prefer small composable parts with clear host contracts. Preserve existing
non-DOM roots and compound implementations; do not add a wrapper element or
rewrite a shared primitive to satisfy a literal single-element rule:

**Incorrect: hard to customize**

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

**Correct: composable, each layer customizable**

```tsx
import type * as React from "react";

// A justified new passive wrapper, after checking existing shared parts.
export type SummarySectionProps = React.ComponentPropsWithRef<"section">;
export const SummarySection = (props: SummarySectionProps) => (
  <section {...props} />
);
```

New passive DOM wrappers inherit their host attributes and ref. Wrappers around
an existing component derive that component's actual props instead of replacing
its state, render or event contract with a generic HTML type:

**Common HTML Attribute Types:**

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

Expose an owned component's prop contract. For existing shared components without
a named props export, use `React.ComponentProps<typeof Part>`:

**Naming convention:** Export types as `<ComponentName>Props`.

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

**3. Document Custom Props and Host Boundaries:**

Dialog `modal` controls interaction/focus behavior, not portal selection. Derive
its props from the shared root; generic div props omit that contract. The
following passive-wrapper illustration is not a Dialog type.

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

For justified new passive wrappers only, the generic `as` typing is background.
Existing Core interactive parts retain their public `render`, host props and
ref contract; it does not add `as` to Button:

| Pattern | Usage | Example |

|---------|-------|---------|

| Basic extension | Extend single HTML element | `React.ComponentProps<'div'>` |

| Custom props | Add component-specific props | `React.ComponentProps<'button'> & { variant?: string }` |

| Polymorphic | Render as different elements | `PolymorphicProps<T>` |

| Type extraction | Get specific prop type | `React.ComponentProps<typeof Button>["variant"]` |

| Type extension | Extend existing component props | `CardProps & { isLoading?: boolean }` |

---

## 8. Polymorphism

**Impact: MEDIUM**

Using existing shared host/render APIs for interaction; generic `as`
illustrations remain background for justified passive content/layout wrappers.

### 8.1 Polymorphism Patterns

**Impact: MEDIUM (Flexible element rendering)**

Use the existing Core component's public host API first. Shared actions use
`Button`; navigation uses `ButtonLink` or `buttonVariants` on an anchor/Next Link.
Base UI parts use `render` with their actual native props and forwarded ref.

The generic `as` illustrations below remain upstream background for justified
**passive** content/layout wrappers. They do not add `as` to shared components or
replace interaction behavior. New reusable behavior belongs to its reviewed
`packages/ui` owner.

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

**1. Default to Semantic Elements:**

**Incorrect: too generic**

```tsx
function Component({ as: Element = "div", ...props }) {}
```

**Correct: semantic defaults**

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

1. **Semantic HTML Flexibility** - Use the most appropriate element

2. **Component Reusability** - One component serves multiple purposes

3. **Accessibility** - Choose elements for best accessibility

4. **Style System Integration** - Maintain styling while changing elements

---

## 9. Render Composition

**Impact: MEDIUM**

Base UI render composition with preserved native semantics, props and ref.

### 9.1 Base UI render Composition

**Impact: MEDIUM (Compose one semantic host with preserved behavior)**

`rules/as-child.md` remains the compatibility index for older `asChild` references. In Core, compose the existing `@asym/ui` Base UI parts with `render`; do not add Radix Slot or an `asChild` API.

#### Compose the Existing Trigger

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";

<Dialog>
  <DialogTrigger render={<Button type="button" variant="outline" />}>
    Open details
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Details</DialogTitle>
    Review the details before continuing.
  </DialogContent>
</Dialog>;
```

`render` merges the trigger behavior onto the custom host. Do not put a second button inside a trigger. Keep the shared primitive responsible for keyboard behavior, disabled state, ARIA and focus restoration.

#### Forward Props and Ref

A custom render component must spread the received props and forward its ref to the same DOM node. React 19 components can receive `ref` as a prop:

```tsx
import * as React from "react";
import { DialogTrigger } from "@asym/ui/components/shadcn/dialog";

function ActionButton({
  ref,
  type = "button",
  ...props
}: React.ComponentPropsWithRef<"button">) {
  return <button ref={ref} type={type} {...props} />;
}

<DialogTrigger render={<ActionButton />}>Open details</DialogTrigger>;
```

Preserve the primitive's event handlers, attributes and ref when adding a wrapper. Prefer its existing `render` API to manual element cloning or custom prop-merging logic.

#### Preserve Native Semantics

Use a button host for an action. Only set `nativeButton={false}` when deliberately rendering a non-button host and the specific primitive supports that prop; inspect its current public props first. It is not a general composition flag or a fix for an incorrect host.

Navigation remains a link. Apply the shared `buttonVariants` classes to an anchor or Next.js Link:

```tsx
import Link from "next/link";
import { buttonVariants } from "@asym/ui/components/shadcn/button";

<a href="/settings" className={buttonVariants({ variant: "outline" })}>
  Settings
</a>;

<Link href="/projects" className={buttonVariants({ variant: "outline" })}>
  Projects
</Link>;
```

Do not render an anchor through `Button`: its button role would override native link semantics. Do not substitute a generic div for a native button merely to obtain the same appearance.

#### Check the Composed Host

- Confirm one interactive DOM host, its accessible name and its intended native role.
- Verify forwarded props/ref, keyboard activation, focus restoration and disabled behavior.
- Reuse `packages/ui/components/shadcn/button.ts` and the existing primitive export; do not create an app-local primitive fork.

References: [Base UI composition](https://base-ui.com/react/handbook/composition), [shadcn Base UI Button](https://ui.shadcn.com/docs/components/base/button).

---

## 10. Data Attributes

**Impact: LOW**

Reading existing Base UI state attributes and preserving stable data-slot
identities without duplicating state or overriding shared-control appearance.

### 10.1 Data Attributes for Styling

**Impact: LOW (Clean state-based styling patterns)**

Use the existing primitive's emitted state attributes and stable `data-slot`
identifiers. Core uses Base UI presence attributes, not a generic
`data-state="open"` contract.

**Never expose separate className props for different states.** Use the existing
primitive's emitted attributes and supported styling contract instead.

#### Read State from the Existing Part

Do not mirror the primitive's open value into another local state variable or
replace a Dialog with a bare div. The shared root coordinates state; its content
part renders the popup DOM and supplies the existing Maia appearance.

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";

<Dialog defaultOpen={false}>
  <DialogTrigger render={<Button type="button" variant="outline" />}>
    Project details
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Project details</DialogTitle>
    Review the details before continuing.
  </DialogContent>
</Dialog>;
```

`Dialog` does not render a DOM host. Read or style the existing state on the
appropriate rendered part; do not pass popup presentation to the root.

#### Current Core State Contracts

| Shared part                      | Attribute emitted by its primitive | Configure through                  |
| -------------------------------- | ---------------------------------- | ---------------------------------- |
| DialogContent / AccordionContent | `data-open` / `data-closed`        | The root's existing state API      |
| AccordionTrigger                 | `data-panel-open`                  | Accordion `value` / `defaultValue` |
| TabsTrigger                      | `data-active`                      | Tabs `value` / `defaultValue`      |
| Button / Switch                  | `data-disabled` when disabled      | `disabled`                         |
| Slider parts                     | `data-orientation`                 | `orientation`                      |
| TooltipContent                   | `data-side`                        | `side`                             |

Presence attributes are absent for false state; do not manually stamp
`data-disabled={false}` onto a shared primitive. A feature-defined
`data-loading` attribute is separate from the primitive's disabled or busy
behavior. Use the real `disabled` / `aria-busy` props where appropriate.

#### Tailwind Integration

Inside an existing primitive's reviewed authoring owner, selectors such as
`data-open:`, `data-closed:`, `data-panel-open:` and `data-active:` read its actual
attributes. Consumers use the component's existing variants and placement API;
state selectors are not permission to override shared appearance or motion.
The installed Dialog already owns its popup entrance and exit animation.

**Arrange existing shared controls:**

```tsx
<div className="flex gap-2">
  <Button type="button">Save project</Button>
  <Button type="button" variant="outline">
    Cancel
  </Button>
</div>
```

Preserve existing primitive identifiers; name new feature slots only in their
reviewed owner. Slot selectors do not grant shared-control appearance overrides.

**Incorrect:**

```tsx
data-slot="my-wrapper"      // Unclear new feature-slot purpose
data-slot="blueButton"      // Includes styling
data-slot="div-wrapper"     // Implementation detail
```

**Correct:**

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

// The feature owns loading; Button owns action and disabled behavior.
<Button
  type="submit"
  variant="default"
  size="default"
  disabled={isLoading || isDisabled}
  aria-busy={isLoading}
  data-loading={isLoading ? "" : undefined}
>
  {isLoading ? "Saving…" : "Save"}
</Button>;
```

| Pattern | Use For |

|---------|---------|

| Primitive state attributes | The existing part's open, active or disabled state |

| `data-slot` | Component identification, parent-child targeting |

| `props` | Existing variants, sizes, state props and event handlers |

1. **Read the existing primitive state attributes** instead of duplicating state
   or adding separate state-specific className props

2. **Preserve existing `data-slot` values**; name new feature slots in their owner

3. **Use kebab-case** for `data-slot` values

4. **Prefer Tailwind arbitrary variants** over custom CSS

5. **Never rely on class names** for parent-child targeting

---

## 11. Styling

**Impact: HIGH**

Component styling with Tailwind CSS, cn utility, class-variance-authority
(CVA), and intelligent class merging.

### 11.1 Component Styling with Tailwind CSS

**Impact: HIGH (Predictable, maintainable styling patterns)**

Use Tailwind CSS with Core’s shared `cn` helper for class merging and conditional classes, and existing variant APIs (CVA).

**Why:** Core’s shared `cn` helper resolves class conflicts consistently with the installed UI implementation.

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

Core consumers use existing variants and placement APIs. Native/CVA examples
illustrate a justified new passive authoring owner after component discovery;
they do not permit recreating Button or overriding shared appearance.

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

For components with multiple variants:

**Key points:**

- Define CVA variants **outside** the component

- Use `VariantProps<typeof variants>` for TypeScript types

- Always merge with `className` prop using `cn`

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

---

## 12. Design Tokens

**Impact: MEDIUM**

CSS variables for theming, color schemes, and consistent design
system values across components.

### 12.1 Design Tokens

**Impact: MEDIUM (Flexible theming and consistency)**

Use semantic design tokens instead of hardcoded colors. Design tokens separate
what something is from how it looks. Core consumes the existing Maia/Zinc tokens
in `packages/ui/styles/globals.css`; generic token-authoring or native-host
examples do not authorize app-local themes, palette changes or duplicate shared
controls. New token work stays with its existing shared owner and review.

**Base Tokens:**

- `--background` - Main page background

- `--foreground` - Primary text color

- `--muted` - Subtle backgrounds

- `--muted-foreground` - Text on muted

- `--border` - Border colors

- `--ring` - Focus ring

**Semantic Tokens:**

- `--primary` / `--primary-foreground`

- `--secondary` / `--secondary-foreground`

- `--destructive` / `--destructive-foreground`

- `--accent` / `--accent-foreground`

**Correct: semantic tokens**

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>
```

**Incorrect: hardcoded colors**

```tsx
// Before
<div className="bg-white text-gray-900 border-gray-200">Content</div>

// After
<div className="bg-background text-foreground border-border">Content</div>
```

Generic theme-authoring background: `.dark` can override tokens. Core already
owns its approved shared light/dark values; consume them unchanged:

Components automatically adapt because they reference tokens.

For generic token-authoring background, `oklch()` supports perceptual color
manipulation; it does not authorize replacing Core's existing values:

1. **Never hardcode colors** - Always use design tokens

2. **Use semantic names** - `--primary`, not `--blue-600`

3. **Keep tokens minimal** - Start with base set, add when needed

4. **Document token purpose** - Add comments

5. **Test theme switching** - Ensure all components work in light/dark

6. **Maintain contrast** - Ensure WCAG contrast ratios

---

## 13. Documentation

**Impact: MEDIUM**

Documenting components with JSDoc, usage examples, accessibility
notes, and prop descriptions.

### 13.1 Component Documentation

**Impact: MEDIUM (Adoption and developer experience)**

Create documentation that makes components accessible and easy to use.

Brief introduction explaining what the component does:

Include live demos with code:

For a justified Core addition, use the installed pinned CLI from repository root
with `--cwd packages/ui`; app consumers import `@asym/ui`. External npm
installation examples remain publishing background:

List key capabilities:

Show variants, states, and advanced usage:

Derive actual props from the shared component and current source. Example API
tables are illustrative subsets, not independent definitions:

Document a11y features:

Track versions; hypothetical external changelogs are documentation background,
not Core Button release history or additional props:

**Use Real-World Examples:**

```tsx
// ✅ Real-world
function UserProfile({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => editUser(user.id)}>Edit Profile</Button>
      </CardContent>
    </Card>
  );
}

// ❌ Too abstract
<Button onClick={handleClick}>Button</Button>;
```

**Include Troubleshooting:**

```markdown
## Troubleshooting

**Button not responding:**

- Ensure `onClick` handler is provided
- Check if `disabled` is set
- Verify no parent is capturing events
```

**Link Related Components:**

```markdown
## Related

- [`IconButton`](/components/icon-button)
- [`ButtonGroup`](/components/button-group)
```

**Make Examples Runnable:**

```tsx
// ✅ Complete client example
"use client";
import { Button } from "@asym/ui/components/shadcn/button";
import { useState } from "react";

export function CounterButton() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </Button>
  );
}
```

- [ ] Clear overview

- [ ] Live demo

- [ ] Installation instructions

- [ ] Feature list

- [ ] Multiple examples

- [ ] Complete API reference

- [ ] Accessibility docs

- [ ] Changelog

- [ ] Troubleshooting

- [ ] Related components

- [ ] All examples runnable

---

## 14. Registry

**Impact: LOW**

Component registry structure and schema for distributing
components via registries like shadcn/ui.

### 14.1 Component Registries

**Impact: LOW (Source code distribution)**

Registries distribute **source code**, not compiled packages. This enables true component ownership and customization.

#### Core Consumption Boundary

Core already consumes shared source through `@asym/ui`; do not create an app-local
`components/ui` tree or replace it with an external UI package. A registry item
is a candidate source import, not proof of Base UI/Maia compatibility. Review its
source and dependencies, adapt it to the existing shared owner, and use the
installed pinned CLI from repository root with `--cwd packages/ui` only when an
addition is justified.

Registry metadata, distribution comparisons and deployment/publishing examples
below remain generic external-authoring background. They do not change Core's
private package exports/build layout, authorize deployment, or establish rights
to redistribute any imported source. Preserve its actual provenance and notices.

**Bad:**

```typescript
// Traditional npm - compiled dependency
import { Button } from "some-ui-library";
```

**Good:**

```typescript
// Core consumes its existing shared first-party source.
import { Button } from "@asym/ui/components/shadcn/button";
```

**Bad:**

```json
{
  "name": "announcement",
  "type": "registry:component",
  "description": "A compound badge component"
  // Missing dependencies, registryDependencies, files, and category
}
```

**Good:**

```json
{
  "name": "announcement",
  "type": "registry:component",
  "description": "A compound badge component",
  "dependencies": ["class-variance-authority", "lucide-react"],
  "registryDependencies": ["badge"],
  "files": [
    {
      "type": "registry:component",
      "path": "announcement.tsx",
      "content": "..."
    }
  ],
  "category": "ui"
}
```

**1. Create structure:**

```typescript
my-component/
├── public/
│   └── metric-card.json
└── vercel.json
```

**2. Configure headers (`vercel.json`):**

**Example:**

```json
{
  "headers": [
    {
      "source": "/(.*).json",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Content-Type", "value": "application/json" }
      ]
    }
  ]
}
```

**3. Deploy:**

**Example:**

```bash
vercel --prod
```

**4. Users install via:**

**Example:**

```bash
bunx --no-install shadcn add https://your-project.vercel.app/metric-card.json --cwd packages/ui
```

**Example:**

```json
{
  "name": "metric-card",
  "type": "registry:component",
  "description": "Display metrics with icon and trend",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["card"],
  "files": [
    {
      "type": "registry:component",
      "path": "metric-card.tsx",
      "content": "import { Card } from '@/components/ui/card'\n\nexport function MetricCard({ title, value }) {\n  return <Card><h3>{title}</h3><p>{value}</p></Card>\n}"
    }
  ],
  "category": "ui"
}
```

| Aspect | Registry | npm |

|--------|----------|-----|

| Distribution | Source code | Compiled |

| Ownership | Full control | Dependency lock |

| Customization | Modify freely | Fork/override |

| Updates | Manual copy | `npm update` |

| Bundle size | Only what you use | Full package |

**For Authors:**

1. Document dependencies

2. Version components

3. Provide examples

4. Test compatibility

5. Use semantic naming

**For Consumers:**

1. Review source code

2. Check dependencies

3. Customize freely

4. Track updates

5. Test thoroughly

**Use registries when:**

- Sharing with community

- Users need source ownership

- Building for specific frameworks

- Quick distribution needed

**Use npm when:**

- Distributing compiled code

- Need version management

- Framework-agnostic libraries

- Complex build processes

---

## 15. NPM

**Impact: LOW**

Publishing components to npm including package.json
configuration, exports, and module formats.

### 15.1 Publishing to NPM

**Impact: LOW (Traditional package distribution)**

Distribute components as npm packages for stable, versioned dependencies with centralized updates.

This chapter is generic external publishing background. Core's `@asym/ui` is a
private source-export workspace package; its current manifest/build/exports stay
authoritative. Do not copy this sample package, dependency pins or publication
commands into Core as a replacement for that boundary.

Choose npm when:

- Users need stable, versioned dependencies

- Centralized control over updates

- Automatic dependency resolution

- Users don't need source code access

**Bad:**

```json
{
  "name": "@acme/ui-components",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

Missing `exports` field, pointing to source files instead of built dist, and including React in dependencies instead of peerDependencies.

**Correct:**

```json
{
  "name": "@acme/ui-components",
  "version": "1.0.0",
  "description": "Accessible React components",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

**Key points:**

- Use `exports` for modern module resolution

- Include ESM (`module`) and CommonJS (`main`)

- Specify `types` for TypeScript

- Use `peerDependencies` for React

- Limit published files with `files` array

**Critical:** Document this requirement for Tailwind-based components:

**Example:**

```css
@import "tailwindcss";

/* Users must add this to scan your package */
@source "../node_modules/@acme/ui-components";
```

**Example:**

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "prepublishOnly": "npm run build"
  }
}
```

**Steps:**

1. Build (`npm run build`)

2. Verify `dist` contents

3. Update version (`npm version patch|minor|major`)

4. Publish (`npm publish`)

**Source Code:**

- Users cannot modify directly

- Bug fixes require package updates

- Customization limited to exposed API

**Bundle Size:**

- All components included

- Tree-shaking helps but imperfect

**Customization:**

- Work within exposed API only

- Forking required for deep changes

**Example:**

```tsx
import { Button } from "@acme/ui-components";

// Pre-built, versioned code from node_modules
```

**npm when:**

- Stable, versioned dependencies needed

- Centralized updates preferred

- Source access not required

**Registry when:**

- Source code access needed

- Customization beyond props important

- Copy-paste workflow preferred

Consider offering both to let developers choose.

---

## 16. Marketplaces

**Impact: LOW**

Distribution strategies for component marketplaces and
third-party component ecosystems.

### 16.1 Component Marketplaces

**Impact: LOW (Centralized discovery and distribution)**

Marketplaces like [21st.dev](https://21st.dev) combine registry accessibility with package repository discoverability.

#### Core Adoption Boundary

These marketplace examples are discovery/external-authoring background, not an
approved replacement for Core's shared primitives. Review the complete source,
dependencies and permissions before adopting any item; adapt behavior to Base UI
and appearance to exact `base-maia`/semantic tokens. Do not import a second
primitive system or install into an app. A justified compatible addition uses
the installed pinned CLI from repository root with `--cwd packages/ui`.

**For Publishing:**

- Share without managing infrastructure

- Reach built-in audience

- Monetize your work

- Get community feedback

**For Consuming:**

```bash
bunx --no-install shadcn add https://21st.dev/r/haydenbleasel/dialog-stack --cwd packages/ui
```

- Curated discovery by category

- Quality assurance

- Unified tooling

Example:

1. **Hosting** - No infrastructure management

2. **Unified CLI** - Same installation pattern

3. **Previews** - Live demos and examples

4. **Discovery** - Search, categories, recommendations

Ensure components have:

- Comprehensive documentation

- Multiple demo variations

- Responsive design

- Cross-browser testing

- Accessibility compliance

- Production-ready code

**Bad:**

```json
{
  "name": "my-component",
  "description": "A component",
  "demos": []
}
```

Incomplete documentation, no demos, minimal description - marketplace users can't evaluate quality.

**Good:**

```json
{
  "name": "dialog-stack",
  "description": "A composable dialog system with stack management, keyboard navigation, and focus trapping",
  "demos": [
    {
      "title": "Basic Dialog",
      "description": "Simple modal dialog with close button",
      "code": "..."
    },
    {
      "title": "Nested Dialogs",
      "description": "Multiple dialogs in a stack",
      "code": "..."
    },
    {
      "title": "Form Dialog",
      "description": "Dialog with form validation",
      "code": "..."
    }
  ],
  "documentation": {
    "props": "...",
    "examples": "...",
    "accessibility": "..."
  }
}
```

Comprehensive documentation, multiple demo variations, clear descriptions - enables proper evaluation.

**For Authors:**

- Distribution without infrastructure

- Built-in audience and discovery

- Monetization opportunities

- Community feedback (ratings, comments)

**For Consumers:**

- Curated discovery by category

- Quality assurance through reviews

- Unified installation tooling

**For Authors:**

- Competition and visibility

- Platform dependency

- Quality pressure

**For Consumers:**

- Variable quality despite reviews

- Lock-in concerns

- Discovery paradox (too much choice)

**When Publishing:**

1. Only publish production-ready components

2. Document thoroughly

3. Create multiple demos

4. Test extensively

5. Maintain actively

6. Engage with community

**When Consuming:**

```typescript
Browse by category:
├── Marketing (Heroes, Pricing, Testimonials)
├── Application (Dashboards, Forms, Data Display)
└── E-commerce (Product Cards, Cart, Checkout)
```

1. Evaluate before installing

2. Test in your environment

3. Check maintenance status

4. Review code quality

5. Consider alternatives

Always check:

- Component age and last update

- Documentation quality

- Author reputation

- Dependencies and compatibility

- Test in your environment

---

## References

1. [https://components.build](https://components.build)
2. [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)
3. [https://ui.shadcn.com](https://ui.shadcn.com)
