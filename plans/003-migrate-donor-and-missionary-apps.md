# Plan 003: Migrate `apps/donor` and `apps/missionary` consumers to Base UI APIs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `rg -c "asChild" apps/donor apps/missionary | awk -F: '{s+=$NF} END {print s}'`
> Expected: ~47 (donor ~25, missionary ~22). If 0, verify Done criteria and
> update the index.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — donor checkout/giving paths are revenue-facing; keep changes mechanical
- **Depends on**: plans/001-finish-ui-package-consumer-migration.md
- **Category**: migration
- **Planned at**: commit `a661bfb9`, 2026-06-12 (work in uncommitted working tree)

## Why this matters

The shared `@asym/ui` package was ported from Radix UI to Base UI; `asChild`
and several Radix value-model APIs no longer exist. The donor app currently
fails typecheck with 67 errors (29 in its own code once shared-package errors
are excluded) and the missionary app has ~22 `asChild` sites. Both apps are
unbuildable until this lands.

## Current state

Verified by `bunx turbo run typecheck --filter=@asym/donor` (67 errors, 29
donor-own) and `rg`:

**apps/donor** own-error files:

- `app/**` — 23 errors: `(public)/workers/workers-client.tsx`,
  `(public)/workers/[id]/worker-profile-client.tsx` + `giving-widget.tsx`,
  `(public)/ways-to-give/ways-to-give-client.tsx`,
  `(public)/sign/[token]/page-client.tsx`, `(public)/faq/faq-client.tsx`,
  `(public)/checkout/checkout-client.tsx`,
  `(dashboard)/donor-dashboard/{wallet,pledges,history,feed}/page-client.tsx`,
  `(dashboard)/donor-dashboard/history/columns.tsx`, `app/layout.tsx` (1)
- `features/donor/components/donor-dashboard-main-body.tsx` (2),
  `features/giving/components/QuickGive.tsx` (1),
  `features/donor/components/dashboard-footer.tsx` (1),
  `components/openpolicy/legal-page-shell.tsx` (1)
- `apps/donor/app/(dashboard)/donor-dashboard/history/page-client.tsx` also
  uses `<Slider>` — Base UI keeps array support for range sliders, so arrays
  are fine; only fix it if typecheck complains (scalar-vs-array union, rule D
  below).

**apps/missionary** `asChild` files:

- `components/app-sidebar.tsx`, `components/app-header.tsx`, `components/dashboard-footer.tsx`
- `app/tasks/page-client.tsx`, `app/settings/page-client.tsx`,
  `app/profile/profile-primitives.tsx`, `app/feed/worker-feed-page-client.tsx`,
  `app/donors/use-donors-page-view.tsx`, `app/donors/donor-tasks.tsx`

**Note**: `apps/donor/package.json:34` still declares `@radix-ui/react-tabs`
(verified unused in source — zero imports). It is removed in plan 004, NOT
here. The donor app already imports Tabs from
`@asym/ui/components/shadcn/tabs`.

**Generated-config caveat**: `apps/missionary/.eslint-missionary.json` and
`apps/donor/.eslint-donor.json` embed full source-file snapshots (containing
`asChild`) inside `"source"` fields. These are generated fixtures — do NOT
hand-edit them; leave them alone unless a build step regenerates them.

## Conversion rules

Identical to plans 001/002; abbreviated table — full before/after examples
live in `plans/001-finish-ui-package-consumer-migration.md` §"Conversion
rules", which is committed alongside this plan.

1. **A1** Trigger wrapping `Button`: `<XTrigger asChild><Button …>{kids}</Button></XTrigger>` → `<XTrigger render={<Button … />}>{kids}</XTrigger>`. (DialogTrigger, DialogClose, SheetTrigger/Close, AlertDialogTrigger, DropdownMenuTrigger, PopoverTrigger, TooltipTrigger, CollapsibleTrigger, DrawerTrigger/Close, HoverCardTrigger, ContextMenuTrigger, MenubarTrigger.)
2. **A2** Non-button render target → add `nativeButton={false}`.
3. **A3** `<Button asChild><Link/></Button>` → `<Link className={cn(buttonVariants({...}), "x")}>` (or `render={<Link/>} nativeButton={false}` when Button behavior matters).
4. **A4** `DropdownMenuItem`/`SidebarMenuButton`/`Badge`/`Collapsible`/`BreadcrumbLink`/`Item`: `asChild` → `render={<el />}`.
5. **A5** Selector mapping: `data-[state=open/closed]:` → `data-open:/data-closed:` (content), `aria-expanded:` (menu triggers), `data-panel-open:` (collapsible/accordion triggers); `data-[state=active]:` → `data-active:` (TabsTrigger); `data-[state=checked/unchecked]:` → `data-checked:/data-unchecked:`; `data-[state=on]:` → `data-pressed:`. Keep TanStack-table `data-state=selected` and repo-set sidebar `data-state` untouched.
6. **V1/V2** ToggleGroup/Accordion: `type="single"` → remove prop, values become arrays (`defaultValue={["a"]}`, `value={[v]}`, `onValueChange={(arr) => setV(arr[0] ?? fallback)}`); `type="multiple"` → `multiple`.
7. **V3** Select: `onValueChange` receives `string | null` → guard null.
8. **V4** Checkbox: `"indeterminate"` → separate `indeterminate` boolean prop.
9. **D** Slider handlers receiving `number | number[]` → normalize with `Array.isArray`.
10. Styling on touched lines: semantic tokens only; no `transition-all`; `space-x/y-*` → `gap-*`; button icons get `data-icon`.

## Commands you will need

| Purpose              | Command                                                                  | Expected on success |
| -------------------- | ------------------------------------------------------------------------ | ------------------- |
| Typecheck donor      | `bunx turbo run typecheck --filter=@asym/donor`                          | exit 0              |
| Typecheck missionary | `bunx turbo run typecheck --filter=@asym/missionary-app`                 | exit 0              |
| Lint                 | `bunx turbo run lint --filter=@asym/donor --filter=@asym/missionary-app` | exit 0              |
| Leftover scan        | `rg -n "asChild" apps/donor apps/missionary --glob '!*.json'`            | no matches          |

## Scope

**In scope**: `apps/donor/**` and `apps/missionary/**` `.tsx`/`.ts` source.

**Out of scope** (do NOT touch):

- `packages/**`, `apps/admin/**`
- `apps/donor/package.json`, `apps/missionary/package.json`, lockfile (plan 004)
- `.eslint-donor.json` / `.eslint-missionary.json` generated snapshots
- Checkout/Stripe logic, auth, routes, data loading — UI-API changes only
- `apps/donor/scripts/**` (legal/openpolicy tooling)

## Git workflow

- Branch `claude/naughty-knuth-09f32b`; no commits/pushes unless instructed.

## Steps

### Step 1: apps/donor public pages

Convert `(public)/**` files (rules A1–A4; FAQ page likely has Accordion —
apply V2 if `type=` present).

**Verify**: `rg -c "asChild" "apps/donor/app/(public)" | wc -l` → `0`

### Step 2: apps/donor dashboard + features + components

Convert remaining donor files (incl. `history/columns.tsx` row-action menus,
`QuickGive.tsx`, `legal-page-shell.tsx`). Fix `app/layout.tsx`'s single error
(read it; likely TooltipProvider timing props — rule V5 in plan 002 — or a
provider prop rename).

**Verify**: `bunx turbo run typecheck --filter=@asym/donor` → exit 0

### Step 3: apps/missionary

Convert the 9 files listed in Current state (rules A1–A4; app-sidebar uses
SidebarMenuButton+Link → rule A4; header/footer use Tooltip/DropdownMenu
triggers).

**Verify**: `bunx turbo run typecheck --filter=@asym/missionary-app` → exit 0

### Step 4: selector sweep both apps

`rg -n 'data-\[state=' apps/donor apps/missionary --glob '!*.json'` → convert
per A5 with keep-rules.

**Verify**: re-run grep → only keep-rule matches

### Step 5: lint

**Verify**: `bunx turbo run lint --filter=@asym/donor --filter=@asym/missionary-app` → exit 0

## Test plan

No new tests. Gates: both app typechecks + lint exit 0, scans clean.
Behavioral QA in plan 006 covers donor routes (`/donor-dashboard`,
`/donor-dashboard/wallet`) and missionary routes (`/missionary/feed`,
`/missionary/tasks`, `/missionary/donors`).

## Done criteria

- [ ] `bunx turbo run typecheck --filter=@asym/donor` exits 0
- [ ] `bunx turbo run typecheck --filter=@asym/missionary-app` exits 0
- [ ] `bunx turbo run lint --filter=@asym/donor --filter=@asym/missionary-app` exits 0
- [ ] `rg -n "asChild" apps/donor apps/missionary --glob '!*.json'` → no matches
- [ ] `rg -n 'data-\[state=' apps/donor apps/missionary --glob '!*.json'` → only keep-rule matches
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- A fix appears to require editing `packages/ui` — report the component gap.
- Donor typecheck is dominated by `../../packages/ui/...` errors → plan 001
  isn't done; stop.
- Any change would alter checkout/giving behavior beyond composition (e.g. a
  Select null-guard would change a payment form's semantics) — report it.
- An `asChild` site doesn't match any rule — report file:line.

## Maintenance notes

- Donor FAQ/accordion and any ToggleGroup conversions change value types
  string→array; review their handlers for `arr[0]` unwrapping.
- The `.eslint-*.json` snapshots will still contain `asChild` text after this
  plan; they're generated and excluded from the zero-`asChild` gate via
  `--glob '!*.json'`. If a regeneration command exists, run it in plan 006.
