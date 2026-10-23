---
title: State Management Patterns
impact: HIGH
impactDescription: Reuse the shared primitive's controlled and uncontrolled APIs
tags: state, controlled, uncontrolled, base-ui
---

## State Management Patterns

Use the existing shared primitive's state API before adding state machinery. Core has no shared controllable-state hook to import. Do not add a Radix helper dependency or implement a second abstraction for these recipes.

### Uncontrolled State

Let the primitive manage state and supply only its initial default:

```tsx
import { Switch } from "@asym/ui/components/shadcn/switch";

<Switch aria-label="Email notifications" defaultChecked={false} />;
```

`defaultChecked` supplies the initial value; later changes to the prop do not control the current state. Use this mode when the parent does not need to own the value.

### Controlled State

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

### Value-Based Primitives

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

### Preserve the Primitive Contract

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
