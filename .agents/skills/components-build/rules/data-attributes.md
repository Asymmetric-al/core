---
title: Data Attributes for Styling
impact: LOW
impactDescription: Clean state-based styling patterns
tags: data-attributes, data-state, data-slot, styling, tailwind, css
---

## Data Attributes for Component Styling

Use the existing primitive's emitted state attributes and stable `data-slot`
identifiers. Core uses Base UI presence attributes, not a generic
`data-state="open"` contract.

**Never expose separate className props for different states.** Use the existing
primitive's emitted attributes and supported styling contract instead.

### Read State from the Existing Part

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

### Current Core State Contracts

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

### Tailwind Integration

Inside an existing primitive's reviewed authoring owner, selectors such as
`data-open:`, `data-closed:`, `data-panel-open:` and `data-active:` read its actual
attributes. Consumers use the component's existing variants and placement API;
state selectors are not permission to override shared appearance or motion.
The installed Dialog already owns its popup entrance and exit animation.

### Use data-slot for Component Identification

Preserve every existing primitive's stable identifier. The passive wrappers below
illustrate slot mechanics only; first reuse the existing shared field/layout
parts in Core. A new slot belongs to its reviewed component owner, not an
app-local replacement or a selector-based shared-control restyle.

```tsx
function CheckboxGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="checkbox-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}
```

### Parent-Aware Styling

```tsx
<div className="flex gap-2">
  <Button type="button">Save project</Button>
  <Button type="button" variant="outline">
    Cancel
  </Button>
</div>
```

### Naming Conventions

**Incorrect:**

```tsx
data-slot="my-wrapper"      // Unclear new feature-slot purpose
data-slot="blueButton"      // Includes styling
data-slot="div-wrapper"     // Implementation detail
```

**Correct for new feature slots (keep existing shared slots unchanged):**

```tsx
data-slot="search-input"
data-slot="navigation-menu"
data-slot="error-message"
data-slot="submit-button"
```

### When to Use Each

| Pattern                    | Use For                                                  |
| -------------------------- | -------------------------------------------------------- |
| Primitive state attributes | The existing part's open, active or disabled state       |
| `data-slot`                | Component identification, parent-child targeting         |
| `props`                    | Existing variants, sizes, state props and event handlers |

### Combined Example

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

### Rules

1. **Read the existing primitive state attributes** instead of duplicating state
   or adding separate state-specific className props
2. **Preserve existing `data-slot` values**; name new feature slots in their owner
3. **Use kebab-case** for `data-slot` values
4. **Prefer Tailwind arbitrary variants** over custom CSS
5. **Never rely on class names** for parent-child targeting
