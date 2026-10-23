---
title: Component Composition
impact: HIGH
impactDescription: Compose existing shared parts without duplicating state or behavior
tags: composition, patterns, sub-components, base-ui, trigger, content
---

## Component Composition

Compose the existing Core parts before building a new primitive. Shared Base UI components already own state coordination, keyboard navigation, ARIA and focus behavior; do not recreate them with a parallel Context or an inert `asChild` prop.

### Compose the Shared Parts

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

### Compose a Trigger Host

```tsx
import { Button } from "@asym/ui/components/shadcn/button";
import { DialogTrigger } from "@asym/ui/components/shadcn/dialog";

<DialogTrigger render={<Button type="button" variant="outline" />}>
  Open details
</DialogTrigger>;
```

Use this trigger inside the existing Dialog root. The `render` host receives the primitive's merged props and ref. Custom hosts must forward both to the same DOM node; do not discard them, manually clone the child or nest interactive elements.

See [Base UI render composition](as-child.md) for native button versus link semantics, and [state management](state.md) for controlled and uncontrolled use.

### Keep Ownership Clear

- **Root** owns the existing primitive's state and coordinates its parts.
- **Item** groups the primitive's related trigger and content.
- **Trigger** retains the primitive's interaction and accessible state.
- **Content** retains its visibility, focus and lifecycle behavior.
- **Title / Description** provide the accessible name and supporting context.

Feature-specific wrappers may arrange these parts and forward their existing public props/ref. Extend the shared component through `packages/ui` when new reusable behavior is needed; do not introduce an app-local primitive or state abstraction.

### Verify the Result

Check the actual exported types and rendered host, then verify keyboard navigation, names, focus and disabled behavior at the composed feature boundary. Keep semantic tokens and exact `base-maia` presentation.

References: [Base UI composition](https://base-ui.com/react/handbook/composition), `packages/ui/components/shadcn/accordion.tsx`, and `packages/ui/components/shadcn/dialog.tsx`.
