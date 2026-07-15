# Plan 001: Action bar and floating bar re-render and re-derive when filters change

> ⛔ **REJECTED on 2026-06-13 after verification — do NOT execute.** The
> underlying audit finding is invalid for `@tanstack/react-table@9.0.0-beta.9`:
> `table_getFilteredSelectedRowModel` builds from `getCoreRowModel()`, not the
> filtered model, so the action bars' selected count never changes when a filter
> hides a selected row. The "stale count" bug cannot occur and the proposed
> subscriptions only add redundant re-renders. See `plans/README.md` → "001 —
> REJECTED" for the engine evidence and the empirical diagnostic. Retained as a
> record only.

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- packages/ui/components/shadcn/data-table/data-table-action-bar.tsx packages/ui/components/shadcn/data-table/data-table-floating-bar.tsx packages/ui/components/shadcn/data-table/data-table-pagination.tsx packages/ui/components/shadcn/data-table/data-table-chrome-memo.ts`
> If any in-scope file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

The shared data-table's selection action bars (`DataTableActionBar`, used by
`DataTable`; `DataTableFloatingBar`, used by `DataTableResponsive`) are
memoized with a comparator that bails out of parent-driven re-renders, and they
subscribe to **only** the `rowSelection` table-state slice. But both render a
**filter-derived** value: `table.getFilteredSelectedRowModel().rows`. When the
user has rows selected and then changes a column filter or the search box so a
selected row is filtered out, nothing tells the bar to re-render — the
comparator treats the table prop as interchangeable (same atoms, same
`options.data`) and no filter subscription fires. The bar keeps showing a stale
selected-row count, fails to disappear when the visible selection drops to
zero, and — most seriously — its bulk-action callbacks (`onClick(rows)` for
Archive/Delete/etc.) receive `selectedOriginalRows` captured at the stale
render, i.e. rows the user can no longer see. Before the v9 migration this
could not happen because the bars re-rendered with their parent on every state
change.

The sibling component `DataTablePagination` already does this correctly — it
subscribes to `columnFilters` and `globalFilter` precisely because it reads
filter-derived counts. This plan brings the two action bars to parity.

## Current state

Files:

- `packages/ui/components/shadcn/data-table/data-table-action-bar.tsx` — the
  bar rendered under `DataTable`; subscribes only to `rowSelection`.
- `packages/ui/components/shadcn/data-table/data-table-floating-bar.tsx` — the
  bar rendered under `DataTableResponsive`; same defect.
- `packages/ui/components/shadcn/data-table/data-table-pagination.tsx` — the
  **exemplar** that already subscribes to the filter slices. Match this pattern.
- `packages/ui/components/shadcn/data-table/data-table-chrome-memo.ts` —
  defines `getTableSliceAtoms`, `EMPTY_TABLE_SELECTION_SOURCE`, and the
  `areChromeTablePropsInterchangeable` comparator (do not change it).

The exemplar pattern, from `data-table-pagination.tsx:59-84`:

```tsx
const atoms = getTableSliceAtoms(table);

const paginationSource: TableSelectionSource<PaginationState | undefined> =
  atoms?.pagination ?? EMPTY_TABLE_SELECTION_SOURCE;
const subscribedPagination = useSelector(paginationSource);

// ...row selection source...

// The filtered row count and page count are derived through the filtered
// row model, so filter-state changes must re-render this chrome too. Data
// changes are covered by the memo comparator (`options.data` identity).
const columnFiltersSource: TableSelectionSource<
  ColumnFiltersState | undefined
> = atoms?.columnFilters ?? EMPTY_TABLE_SELECTION_SOURCE;
useSelector(columnFiltersSource);
const globalFilterSource: TableSelectionSource<unknown> =
  atoms?.globalFilter ?? EMPTY_TABLE_SELECTION_SOURCE;
useSelector(globalFilterSource);
```

The action bar's current subscription block, `data-table-action-bar.tsx:44-51`:

```tsx
// Focused subscription: row selection is the only table state this bar
// renders. The memo comparator below keeps parent broadcasts out; selected
// rows and the count re-derive from the live row model on each change.
const atoms = getTableSliceAtoms(table);
const rowSelectionSource: TableSelectionSource<RowSelectionState | undefined> =
  atoms?.rowSelection ?? EMPTY_TABLE_SELECTION_SOURCE;
useSelector(rowSelectionSource);

const selectedRows = table.getFilteredSelectedRowModel().rows;
```

The floating bar has an identical block at `data-table-floating-bar.tsx:53-59`.

Both files already import `useSelector` from `./tanstack` and `getTableSliceAtoms`,
`EMPTY_TABLE_SELECTION_SOURCE` from `./data-table-chrome-memo`. You will need to
add the `ColumnFiltersState` type import (and the existing `RowSelectionState`,
`TableSelectionSource` imports stay).

Repo conventions: this is `@asym/ui` shared UI. Comments explain _why_ (see the
density in the exemplar). Follow `docs/ai/rules/frontend.md` and the v9
subscription rules in `docs/guides/development/tanstack-integration.md`
("Memoized table chrome reads state via `useSelector(table.atoms.<slice>)`,
never `table.state`"). Do NOT read `table.state` in these components.

## Commands you will need

| Purpose                 | Command                                      | Expected on success                                            |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| Install (worktree only) | `bun install --force`                        | exit 0 (use `--force`: Bun isolated-linker quirk on this repo) |
| Typecheck               | `bunx turbo run typecheck --filter=@asym/ui` | exit 0, no errors                                              |
| Lint                    | `bunx turbo run lint --filter=@asym/ui`      | exit 0                                                         |
| Unit tests (scoped)     | `bunx vitest run tests/unit/packages/ui`     | all pass, including new test                                   |

If the full `vitest` run flakes with shifting timeouts, prefix with
`VITEST_MAX_WORKERS=4` (known machine quirk).

## Suggested executor toolkit

- Invoke the `vercel-react-best-practices` skill if available — this is a
  `useSyncExternalStore`-backed subscription correctness fix, exactly its domain.
- Read `docs/guides/development/tanstack-integration.md` section "Memoized
  table chrome" before editing.

## Scope

**In scope** (the only files you should modify):

- `packages/ui/components/shadcn/data-table/data-table-action-bar.tsx`
- `packages/ui/components/shadcn/data-table/data-table-floating-bar.tsx`
- `tests/unit/packages/ui/components/shadcn/data-table-subscriptions.test.tsx`
  (extend — add new test cases; do not delete existing ones)

**Out of scope** (do NOT touch):

- `data-table-chrome-memo.ts` — the comparator is correct as-is; the fix is
  adding subscriptions, not changing the bail-out logic.
- `data-table-pagination.tsx` — it is the exemplar; it already works.
- The public props of either bar — no signature changes.

## Git workflow

- You are working in a shared worktree on branch `advisor/v9-followups`.
- One commit for this plan; Conventional Commits style. Example from this repo's
  log: `fix(data-table): apply exact-match filterFn to faceted multi-select columns`.
- Suggested message: `fix(data-table): subscribe selection bars to filter state`
- Do NOT push or open a PR.

## Steps

### Step 1: Add filter subscriptions to the action bar

In `data-table-action-bar.tsx`, after the existing `rowSelection` subscription
(line ~48) and before `const selectedRows = ...`, add `columnFilters` and
`globalFilter` subscriptions mirroring the pagination exemplar:

```tsx
// The selected-row count is derived through the filtered row model, so
// filter-state changes must re-render this bar too — otherwise a selected
// row that gets filtered out leaves a stale count and stale action payload.
const columnFiltersSource: TableSelectionSource<
  ColumnFiltersState | undefined
> = atoms?.columnFilters ?? EMPTY_TABLE_SELECTION_SOURCE;
useSelector(columnFiltersSource);
const globalFilterSource: TableSelectionSource<unknown> =
  atoms?.globalFilter ?? EMPTY_TABLE_SELECTION_SOURCE;
useSelector(globalFilterSource);
```

Add `ColumnFiltersState` to the existing `import type { ... } from "./tanstack"`
block.

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0.

### Step 2: Add the same subscriptions to the floating bar

Apply the identical change to `data-table-floating-bar.tsx` (after its
`rowSelection` subscription at line ~57). Add `ColumnFiltersState` to its
`import type { ... } from "./tanstack"` block.

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0.

### Step 3: Add a regression test

Extend `tests/unit/packages/ui/components/shadcn/data-table-subscriptions.test.tsx`.
Model the new test on the existing `PaginationProbeHarness` pattern in that file
(a real `useTable` with externally controlled state). Build a harness that:

1. Renders `DataTableActionBar` with a real `useTable` instance (features
   `dataTableFeatures`, row models from `createDataTableRowModels`), seeded data
   of ~4 rows, `enableRowSelection: true`, and externally controlled
   `rowSelection` + `columnFilters` state.
2. Selects one row (set `rowSelection` to `{ <rowId>: true }`), asserts the bar
   shows the selected count (e.g. `screen.getByText("1")` / "selected").
3. Applies a `columnFilters` value that excludes the selected row, then asserts
   the bar updates: the filtered-selected count drops and, if it reaches zero,
   the bar unmounts (`screen.queryByText("selected")` is null).

The key assertion is that the bar reacts to the **filter** change while the
rowSelection slice is unchanged — that is the bug being fixed. The existing
`data-table-action-bars.test.tsx` uses minimal table doubles **without atoms**,
so it cannot catch this; you must use a real `useTable` table as the
subscription source.

**Verify**: `bunx vitest run tests/unit/packages/ui` → all pass; your new
case(s) appear in the count. Confirm the test FAILS if you temporarily revert
Step 1 (sanity-check it actually exercises the bug), then restore Step 1.

### Step 4: Lint and commit

**Verify**: `bunx turbo run lint --filter=@asym/ui` → exit 0. Then commit per
the git workflow.

## Test plan

- New test(s) in `data-table-subscriptions.test.tsx`:
  - action bar reflects a reduced filtered-selected count after a filter change
    while a row remains selected;
  - action bar unmounts when the filter excludes all selected rows.
- Structural pattern: `PaginationProbeHarness` in the same file.
- Verification: `bunx vitest run tests/unit/packages/ui` → all pass including
  the new cases.

## Done criteria

ALL must hold:

- [ ] `bunx turbo run typecheck --filter=@asym/ui` exits 0
- [ ] `bunx turbo run lint --filter=@asym/ui` exits 0
- [ ] `bunx vitest run tests/unit/packages/ui` exits 0; new filter-subscription
      test(s) exist and pass
- [ ] `data-table-action-bar.tsx` and `data-table-floating-bar.tsx` each contain
      `atoms?.columnFilters` and `atoms?.globalFilter` subscriptions
- [ ] Neither bar reads `table.state` (grep for `table.state` in both files →
      no matches)
- [ ] No files outside the in-scope list are modified (`git status`)

## STOP conditions

Stop and report (do not improvise) if:

- The "Current state" excerpts don't match the live code (drift since `a68fe060`).
- The action bars no longer use `getTableSliceAtoms` / `useSelector` (the
  subscription architecture was changed).
- Adding the subscriptions causes a hooks-order lint error you cannot resolve by
  matching the pagination component's hook ordering.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a new filter mechanism is added (e.g. a faceted/global filter slice beyond
  `columnFilters`/`globalFilter`), any chrome that reads
  `getFilteredSelectedRowModel`/`getFilteredRowModel` must subscribe to it too.
  The rule: a memoized chrome component must subscribe to **every** slice its
  rendered output derives from.
- Reviewer should scrutinize that the new test uses a real `useTable` source
  (with atoms), not a minimal double — a double-based test would pass without
  proving anything.
