---
title: Base UI render Composition
impact: MEDIUM
impactDescription: Compose one semantic host with preserved behavior
tags: as-child, render, base-ui, composition, prop-merging
---

## Base UI render Composition

`rules/as-child.md` remains the compatibility index for older `asChild` references. In Core, compose the existing `@asym/ui` Base UI parts with `render`; do not add Radix Slot or an `asChild` API.

### Compose the Existing Trigger

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

### Forward Props and Ref

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

### Preserve Native Semantics

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

### Check the Composed Host

- Confirm one interactive DOM host, its accessible name and its intended native role.
- Verify forwarded props/ref, keyboard activation, focus restoration and disabled behavior.
- Reuse `packages/ui/components/shadcn/button.ts` and the existing primitive export; do not create an app-local primitive fork.

References: [Base UI composition](https://base-ui.com/react/handbook/composition), [shadcn Base UI Button](https://ui.shadcn.com/docs/components/base/button).
