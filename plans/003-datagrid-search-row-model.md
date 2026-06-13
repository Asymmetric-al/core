# Plan 003: Register the filtered row model when DataGrid search is enabled

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report — do not improvise. When done, update
> the status row in `plans/README.md` — unless a reviewer dispatched you and
> said they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- packages/ui/components/shadcn/data-grid/data-grid.tsx`
> On a mismatch with the "Current state" excerpt, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

`DataGrid` exposes a `globalFilter` search box gated by its `enableSearch`
config flag (default `true`), but it only registers the **filtered** row model
when `enableFilter` is true. In v9, global filtering runs through the filtered
row model; if that model is not registered, v9 **silently skips** the filtering
stage (it does not throw — this is exactly the silent-degradation failure mode
ADR-2 warns about). So with the common config `enableSearch: true,
enableFilter: false`, the search box renders and accepts input, the
`globalFilter` state updates, but the grid rows never actually filter — a dead
search box that looks functional. This plan ties the filtered row model to
"filtering OR search is on" so the search box always works when shown.

## Current state

File: `packages/ui/components/shadcn/data-grid/data-grid.tsx`.

Config defaults, `data-grid.tsx:549-551`:

```ts
    enableSearch = true,
    enableFilter = true,
    enableSort = true,
```

The `useTable` row-model registration, `data-grid.tsx:742-762`:

```ts
const table = useTable({
  features: dataTableFeatures,
  // Mirrors the v8 setup: only filtering and sorting row models, and only
  // when their grid config flags are on (the core row model is automatic).
  rowModels: createDataTableRowModels<TData>({
    filtering: enableFilter,
    sorting: enableSort,
    pagination: false,
    faceting: false,
  }),
  data: gridData,
  columns: tableColumns,
  // Devtools identity: registration is skipped unless a key exists.
  key: devtoolsKey,
  state: {
    sorting,
    globalFilter,
  },
  onSortingChange: setSorting,
  onGlobalFilterChange: setGlobalFilter,
});
```

`createDataTableRowModels({ filtering })` registers `filteredRowModel`
(`packages/ui/components/shadcn/data-table/tanstack.ts:107-146`); the global
filter uses that same filtered row model.

Repo conventions: keep the explanatory comment accurate after the change.
Follow `docs/guides/architecture/tanstack-table-v9-decisions.md` ADR-2 (the
row-model flags must mirror what the table actually uses — here, search uses
filtering).

## Commands you will need

| Purpose                 | Command                                      | Expected on success          |
| ----------------------- | -------------------------------------------- | ---------------------------- |
| Install (worktree only) | `bun install --force`                        | exit 0                       |
| Typecheck               | `bunx turbo run typecheck --filter=@asym/ui` | exit 0                       |
| Lint                    | `bunx turbo run lint --filter=@asym/ui`      | exit 0                       |
| Unit tests (scoped)     | `bunx vitest run tests/unit/packages/ui`     | all pass, including new test |

## Scope

**In scope**:

- `packages/ui/components/shadcn/data-grid/data-grid.tsx`
- `tests/unit/packages/ui/data-grid-search-filtering.test.tsx` (create) — see
  Test plan for the lighter alternative if a full render is infeasible.

**Out of scope**:

- The DataGrid editing/undo/redo state machine (`data-grid.tsx` keeps cell
  editing outside the engine per ADR-5) — do not touch it.
- The `enableSort`/`enableFilter`/`enableSearch` default values.

## Git workflow

- Shared worktree, branch `advisor/v9-followups`. One commit.
- Suggested message: `fix(data-grid): register filter row model when search is enabled`
- Do NOT push or open a PR.

## Steps

### Step 1: Tie the filtered row model to search OR filter

In the `useTable` call, change the `filtering` flag so the filtered row model is
registered whenever filtering **or** search is active, and update the comment:

```ts
    // Mirrors the v8 setup: sorting + filtering row models, gated by their grid
    // config flags. The global search box runs through the FILTERED row model,
    // so register it when search is on too — v9 silently no-ops filtering when
    // the model is absent (ADR-2).
    rowModels: createDataTableRowModels<TData>({
      filtering: enableFilter || enableSearch,
      sorting: enableSort,
      pagination: false,
      faceting: false,
    }),
```

`enableSearch` and `enableFilter` are both in scope at this point
(destructured at `data-grid.tsx:549-551`).

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0.

### Step 2: Add a test proving search filters rows

Create `tests/unit/packages/ui/data-grid-search-filtering.test.tsx`
(`/** @vitest-environment jsdom */`). Render `DataGrid` with
`config={{ enableSearch: true, enableFilter: false }}`, a few rows, and a
column. Drive the search input (the toolbar `Input` with placeholder
`"Search..."`, see `DataGridToolbar` at `data-grid.tsx:110-118`) to a term that
matches only one row, then assert only the matching row renders.

Model the render/setup (jsdom globals like `ResizeObserver`, `matchMedia`,
`scrollIntoView`) on the `beforeAll` block in
`tests/unit/packages/ui/components/shadcn/data-table-subscriptions.test.tsx`.

If a full `DataGrid` render proves too heavy to stabilize in jsdom (virtualized
rows, motion), fall back to a **focused** test: assert that with
`enableSearch: true, enableFilter: false`, a `useTable` built the same way as
`data-grid.tsx` (features + `createDataTableRowModels({ filtering: true,
sorting: false, pagination: false, faceting: false })`) plus a `globalFilter`
state value actually reduces `table.getRowModel().rows`. Document in the test
file's top comment which approach you took and why. Either way the test must
FAIL against the pre-fix flag (`filtering: enableFilter` → `false`).

**Verify**: `bunx vitest run tests/unit/packages/ui` → all pass; confirm the
test fails if you temporarily revert Step 1, then restore it.

### Step 3: Lint and commit

**Verify**: `bunx turbo run lint --filter=@asym/ui` → exit 0. Commit.

## Test plan

- New `data-grid-search-filtering.test.tsx`: with search on and column-filter
  off, a search term filters the visible rows (full render preferred; focused
  `useTable` row-model test acceptable fallback, documented in-file).
- Structural pattern: jsdom setup from `data-table-subscriptions.test.tsx`.
- Verification: `bunx vitest run tests/unit/packages/ui` → all pass.

## Done criteria

ALL must hold:

- [ ] `bunx turbo run typecheck --filter=@asym/ui` exits 0
- [ ] `bunx turbo run lint --filter=@asym/ui` exits 0
- [ ] `bunx vitest run tests/unit/packages/ui` exits 0; new search-filtering
      test exists and passes
- [ ] `data-grid.tsx` registers the filtered row model via
      `filtering: enableFilter || enableSearch`
- [ ] No files outside the in-scope list are modified (`git status`)

## STOP conditions

Stop and report if:

- The `useTable`/`createDataTableRowModels` block doesn't match the excerpt
  (drift).
- Neither a full render nor the focused `useTable` fallback can be made to
  demonstrate the filtering behavior — report what you tried.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If DataGrid ever adds column-level filtering UI distinct from global search,
  re-confirm both still resolve through the registered filtered row model.
- Reviewer should check the test genuinely fails on the old flag value — it is
  the only guard against the silent v9 fallback regressing again.
