# Plan 001: Make `@asym/ui` and `@asym/missionary` typecheck on Base UI APIs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: the migration work this plan finishes is
> **uncommitted** on branch `claude/naughty-knuth-09f32b` (planned at commit
> `a661bfb9` + working tree). Run
> `bunx turbo run typecheck --filter=@asym/ui 2>&1 | grep -c "error TS"`.
> Expected: ~59 errors. If it returns 0, this plan is already done — verify
> Done criteria and update the index. If the count differs wildly (>100 or
> <20), compare the "Current state" inventory below against live errors
> before proceeding.

## Status

- **Priority**: P1
- **Effort**: M (a day-ish)
- **Risk**: MED — composition changes can alter rendered DOM/behavior; follow the conversion rules exactly
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `a661bfb9`, 2026-06-12 (work in uncommitted working tree)

## Why this matters

This branch ports all 35 shared shadcn components in
`packages/ui/components/shadcn/` from Radix UI to Base UI
(`@base-ui/react@1.5.0`, shadcn `base-maia` style). The shared components are
done, but the consumers inside `packages/ui` itself (data-table, studio,
shadcn-studio blocks, public sections, primitives) and `packages/missionary`
still use the removed Radix-era APIs (`asChild`, Radix `CheckedState`, Radix
Select handler signatures). Result: `@asym/ui` fails typecheck with 59 errors,
which blocks every app build, all validation gates, and the rest of the
migration (plans 002–006).

## Current state

`bunx turbo run typecheck --filter=@asym/ui` fails (exit 2) with 59 errors in
these files (error counts in parens):

- `components/studio/PDFStudioSetupStatus.tsx` (5), `components/studio/EmailStudioProviderStatus.tsx` (1), `components/studio/EmailStudioMergeTagMenu.tsx` (1)
- `components/shadcn-studio/blocks/menu-dropdown.tsx` (5), `blocks/dropdown-profile.tsx` (2), `blocks/dropdown-notification.tsx` (1), `blocks/dropdown-language.tsx` (1), `blocks/dialog-activity.tsx` (1), `blocks/hero-section-09/hero-section-09.tsx` (2), `blocks/hero-section-09/header.tsx` (1)
- `components/public/home-sections.tsx` (3), `about-sections.tsx` (3), `navbar-client.tsx` (2), `navbar.tsx` (1), `home-hero-animated.tsx` (2)
- `components/shadcn/data-table/`: `filters/saved-filters.tsx` (3), `filters/filter-select-inputs.tsx` (2), `filters/filter-row.tsx` (2), `filters/filter-builder.tsx` (2), `filters/date-range-filter.tsx` (2), `filters/filter-value-inputs.tsx` (1), `data-table-toolbar-responsive.tsx` (2), and 1 each in `data-table-view-options.tsx`, `data-table-row-actions.tsx`, `data-table-responsive-inner.tsx`, `data-table-floating-bar.tsx`, `data-table-faceted-filter.tsx`, `data-table-column-header.tsx`, `data-table-card-view.tsx`, `data-table-body.tsx`, `cell-variants/select-cell.tsx`, `cell-variants/date-cell.tsx`, `cell-variants/checkbox-cell.tsx`
- `components/shadcn/command.tsx` (1)
- `components/primitives/tanstack-form.tsx` (1), `components/primitives/image-cropper.tsx` (1)

`packages/missionary` (workspace `@asym/missionary`, script `typecheck: tsc --noEmit`)
has 11 `asChild` occurrences across: `components/tasks/task-table.tsx`,
`tasks/task-row.tsx`, `tasks/task-bulk-actions-bar.tsx`, `task-row.tsx`,
`task-dialog.tsx`, `tasks-preview.tsx`, `activity-feed.tsx`,
`add-partner-dialog.tsx`.

The errors fall into exactly five classes:

### Class A — `asChild` no longer exists (most errors)

Example error: `Property 'asChild' does not exist on type 'IntrinsicAttributes & Props<unknown>'`.
Base UI composition uses a `render` prop instead. Conversion rules are in the
"Conversion rules" section below.

### Class B — Select `onValueChange` now receives `string | null`

`components/primitives/tanstack-form.tsx:486` (verified excerpt):

```tsx
onValueChange={(value: string) => field.handleChange(value)}
```

Error: `Type '(value: string) => void' is not assignable to type '(value: string | null, eventDetails: SelectRootChangeEventDetails) => void'`.
Same class at `data-table/cell-variants/select-cell.tsx:58`,
`data-table/filters/date-range-filter.tsx:347`, `filters/filter-row.tsx:106`
and `:119`. Fix pattern (no Select in this repo uses null item values, so a
guard is safe):

```tsx
onValueChange={(value) => {
  if (value === null) return;
  field.handleChange(value);
}}
```

For `filter-row.tsx:119` the handler is typed against a string-literal union —
guard null then cast/narrow to the union as the existing handler expects.

### Class C — Checkbox `"indeterminate"` is no longer a `checked` value

Base UI Checkbox takes `checked: boolean` plus a separate
`indeterminate: boolean` prop. Errors at
`data-table/cell-variants/checkbox-cell.tsx:41`, `data-table/data-table-body.tsx:301`,
`data-table/data-table-responsive-inner.tsx:135`. Typical TanStack-table fix:

```tsx
// BEFORE
checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
// AFTER
checked={table.getIsAllPageRowsSelected()}
indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
```

### Class D — Slider value can be scalar

`components/primitives/image-cropper.tsx:285`: `Type 'number | readonly number[]' must have a '[Symbol.iterator]()'`.
Base UI Slider `onValueChange` passes `number | number[]`. Normalize:

```tsx
onValueChange={(value) => {
  const next = Array.isArray(value) ? value[0] : value;
  // ... use next
}}
```

### Class E — `CommandDialog` children union

`components/shadcn/command.tsx:85`: children inherited from Base Dialog Root
props include a render-function variant
(`ReactNode | PayloadChildRenderFunction<unknown>`), which can't be passed to
`<Command>{children}</Command>`. Fix: give `CommandDialog` an explicit
`children: React.ReactNode` prop (intersect/override the inherited type) so
the union collapses to `ReactNode`.

Also in `command.tsx:79` (silent breakage, same file): the class string
`data-[state=open]:!animate-none data-[state=closed]:!animate-none` targets
Radix attributes the Base dialog no longer emits, so the command palette
regains the modal open/close animation it is explicitly supposed to strip
(see the comment above it). Replace with `data-open:!animate-none
data-closed:!animate-none`.

## Conversion rules (apply exactly; do not invent variants)

These rules were vetted against the ported components and upstream shadcn
base-maia sources. Reference copies of upstream live in
`.claude-scratch/upstream/*.tsx` (gitignored; may be absent — the rules below
are self-sufficient).

### A1. Trigger wrapping a `Button` (most common)

```tsx
// BEFORE
<DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon" className="x">
    <MoreHorizontal />
    <span className="sr-only">Open</span>
  </Button>
</DropdownMenuTrigger>
// AFTER — props stay on Button, children move to the trigger
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="x" />}>
  <MoreHorizontal />
  <span className="sr-only">Open</span>
</DropdownMenuTrigger>
```

Applies to: `DialogTrigger`, `DialogClose`, `SheetTrigger`, `SheetClose`,
`AlertDialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`,
`TooltipTrigger`, `CollapsibleTrigger`, `DrawerTrigger`, `DrawerClose`,
`HoverCardTrigger`, `ContextMenuTrigger`, `MenubarTrigger`.

### A2. Trigger rendering a non-button element (`div`/`span`/`a`/`Link`/`tr`/`td`)

Add `nativeButton={false}`:

```tsx
<TooltipTrigger render={<span className="x" />} nativeButton={false}>
  {children}
</TooltipTrigger>
```

### A3. `<Button asChild>` wrapping a `Link`/anchor

Prefer `buttonVariants` on the link (identical rendered output):

```tsx
import { buttonVariants } from "@asym/ui/components/shadcn/button";
<Link
  href="/path"
  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "x")}
>
  Label
</Link>;
```

If the Button carries behavior (disabled, onClick, meaningful aria), use
`<Button render={<Link href="/path" />} nativeButton={false}>Label</Button>`.

### A4. Items, links, roots

```tsx
<DropdownMenuItem render={<Link href="/x" />}>Text</DropdownMenuItem>
<SidebarMenuButton render={<Link href="/x" />}><Icon /><span>T</span></SidebarMenuButton>
<Collapsible render={<li />}>...</Collapsible>
<Badge render={<Link href="/x" />}>New</Badge>
// BreadcrumbLink, ButtonGroupText, Item, SidebarGroupLabel, SidebarGroupAction,
// SidebarMenuAction, SidebarMenuSubButton: same pattern — render={<el />}.
```

Never wrap a trigger's child in an extra `div` to make composition work.

### A5. `data-[state=...]` class selectors in any file you touch

| Radix selector                                                                                                | Base UI replacement                      |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `data-[state=open]:` / `data-[state=closed]:` on popup/dialog/sheet content, accordion item, collapsible root | `data-open:` / `data-closed:`            |
| `data-[state=open]:` on a menu/popover/select TRIGGER                                                         | `aria-expanded:` (or `data-popup-open:`) |
| `data-[state=open]:` on a collapsible/accordion TRIGGER                                                       | `data-panel-open:`                       |
| `group-data-[state=open]/collapsible:`                                                                        | `group-data-open/collapsible:`           |
| `data-[state=active]:` on TabsTrigger                                                                         | `data-active:`                           |
| `data-[state=checked]:` / `=unchecked]:` (Checkbox/Switch/RadioGroupItem)                                     | `data-checked:` / `data-unchecked:`      |
| `data-[state=on]:` (Toggle/ToggleGroupItem)                                                                   | `data-pressed:`                          |
| `data-[state=selected]:` on TanStack Table rows (`data-state={row.getIsSelected() && "selected"}`)            | **unchanged — not Radix, leave alone**   |
| `data-[state=collapsed/expanded]` near Sidebar (repo-set at `packages/ui/components/shadcn/sidebar.tsx:206`)  | **unchanged — repo-set, leave alone**    |

### Styling conventions for any line you touch

Semantic tokens only (`bg-background`, `text-muted-foreground`, …); no
`transition-all`; replace `space-x-*`/`space-y-*` with flex + `gap-*`; icons
inside `Button` get `data-icon="inline-start"`/`"inline-end"`.

## Commands you will need

| Purpose                  | Command                                                           | Expected on success |
| ------------------------ | ----------------------------------------------------------------- | ------------------- |
| Typecheck ui             | `bunx turbo run typecheck --filter=@asym/ui`                      | exit 0              |
| Typecheck missionary pkg | `bunx turbo run typecheck --filter=@asym/missionary`              | exit 0              |
| Lint scoped              | `bunx turbo run lint --filter=@asym/ui --filter=@asym/missionary` | exit 0              |
| Unit tests               | `bun run test:unit`                                               | all pass            |
| Leftover scan            | `rg -n "asChild" packages/ui packages/missionary`                 | no matches          |

Run from the repo root. Package manager is **Bun**; never use npm/pnpm for
repo scripts.

## Suggested executor toolkit

- Skill `base-ui` (`docs/ai/skills/base-ui/SKILL.md`) — Base UI API reference links.
- Skill `shadcn` (`.agents/skills/shadcn/rules/base-vs-radix.md`) — the asChild→render mapping this plan inlines.
- `docs/ai/rules/frontend.md` — repo styling rules.

## Scope

**In scope** (the only files you should modify):

- `packages/ui/components/shadcn/data-table/**`
- `packages/ui/components/shadcn/command.tsx`
- `packages/ui/components/studio/**`
- `packages/ui/components/shadcn-studio/**`
- `packages/ui/components/public/**`
- `packages/ui/components/primitives/tanstack-form.tsx`, `packages/ui/components/primitives/image-cropper.tsx`
- `packages/missionary/components/**`

**Out of scope** (do NOT touch):

- The 35 canonical primitives in `packages/ui/components/shadcn/*.tsx`
  (button, dialog, select, tabs, …) — already ported; under separate review.
  If a fix seems to require changing one, STOP.
- `apps/**` (plans 002–003), `package.json`/lockfile (plan 004), docs (plan 005).
- `data-state={...}` attributes that repo code sets itself (sidebar, TanStack rows).

## Git workflow

- Work directly on branch `claude/naughty-knuth-09f32b` (the migration branch; its work is uncommitted by design — the operator commits).
- Do not commit, push, or open PRs unless the operator instructed it.

## Steps

### Step 1: Fix `packages/ui/components/shadcn/data-table/**`

Apply classes A–D per file using the per-file inventory above.

**Verify**: `bunx turbo run typecheck --filter=@asym/ui 2>&1 | grep "error TS" | grep -c "data-table"` → `0`

### Step 2: Fix `command.tsx`, `tanstack-form.tsx`, `image-cropper.tsx`

Apply classes B, D, E exactly as excerpted above, plus the `command.tsx:79`
selector fix.

**Verify**: `bunx turbo run typecheck --filter=@asym/ui 2>&1 | grep "error TS" | grep -cE "command|tanstack-form|image-cropper"` → `0`

### Step 3: Fix `studio/**`, `shadcn-studio/**`, `public/**`

All class A (`asChild` → `render`). Watch for A2 (non-button render targets)
and A3 (Button-wrapping-Link → `buttonVariants`).

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0, no errors

### Step 4: Fix `packages/missionary/components/**`

Same rules; 11 `asChild` sites listed in Current state.

**Verify**: `bunx turbo run typecheck --filter=@asym/missionary` → exit 0

### Step 5: Sweep `data-[state=` selectors in in-scope dirs

`rg -n 'data-\[state=' packages/ui/components/{data-table,studio,shadcn-studio,public,primitives} packages/missionary`
Convert per table A5, honoring the two keep-rules.

**Verify**: the same `rg` returns only TanStack-row/sidebar keep-rule matches (or nothing)

### Step 6: Lint + unit tests

**Verify**: `bunx turbo run lint --filter=@asym/ui --filter=@asym/missionary` → exit 0; `bun run test:unit` → pass

## Test plan

No new test files. The gate is: typecheck exit 0 for both workspaces,
`bun run test:unit` green (covers data-table/tanstack-form behavior), and the
leftover scans empty. Visual/behavioral QA is consolidated in plan 006.

## Done criteria

- [ ] `bunx turbo run typecheck --filter=@asym/ui` exits 0
- [ ] `bunx turbo run typecheck --filter=@asym/missionary` exits 0
- [ ] `rg -n "asChild" packages/ui packages/missionary` → no matches
- [ ] `rg -n 'data-\[state=' packages/ui packages/missionary` → only sidebar repo-set/TanStack keep-rule matches
- [ ] `bunx turbo run lint --filter=@asym/ui --filter=@asym/missionary` exits 0
- [ ] `bun run test:unit` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- A fix appears to require editing a canonical primitive in
  `packages/ui/components/shadcn/*.tsx` (e.g. a missing `render`/`nativeButton`
  prop, a missing export) — report which primitive and why.
- A Base UI component rejects `render` where rule A1/A4 says it should accept
  it (possible wrapper gap) — report the component and the error.
- Typecheck error count goes UP after a step.
- You find a `Select` consumer that genuinely uses `null`/empty values such
  that the Class-B null-guard would change behavior — report it instead of
  guessing.

## Maintenance notes

- Reviewers should scrutinize A1 conversions where the old child had
  `onClick`/`ref`: with `render={<Button …/>}` Base UI merges props onto the
  rendered element — handlers belong on the rendered element, not the trigger.
- The Checkbox `indeterminate` conversions change header-checkbox semantics
  subtly: verify "select all" tri-state in data tables during plan 006 QA.
- Deferred: app consumers (002/003), dependency removal (004), docs (005).
