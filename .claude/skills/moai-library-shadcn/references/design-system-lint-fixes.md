# Fixing a design-system lint finding

Use this page when a `shadcn/*` rule reports a finding. Every finding links
here. The workflow, policy boundaries and maintenance procedures live in
[design-system-lint.md](design-system-lint.md), which stays the authority.

## Check your work

```bash
bun run lint:ui apps/donor/app/layout.tsx  # one file or directory, repo-relative
bun run lint:ui apps/donor/app/layout.tsx --raw  # include accepted legacy debt
```

- Exit `1` means findings. Exit `2` means a setup failure or unused
  suppressions; the output says which.
- Use these wrapper commands, not plain `eslint` or the ESLint MCP server.
  Those skip Core's suppression file and health checks, so they report
  accepted legacy debt as new errors.

## Fix by rule

### `shadcn/no-restyle`

A shared `@asym/ui` component owns its appearance. The message names the
class, the component and the options it already has.

- **Spacing** (`p-*`, `gap-*`): pick one of the listed `size` values. For
  space around the component, use margin on it or `gap` on its parent.
- **Color, shape, typography, effects, motion**: pick one of the listed
  `variant` values.
- **Layout** (`h-*`, `overflow-*`, other dimensions): controls accept
  placement only: margin, `self-*`, grid placement, `order-*`,
  `shrink-0`, `grow`, `basis-*`, `w-full`, `max-w-full`, `hidden` and
  `sr-only`. Put other sizing on a parent element.
- **Structural slots** such as `Card*`, `Table*`, `Field*`, `Sidebar*` and
  dialog headers and footers accept layout and spacing for arranging their
  content. Title and description slots accept typography.
- **Popups**: `DialogContent`, `PopoverContent` and `SheetContent` accept
  width (`w-*`, `min-w-*`, `max-w-*`) and margin. They own their height,
  scrolling and position. For long dialog content, use
  `<DialogContent scrollable>`. In a popover or sheet, scroll or size the
  content inside it.
- **Links that look like buttons**: use `ButtonLink` from
  `@asym/ui/components/shadcn/button`, with the same `variant` and `size`
  props. `Button` is for actions.
- Add a variant or size in `packages/ui` only when the design needs one no
  existing option provides. Then lint every consumer of that component.

### `shadcn/no-raw-colors`

Use a semantic token from `packages/ui/styles/globals.css`. For example:
`background`, `foreground`, `card`, `popover`, `primary`, `secondary`,
`muted`, `accent`, `border`, `input`, `ring` and the `sidebar-*` family.
For states, use `destructive`, `success`, `warning` and `info`. Keep
`chart-*` for charts, even when the message lists one as the nearest token.
For SVG `fill` or `stroke`, use `currentColor` with a text color class.

Palette colors such as `zinc-500` or `emerald-600` are rejected: Zinc is the
theme family, not a set of classes to use directly. A new color needs a
purpose-named token in `packages/ui/styles/globals.css`, with light and
dark values and a contrast review. Never add one for a single component, and
never declare one in an app stylesheet.

### `shadcn/no-arbitrary-values`

Use the scale value the message suggests, such as `max-w-50` for
`max-w-[200px]`. For motion, use the shared tokens:
`ease-(--ease-out-soft)` and `duration-(--duration-micro)`, `standard`,
`modal` or `drawer`.

### `shadcn/no-inline-styles`

Use classes. For a value only known at runtime, set a CSS custom property
and read it with a utility:

```tsx
<div
  className="h-(--chart-height)"
  style={{ "--chart-height": `${height}px` } as React.CSSProperties}
/>
```

A color in a custom property must reference a theme variable.

### `shadcn/no-unknown-classes`

The class is misspelled, or Tailwind cannot generate it. Use the suggested
spelling or an existing utility.

### `shadcn/require-static-classes`

Write complete class names so the linter can read them. Use
`cn("mt-4", wide && "w-full")`, a ternary between full class names, or a
lookup object of full class strings. Never build a name such as
`` `bg-${color}` ``. If the choice is a design option, add a variant.

## Files with legacy debt

`tooling/eslint-config/suppressions.json` records accepted legacy findings
as counts per file and rule.

- **You added a finding to a file with recorded debt for that rule.** Lint
  then reports every finding of that rule in the file, not only yours.
  Yours are on the lines you changed. Fixing the others too is welcome.
- **You fixed recorded debt.** Lint exits `2` with "There are suppressions
  left that do not occur anymore". Run
  `bun run lint:ui <same paths> --prune-suppressions` and commit the lower
  counts. A scoped prune changes only the files it linted, plus entries
  for files that no longer exist.
- Never raise a count, regenerate the file or add a disable comment to get
  a pass.

## Never

- Widen a contract, an exception or an allowance to make a usage pass.
- Move styling into CSS, spreads or dynamically built names to hide it from
  the linter.
- Recreate a shared component locally to escape its contract.
