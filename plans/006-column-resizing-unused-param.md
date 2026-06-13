# Plan 006: Drop the unused `_table` parameter from `useColumnResizing`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report — do not improvise. When done, update
> the status row in `plans/README.md` — unless a reviewer dispatched you and
> said they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat a68fe060..HEAD -- packages/ui/components/shadcn/data-table/hooks/use-column-resizing.tsx tests/unit/packages/ui/data-table-column-resizing.test.tsx`
> On a mismatch with the excerpts below, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `a68fe060`, 2026-06-13

## Why this matters

`useColumnResizing` takes a first parameter `_table: Table<TData>` that it never
uses (underscore-prefixed, referenced nowhere in the body). It forces the hook
to be generic over `TData` purely to type a parameter it ignores, and forces
every caller to thread a table instance the hook does not consume. The hook is
exported public API of `@asym/ui` but has **no internal consumer** — the only
caller in the repo is its own unit test. Removing the dead parameter simplifies
the public signature and the one call site, with no behavior change. (We keep
the hook itself — it is exported, tested public API; this plan trims the wart,
it does not delete the hook.)

## Current state

File: `packages/ui/components/shadcn/data-table/hooks/use-column-resizing.tsx`.

Imports, line 5:

```ts
import type { ColumnSizingState, RowData, Table, Header } from "../tanstack";
```

Signature, lines 52-55:

```ts
export function useColumnResizing<TData extends RowData>(
  _table: Table<TData>,
  options: ColumnResizingOptions = {},
): UseColumnResizingReturn {
```

`_table` and the `<TData extends RowData>` generic exist only for that
parameter. The return type `UseColumnResizingReturn` uses `Header<RowData,
unknown>` (line 21), so it does NOT depend on `TData`.

The only caller is the test
`tests/unit/packages/ui/data-table-column-resizing.test.tsx`:

```tsx
import type { Table } from "../../../../packages/ui/components/shadcn/data-table/tanstack"; // line 3
// ...
const table = {} as Table<Record<string, unknown>>; // line 15

function ColumnSizingProbe() {
  const { columnSizing } = useColumnResizing(table, {
    // line 18
    persistKey: "hydration",
  });
  // ...
}
```

The hook is re-exported (no signature in the export) from:
`packages/ui/components/shadcn/data-table/index.ts` and
`packages/ui/components/shadcn/data-table/hooks/index.ts` — those re-exports
need NO change.

Grep confirms no other caller:
`grep -rn "useColumnResizing" --include=*.ts --include=*.tsx .` (excluding
node_modules) returns only the hook file, the two index re-exports, and the
test.

## Commands you will need

| Purpose                 | Command                                      | Expected on success |
| ----------------------- | -------------------------------------------- | ------------------- |
| Install (worktree only) | `bun install --force`                        | exit 0              |
| Typecheck               | `bunx turbo run typecheck --filter=@asym/ui` | exit 0              |
| Lint                    | `bunx turbo run lint --filter=@asym/ui`      | exit 0              |
| Unit tests (scoped)     | `bunx vitest run tests/unit/packages/ui`     | all pass            |

## Scope

**In scope**:

- `packages/ui/components/shadcn/data-table/hooks/use-column-resizing.tsx`
- `tests/unit/packages/ui/data-table-column-resizing.test.tsx`

**Out of scope**:

- `index.ts` / `hooks/index.ts` re-exports — they export the binding by name; no
  change needed.
- `ColumnResizeHandle` and `getColumnResizingTableOptions` in the same file —
  leave them untouched.
- The hook's body, storage logic, and return shape — unchanged.

## Git workflow

- Shared worktree, branch `advisor/v9-followups`. One commit.
- Suggested message: `refactor(data-table): drop unused table param from useColumnResizing`
- Do NOT push or open a PR.

## Steps

### Step 1: Remove the unused parameter and generic

Change the signature to drop `_table` and the now-unneeded generic:

```ts
export function useColumnResizing(
  options: ColumnResizingOptions = {},
): UseColumnResizingReturn {
```

Then update the import on line 5 to drop the now-unused `Table` (keep
`ColumnSizingState`, `RowData`, `Header` — `RowData` and `Header` are still used
by the return interface):

```ts
import type { ColumnSizingState, RowData, Header } from "../tanstack";
```

**Verify**: `bunx turbo run typecheck --filter=@asym/ui` → exit 0. (If `RowData`
becomes unused after your edit — it should not, it is used at line 21 — the lint
step will catch it.)

### Step 2: Update the one call site in the test

In `data-table-column-resizing.test.tsx`:

- Change the call to `useColumnResizing({ persistKey: "hydration" })` (drop the
  `table` argument).
- Delete the now-unused `const table = {} as Table<...>;` (line 15) and the
  `import type { Table } ...` (line 3).

Keep everything else (the hydration assertion is the point of the test).

**Verify**: `bunx vitest run tests/unit/packages/ui` → all pass, including the
`useColumnResizing` hydration test.

### Step 3: Lint and commit

**Verify**: `bunx turbo run lint --filter=@asym/ui` → exit 0 (no unused-import
or unused-var warnings). Then commit.

## Test plan

- No new test; the existing hydration test in
  `data-table-column-resizing.test.tsx` is updated to the new signature and must
  continue to pass (it proves the SSR-safe persisted-sizing behavior is intact).
- Verification: `bunx vitest run tests/unit/packages/ui` → all pass.

## Done criteria

ALL must hold:

- [ ] `bunx turbo run typecheck --filter=@asym/ui` exits 0
- [ ] `bunx turbo run lint --filter=@asym/ui` exits 0
- [ ] `bunx vitest run tests/unit/packages/ui` exits 0; the column-resizing test
      passes with the updated call
- [ ] `grep -n "_table" packages/ui/components/shadcn/data-table/hooks/use-column-resizing.tsx`
      → no matches
- [ ] `git status` shows ONLY the hook file and its test modified

## STOP conditions

Stop and report if:

- A grep finds a caller of `useColumnResizing` OTHER than the test and the two
  index re-exports — an external consumer would break on the signature change;
  report it instead of proceeding.
- The hook signature doesn't match the excerpt (drift).
- Removing the generic surfaces a type error in the return type (it should not;
  `UseColumnResizingReturn` is non-generic) — report it.

## Maintenance notes

- If a future change actually needs the table inside this hook (e.g. to read
  live column sizes from the engine), re-add a `table` parameter intentionally
  and wire it — do not resurrect an ignored one.
- Reviewer should confirm the two index re-exports still compile (they export by
  name, so they should be unaffected).
