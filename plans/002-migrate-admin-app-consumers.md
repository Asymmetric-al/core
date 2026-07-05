# Plan 002: Migrate `apps/admin` consumers to Base UI APIs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `rg -c "asChild" apps/admin | awk -F: '{s+=$NF} END {print s}'`
> Expected: ~113. If 0, the plan is done — verify Done criteria. The
> conversion rules in plan 001 ("Conversion rules" section of
> `plans/001-finish-ui-package-consumer-migration.md`) are duplicated below so
> this plan stands alone.

## Status

- **Priority**: P1
- **Effort**: L (largest consumer surface: ~113 `asChild` sites across ~60 files)
- **Risk**: MED — admin is the operational dashboard; menus/dialogs are load-bearing
- **Depends on**: plans/001-finish-ui-package-consumer-migration.md (so shared-package errors don't mask admin errors)
- **Category**: migration
- **Planned at**: commit `a661bfb9`, 2026-06-12 (work in uncommitted working tree)

## Why this matters

The shared UI package (`@asym/ui`) has been ported from Radix UI to Base UI,
which removed the `asChild` prop and changed several value-model APIs.
`apps/admin` is the heaviest consumer (~113 `asChild` occurrences, plus
Radix-era `data-[state=...]` styling selectors and two `type="single"`
toggle-group/accordion call sites). Until this lands, `@asym/admin` fails
typecheck and cannot build or deploy.

## Current state

- `rg -l "asChild" apps/admin` → ~60 files, concentrated in:
  - `features/support-hub/components/**` (menus: ConversationStatusMenu, ConversationSnoozeMenu, ConversationPriorityMenu, ConversationLabelMenu, ConversationAssigneeMenu, LabelFilter, MacroLauncher, ReportExportMenu, SavedViewItem, views/\*)
  - `features/mission-control/**` (two app-shell generations: `shell/components/app-shell/*` and `components/app-shell/*` — TenantSwitcher, ProfileMenu, NotificationsMenu, MobileSidebar, SidebarNav, MissionControlHome, LocationTable, HealthHeatmap)
  - `src/cms-ui/web-studio/**` (studio-top-bar, studio-nav-rail, TemplateGalleryView, StandardPageFromTemplateView, MissionariesHubView, NativeCollectionListView, NativeCollectionEditView)
  - `app/**` pages: tasks (columns, sections, drawer), support tickets, crm (columns, page-clients), contributions columns, feed, email, pdf, mc-shell, teams-sections
  - `components/app-sidebar.tsx`, `components/app-header.tsx`, `components/dashboard-footer.tsx`
- Value-model leftovers (verified): `app/email/page-client.tsx:310` and
  `app/pdf/page-client.tsx:490` pass `type="single"` (Radix ToggleGroup or
  Accordion API — see rule V1/V2 below).
- Radix-era `data-[state=...]` selectors exist in admin files (exact set via
  the Step 4 grep) — these compile fine but silently lose styling, because
  Base UI emits `data-open`/`data-checked`/`data-active`/`data-pressed`
  presence attributes instead.
- `apps/admin/package.json:44` still declares `@radix-ui/react-visually-hidden`
  — verified unused in source; it is removed in plan 004, NOT here.

## Conversion rules

Identical to plan 001; duplicated for self-containment.

### A1. Trigger wrapping a `Button`

```tsx
// BEFORE
<DropdownMenuTrigger asChild>
  <Button variant="ghost" size="icon" className="x">
    <MoreHorizontal />
  </Button>
</DropdownMenuTrigger>
// AFTER
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="x" />}>
  <MoreHorizontal />
</DropdownMenuTrigger>
```

Applies to: DialogTrigger, DialogClose, SheetTrigger, SheetClose,
AlertDialogTrigger, DropdownMenuTrigger, PopoverTrigger, TooltipTrigger,
CollapsibleTrigger, DrawerTrigger, DrawerClose, HoverCardTrigger,
ContextMenuTrigger, MenubarTrigger.

### A2. Trigger rendering a non-button element — add `nativeButton={false}`

```tsx
<TooltipTrigger render={<span className="x" />} nativeButton={false}>
  {children}
</TooltipTrigger>
```

### A3. `<Button asChild>` wrapping a `Link` — prefer `buttonVariants`

```tsx
import { buttonVariants } from "@asym/ui/components/shadcn/button";
<Link
  href="/path"
  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "x")}
>
  Label
</Link>;
```

If the Button carries behavior (disabled/onClick/meaningful aria):
`<Button render={<Link href="/path" />} nativeButton={false}>Label</Button>`.

### A4. Items/links/roots

```tsx
<DropdownMenuItem render={<Link href="/x" />}>Text</DropdownMenuItem>
<SidebarMenuButton render={<Link href="/x" />}><Icon /><span>T</span></SidebarMenuButton>
<Collapsible render={<li />}>...</Collapsible>
<Badge render={<Link href="/x" />}>New</Badge>
```

Never add a wrapper `div` around a trigger child.

### A5. `data-[state=...]` selector mapping

| Radix selector                                                                                     | Base UI replacement                 |
| -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `data-[state=open]:` / `=closed]:` on popup/dialog/sheet content, accordion item, collapsible root | `data-open:` / `data-closed:`       |
| `data-[state=open]:` on a menu/popover/select TRIGGER                                              | `aria-expanded:`                    |
| `data-[state=open]:` on collapsible/accordion TRIGGER                                              | `data-panel-open:`                  |
| `group-data-[state=open]/collapsible:`                                                             | `group-data-open/collapsible:`      |
| `data-[state=active]:` on TabsTrigger                                                              | `data-active:`                      |
| `data-[state=checked]:` / `=unchecked]:`                                                           | `data-checked:` / `data-unchecked:` |
| `data-[state=on]:` (Toggle/ToggleGroupItem)                                                        | `data-pressed:`                     |
| TanStack Table rows (`data-state={row.getIsSelected() && "selected"}`)                             | unchanged — leave alone             |
| Sidebar `data-state=collapsed/expanded` (repo-set)                                                 | unchanged — leave alone             |

### V1. ToggleGroup value model

`type="single"` → remove the prop (single is the Base default) **and** make
values arrays: `defaultValue={["x"]}`; controlled
`value={[v]}` + `onValueChange={(arr) => setV(arr[0] ?? fallback)}` (Base may
emit an empty array on deselect; preserve the old behavior where Radix emitted
`""`). `type="multiple"` → `multiple`.

### V2. Accordion value model

`type="single" collapsible` → remove both (Base default); `type="multiple"` →
`multiple`; string `defaultValue="a"` → `defaultValue={["a"]}`; controlled
value/onValueChange use arrays.

### V3. Select handler nullability

`onValueChange={(value: string) => fn(value)}` →
`onValueChange={(value) => { if (value === null) return; fn(value); }}`.

### V4. Checkbox indeterminate

`checked={x || "indeterminate"}` → `checked={boolX} indeterminate={boolY}`.

### V5. Tooltip timing props

`TooltipProvider delayDuration={X}` → `delay={X}`; `skipDelayDuration={Y}` →
`timeout={Y}`; `Tooltip delayDuration={X}` → `delay={X}`.

### Styling conventions for touched lines

Semantic tokens only; no `transition-all`; `space-x/y-*` → flex + `gap-*`;
icons in `Button` get `data-icon="inline-start"`/`"inline-end"`.

## Commands you will need

| Purpose       | Command                                         | Expected on success             |
| ------------- | ----------------------------------------------- | ------------------------------- |
| Typecheck     | `bunx turbo run typecheck --filter=@asym/admin` | exit 0                          |
| Lint          | `bunx turbo run lint --filter=@asym/admin`      | exit 0                          |
| Leftover scan | `rg -n "asChild" apps/admin`                    | no matches                      |
| Selector scan | `rg -n 'data-\[state=' apps/admin`              | only TanStack keep-rule matches |

## Scope

**In scope**: `apps/admin/**` `.tsx`/`.ts` source files only.

**Out of scope** (do NOT touch):

- `packages/**` (plan 001), `apps/donor/**`, `apps/missionary/**` (plan 003)
- `apps/admin/package.json` and any lockfile (plan 004)
- Route structure, auth guards, data loading, mutations, schemas, tenant
  logic, Payload/CMS config — this is a UI-API migration only
- Generated files: `apps/admin/.eslint-*.json` snapshots if present, importmap output

## Git workflow

- Work directly on branch `claude/naughty-knuth-09f32b`; do not commit/push
  unless the operator instructed it.

## Steps

### Step 1: support-hub menus

Convert all `features/support-hub/components/**` files (rules A1–A4).

**Verify**: `rg -c "asChild" apps/admin/features/support-hub | wc -l` → `0`

### Step 2: mission-control shells

Convert both shell generations under `features/mission-control/**`. These
include SidebarMenuButton/Link compositions (rule A4) and tooltip-wrapped
spans (rule A2).

**Verify**: `rg -c "asChild" apps/admin/features/mission-control | wc -l` → `0`

### Step 3: cms-ui web-studio + app pages + shared shell components

Convert `src/cms-ui/web-studio/**`, `app/**`, `components/*`. Includes the
two `type="single"` sites (`app/email/page-client.tsx:310`,
`app/pdf/page-client.tsx:490`) — identify whether each is ToggleGroup (V1) or
Accordion (V2) from its imports and convert values to arrays accordingly.

**Verify**: `rg -n "asChild|type=\"single\"|type=\"multiple\"" apps/admin` → no matches

### Step 4: selector sweep

`rg -n 'data-\[state=' apps/admin` — convert per A5 honoring keep-rules.

**Verify**: re-run grep → only keep-rule matches remain

### Step 5: typecheck + lint to zero

Fix any remaining errors using rules V1–V5 (they surface as the `asChild`
noise clears).

**Verify**: `bunx turbo run typecheck --filter=@asym/admin` → exit 0; `bunx turbo run lint --filter=@asym/admin` → exit 0

## Test plan

No new tests in this plan. Gates: typecheck/lint exit 0 and scans clean.
Behavioral QA (menus, dialogs, tables, dark mode, keyboard) is consolidated
in plan 006; admin-specific routes to spot-check there: `/admin`,
`/admin/contributions`, `/admin/mobilize`, `/admin/care`.

## Done criteria

- [ ] `bunx turbo run typecheck --filter=@asym/admin` exits 0
- [ ] `bunx turbo run lint --filter=@asym/admin` exits 0
- [ ] `rg -n "asChild" apps/admin` → no matches
- [ ] `rg -n 'data-\[state=' apps/admin` → only TanStack keep-rule matches
- [ ] No files outside `apps/admin/**` modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- A fix appears to require editing `packages/ui` (missing prop/export on a
  shared component) — report which component; that change belongs to the
  shared-package owner, not this plan.
- Plan 001 is not DONE and `@asym/admin` typecheck output is dominated by
  `../../packages/ui/...` errors — stop and execute/finish 001 first.
- An `asChild` site composes a component this plan's rules don't cover
  (something other than the trigger/item/link/root patterns above) — report
  the file:line and the component instead of improvising.
- Typecheck error count increases after a step.

## Maintenance notes

- Watch in review: trigger conversions where the old Button child had
  `onClick` — the handler must stay on the rendered Button element.
- The two `type="single"` conversions change value types string→array;
  scrutinize their `onValueChange` handlers for `arr[0]` unwrapping.
- Admin has duplicated app-shell implementations (two generations under
  `features/mission-control/`); both are converted here, but consolidation is
  a separate architecture follow-up (see plans/README.md).
