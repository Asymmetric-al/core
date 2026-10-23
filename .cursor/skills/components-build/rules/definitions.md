---
title: Component Artifact Definitions
impact: MEDIUM
impactDescription: Essential for correct component classification
tags: definitions, primitive, component, block, template, pattern, utility, terminology
---

## Component Artifact Definitions

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

Precise terminology for classifying and naming UI artifacts.

### Primitive (Unstyled Component)

The **lowest-level building block** providing behavior and accessibility without styling. Completely headless.

In Core, the behavior-only implementation is Base UI's Dialog root inside
`packages/ui/components/shadcn/dialog.tsx`. Feature code consumes the existing
shared exports; it does not create another Dialog state or focus owner.

**Core example:** Base UI Dialog root, behind the shared `Dialog` export.
Other libraries listed by the upstream taxonomy are terminology examples, not
approved primitive dependencies in Core.

### Component

A **styled, reusable UI unit** that adds visual design to primitives or composes multiple elements.

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

// Styled component - the existing shared visual and behavior owner.
<Button type="button" variant="default" size="default">
  Open project
</Button>;
```

**Examples:** shadcn/ui components, Material UI, Ant Design

### Pattern

A **specific composition** solving a UI/UX problem. Documentation-focused, not a reusable component.

**Examples:** Form validation with inline errors, confirming destructive actions, typeahead search

### Block

An **opinionated, production-ready composition** solving a concrete interface use case.

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

type PricingTableProps = {
  plans: { id: string; name: string; price: string }[];
  onSelectPlan: (id: string) => void;
};

// Block - feature-specific composition of the shared flat exports.
function PricingTable({ plans, onSelectPlan }: PricingTableProps) {
  return (
    <div className="grid gap-4">
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
          </CardHeader>
          <CardContent>{plan.price}</CardContent>
          <CardFooter>
            <Button type="button" onClick={() => onSelectPlan(plan.id)}>
              Select Plan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

**Examples:** Pricing table, auth screens, onboarding stepper, AI chat panel

### Page

A **complete, single-route view** composed of multiple blocks.

```tsx
function LandingPage() {
  return (
    <Layout>
      <HeroBlock />
      <FeaturesBlock />
      <PricingBlock />
      <FooterBlock />
    </Layout>
  );
}
```

### Template

A **multi-page collection** or full-site scaffold bundling pages, routing, layouts, and providers.

**Examples:** SaaS starter, e-commerce template, dashboard starter

### Utility (Non-visual)

A **helper** for developer ergonomics or composition; not rendered UI.
Core reuses existing shared utilities and primitive state APIs. A caller may own
a controlled value; the existing primitive still coordinates interaction,
keyboard, ARIA and focus behavior.

```tsx
import { cn } from "@asym/ui/lib/utils";

const className = cn("text-foreground", "font-medium");
```

**Examples:** React hooks, class utilities, keybinding helpers, focus scopes

### Classification Decision Flow

1. **Behavior/a11y only, no styling?** → **Primitive**
2. **Styled, reusable UI element?** → **Component**
3. **Concrete product use case with opinionated composition?** → **Block**
4. **Multi-page scaffold with routing/providers?** → **Template**
5. **Documentation of recurring solution?** → **Pattern**
6. **Non-visual logic?** → **Utility**

### Common Classification Mistakes

**Incorrect (mislabeling a styled component as a primitive):**

```tsx
import { DialogContent } from "@asym/ui/components/shadcn/dialog";

// Wrong classification: DialogContent is already a styled shared component,
// not a behavior-only primitive. Its owning source supplies Maia presentation.
type BehaviorOnlyPrimitive = typeof DialogContent;
```

**Correct (proper classification based on styling presence):**

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

### Key Vocabulary

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
