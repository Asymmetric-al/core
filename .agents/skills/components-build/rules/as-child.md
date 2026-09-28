---
title: Base UI render composition
impact: MEDIUM
impactDescription: Preserve native semantics while composing existing shared components
tags: base-ui, render, composition, prop-merging
---

## Core composition uses Base UI render

This Core adaptation replaces the upstream Radix `asChild` recipe. The source
skill's provenance and license remain in the enclosing skill directory.
Core uses Base UI primitives and the existing shared `@asym/ui` components;
do not install Radix Slot or create another primitive wrapper.

Use the component's `render` prop to choose the rendered element. Keep one
interactive element, preserve its accessible name, and let Base UI compose
the primitive's event handlers and refs.

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

<Button render={<a href="/settings" />} nativeButton={false}>
  Open settings
</Button>;
```

For a button action, retain the normal native button and its `disabled`
behavior. For a link, retain its `href` and use `nativeButton={false}` as
required by the shared Base UI button. Do not nest a button inside a trigger
that already renders a button.

For dialogs, popovers, menus, and tooltips, inspect the existing shared
trigger API and the installed Base UI documentation before composing it.
Preserve focus restoration, keyboard behavior, disabled semantics, refs,
and the component's accessible relationships. Use shared variants and
semantic tokens instead of another component implementation.
