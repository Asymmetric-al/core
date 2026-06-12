# TanStack Table v9 — Architecture Decision Records

Status legend: **Accepted** decisions are in effect; **Proposed** decisions are
expected but not yet implemented. Keep this file updated as the v9 rollout
progresses. Source-of-truth order still applies (`openspec/` > rulebooks >
this document).

---

## ADR-1: Adopt TanStack Table v9 while still in beta

**Status:** Accepted (2026-06-12)

**Decision:** Migrate the shared table layer and all app tables from
`@tanstack/react-table` 8.21.3 to `9.0.0-beta.9`, pinned **exactly** (no caret)
in every workspace that consumes it (`apps/admin`, `apps/donor`,
`packages/ui`, `packages/database`).

**Why:**

- v9 features are tree-shakeable plugins; the v8 engine bundles every feature
  into every table (~15–20kb vs ~6–7kb for small tables).
- v9 state is rebuilt on TanStack Store with per-slice atoms, enabling
  fine-grained subscriptions (`table.Subscribe`, `table.atoms.<slice>`) that
  fix the v8 whole-table rerender model our largest tables suffer from.
- `createTableHook` / `tableOptions` give an official pattern for the internal
  table families this repo wants, replacing ad-hoc wrapper growth.

**Beta risk and how it is managed:**

- Exact version pin — beta-to-beta breaking changes (e.g. the current
  `setcolumnResizing` casing quirk) cannot arrive silently via a range.
- A 31-test characterization suite
  (`tests/unit/packages/ui/components/shadcn/data-table-*.test.tsx`) pins
  user-visible v8 behavior through public interfaces and gates every engine
  change.
- All TanStack Table imports flow through one boundary module
  (`packages/ui/components/shadcn/data-table/tanstack.ts`), so engine API
  churn is absorbed in one file, not 50.
- v9 docs live on the `beta` branch of `TanStack/table` (the repo default
  branch). tanstack.com Table docs still describe v8 — see the AGENTS.md
  "TanStack Table v9 (beta) source verification" rule before trusting any
  Table doc.

**Consequences:** stable-release upgrade later should be a version bump plus a
review of beta-era spellings; until then, contributors must verify Table API
questions against the installed package typings or the beta branch docs.

---

## ADR-2: No `stockFeatures` and no `useLegacyTable` as defaults

**Status:** Accepted (2026-06-12)

**Decision:** The shared table layer registers an **explicit** feature set via
`tableFeatures({...})` containing only what the shared components actually
support. `stockFeatures` (all features, v8-sized bundle) and `useLegacyTable`
(deprecated v8-compat hook) are not used anywhere, including as transitional
bridges.

**Why:**

- `useLegacyTable` would have forced touching every consumer file twice
  (v8 names → `Legacy*` names → v9 names), ships a bundle _larger_ than v8
  (all features, each grown since v8), keeps v8's whole-state rerendering, and
  cannot be used with `createTableHook`.
- The boundary-module strategy (ADR-1) made a direct cutover safe: type
  aliases in `tanstack.ts` keep v8-compatible names (`ColumnDef<TData,
TValue>` etc.) bound to the shared feature set, so consumer files compiled
  unchanged on flag day.
- v9 silently degrades when a feature/row model is missing (e.g.
  `getSortedRowModel()` falls back to the unsorted model instead of throwing;
  faceted counts return an empty `Map`). An explicit, curated feature set plus
  the characterization suite turns that silent failure mode into a visible
  test failure.

**Consequences:** adding a new table capability (e.g. grouping, pinning) means
adding the feature to the relevant feature set in `tanstack.ts` — a deliberate,
reviewed act rather than an implicit always-on default.

---

## ADR-3: Single boundary module for the table engine

**Status:** Accepted (2026-06-12)

**Decision:** `packages/ui/components/shadcn/data-table/tanstack.ts` is the
only place allowed to import `@tanstack/react-table`. Apps and tests import
table values/types from `@asym/ui/components/shadcn/data-table/tanstack`;
shared UI imports it relatively. Two sanctioned exceptions: the four
`packages/database/hooks/*` files import engine-stable state types directly
(`packages/database` must not depend on `@asym/ui`), and the `ColumnMeta`
module augmentation in `data-table/types.ts` targets the real package name
(declaration merging requires it).

**Why:** the v8→v9 audit found 53 files importing the engine directly; routing
them through one module reduced the flag-day diff to the boundary plus the
engine call sites, and keeps future engine churn (v9 stable, v10) contained.

**Consequences:** lint/code review should reject new direct
`@tanstack/react-table` imports outside the boundary and the sanctioned
exceptions.

---

## ADR-4: Internal table families via `createTableHook`

**Status:** Proposed

**Decision (expected):** expose per-family feature sets and row-model bundles
(basic, admin, responsive-admin, CRM, support-inbox, data-grid, virtualized)
from the shared layer, built on v9 `tableOptions()` /`createTableHook` rather
than additional bespoke wrappers. App code consumes family hooks/aliases and
does not thread raw v9 generics (`TFeatures`) through screens.

**Open until implemented:** exact family list and whether `DataTable` /
`DataTableResponsive` accept feature overrides per instance.

---

## ADR-5: DataGrid interaction state stays outside the Table engine

**Status:** Proposed

**Decision (expected):** the editable DataGrid keeps cell-selection, focus,
editing, and undo/redo state in its own store outside TanStack Table; the
Table engine owns only row/column/sort/filter state. Rationale: v9 has no
cell-editing feature; coupling editing state to engine state would couple
undo/redo to engine internals that change between majors.
