# TanStack Integration Guide

This guide documents the project-standard integration for TanStack Query v5, Table v9 (beta), DB, and Virtual v3 in this Next.js 16.2.6 monorepo.

AI agents should pair official TanStack CLI docs/search output with this repo-specific guide. TanStack Intent skills apply only when the current `npx --yes @tanstack/intent@latest list` output returns a matching package; for Query/Table/Router surfaces not returned by Intent, keep using `tanstack doc`, `tanstack search-docs`, this guide, and the virtual foundation guide below. For Table specifically, see [v9 doc sources](#v9-doc-sources) first — tanstack.com still serves v8 docs.

## Version Matrix

| Package                          | Version                | Primary workspace(s)                                           | Role                                    |
| -------------------------------- | ---------------------- | -------------------------------------------------------------- | --------------------------------------- |
| `@tanstack/react-query`          | `^5.96.2`              | `packages/database`, apps                                      | Query state and caching                 |
| `@tanstack/react-table`          | `9.0.0-beta.9` (exact) | `packages/ui`, `packages/database`, `apps/admin`, `apps/donor` | Headless table engine (v9 beta)         |
| `@tanstack/react-table-devtools` | `9.0.0-beta.9` (exact) | `packages/ui`, `apps/admin`                                    | Table devtools adapter/plugin           |
| `@tanstack/react-devtools`       | `^0.10.5`              | `apps/admin`                                                   | TanStack Devtools shell (hosts plugins) |
| `@tanstack/react-db`             | `^0.1.82`              | `packages/database`, `packages/ui`                             | React DB bindings                       |
| `@tanstack/query-db-collection`  | `^1.0.35`              | `packages/database`                                            | Query-backed collections                |
| `@tanstack/db`                   | `^0.6.4`               | `packages/database`                                            | DB runtime                              |
| `@tanstack/react-virtual`        | `^3.13.23`             | `packages/ui`                                                  | Row/list virtualization                 |
| `@tanstack/cli`                  | `^0.63.1`              | repo root (devDependency)                                      | TanStack docs + tooling                 |
| `zod`                            | `^4.3.6`               | apps + shared packages                                         | Runtime schema validation               |

`@tanstack/react-table` and `@tanstack/react-table-devtools` are pinned **exactly** (no caret) in every workspace that consumes them: beta-to-beta releases can include breaking changes, and the exact pin keeps those from arriving silently through a version range. Rationale and rollout history live in `docs/guides/architecture/tanstack-table-v9-decisions.md` (ADR-1).

## Layer Responsibilities

1. **Server/cache layer (Next.js Cache Components)**
   Use `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, and `updateTag` only in server-safe code paths.

2. **TanStack Query — server fetch state.**
   Fetching, retries, cache invalidation, and optimistic mutation flows belong here. Query keys must be serializable and must include every table-state input that affects the response (pagination, sorting, filters) **plus** the `manual*` mode flags, so server-mode and client-mode results never collide in the cache.

3. **TanStack DB — local reactive working sets.**
   Collection joins, live queries, and optimistic staging belong here — but only where multiple surfaces share the same data. A single-screen dataset should stay on plain Query.

4. **TanStack Table — view state.**
   Sorting, filtering, pagination, row selection, and column visibility belong in UI components and stay decoupled from fetch logic. The table engine never owns data freshness.

5. **TanStack Store — per-slice table reactivity.**
   Store is the reactivity engine inside Table v9 (each state slice is an atom). It powers focused subscriptions for table chrome (see below). It is not a general-purpose app store.

6. **TanStack Virtual — rendering only.**
   Virtualization is a client-side rendering optimization. It owns neither view state nor fetch policy. See `docs/guides/development/tanstack-virtual-foundation.md`.

## TanStack Table v9

The shared table layer runs `@tanstack/react-table@9.0.0-beta.9`. The migration kept the public component API stable; the engine-facing changes are concentrated in one boundary module.

### Boundary module (the only engine import)

`packages/ui/components/shadcn/data-table/tanstack.ts` is the **only** file allowed to import `@tanstack/react-table`. Apps and tests import table values/types from `@asym/ui/components/shadcn/data-table/tanstack`; shared UI imports it relatively. Sanctioned exceptions (ADR-3):

- The `packages/database/hooks/*` files import engine-stable **state types** (`SortingState`, `ColumnFiltersState`) directly, because `packages/database` must not depend on `@asym/ui`.
- The `declare module "@tanstack/react-table"` `ColumnMeta` augmentation in `packages/ui/components/shadcn/data-table/types.ts` targets the real package name (declaration merging requires it).
- Table-creating files import `@tanstack/react-table-devtools` directly — it is a devtools adapter, not the engine, so it stays out of the boundary.

Code review should reject any other direct `@tanstack/react-table` import.

The boundary exports everything consumers need:

- **`dataTableFeatures`** — the one explicit `tableFeatures({...})` set (10 features: column faceting, filtering, pinning, resizing, sizing, visibility, global filtering, row pagination, selection, sorting). v9 features are opt-in plugins; `stockFeatures` and `useLegacyTable` are deliberately not used (ADR-2). Adding a capability (e.g. grouping) means adding the feature here — a reviewed boundary change.
- **`SharedTableFeatures`** — `typeof dataTableFeatures`, the feature generic bound into all shared types.
- **`createDataTableRowModels({ filtering, sorting, pagination, faceting })`** — the shared row-model bundle for the v9 `rowModels` option; each flag registers the matching client-side row model (all default `true`).
- **`useTable`, `flexRender`, `useSelector`** — the React entry points. `useSelector` is re-exported from `@tanstack/react-store` (a direct dependency, matching the store version `@tanstack/react-table` itself uses); import it from the boundary, not from the package.
- **v8-named type aliases pre-bound to `SharedTableFeatures`** — `ColumnDef<TData, TValue>`, `Table<TData>`, `Row`, `Cell`, `Column`, `Header`, `HeaderGroup`, `TableOptions`, plus `VisibilityState` (the v8 name for v9's `ColumnVisibilityState`). v9 added `TFeatures` as the first generic parameter on most types; the aliases absorb it so consumer signatures keep the v8 shape, and raw `TFeatures` generics appear nowhere in app code (ADR-4).

### Building a new table on v9

- **Default: use the shared components.** `DataTable` / `DataTableResponsive` (and `DataGrid` for editable grids) are the family entry points; their public props did not change in the v9 migration (`columns`, `data`, `state`, `initialState`, `urlState`, `getRowId`, `config`, …).
- Type columns with `ColumnDef<TData, TValue>` imported from the boundary, never from `@tanstack/react-table`.
- For server-mode tables set `config.manualPagination` / `manualSorting` / `manualFiltering`; the shared components derive the row-model flags from them automatically (`filtering: !manualFiltering`, etc. in `data-table-body.tsx`).
- **Direct `useTable` call sites are rare** (per ADR-4 app code consumes the shared components). If you genuinely need one, pass `features: dataTableFeatures` and `rowModels: createDataTableRowModels({...})`, and make the flags mirror the table's `manual*` flags. The core row model is automatic in v9; only filtered/sorted/paginated/faceted models are registered explicitly.

> **Warning — v9 fails silently on missing row models.** When a row model is not registered, v9 skips that processing stage instead of throwing: the sorted model falls back to the unsorted model, faceted counts return an empty `Map`, and so on. A wrong flag pairing presents as a data bug ("sorting does nothing"), not an error. Registering a model alongside a `manual*` flag is harmless — the runtime checks the manual flag first — so when in doubt, register the model.

### Engine state ownership

Each table state slice has three possible owners, with engine precedence **`options.atoms[key]` > `options.state[key]` > internal base atom**:

1. **Internal (default):** the table owns the slice. Seed defaults with `initialState`.
2. **Controlled:** pass `state.<slice>` plus the matching `on<Slice>Change` handler. The shared components expose this through their `state` / `on*Change` props, unchanged from the v8 era.
3. **External atoms:** pass a writable atom per slice via the v9 `atoms` table option — the preferred v9 ownership when another store must own a slice. The shared components do not currently expose this; it applies to direct `useTable` call sites only.

Reading state:

- **Render reads:** `table.state` — the selected state returned by `useTable` (full table state unless you pass a selector).
- **Imperative reads** (event handlers, effects): `table.atoms.<slice>.get()` for one slice, or `table.store.state` for a full-state snapshot. Do not read `table.store.state` during render.
- **`table.getState()` is gone in v9.**

Component-level ownership rules (which slices to hoist, `urlState`, `getRowId`) are unchanged — see [Shared table state ownership](#shared-table-state-ownership).

### Focused subscriptions for table chrome

v9's `useTable` returns `{ ...instance, options, state }` — a **fresh wrapper object on every render** of the table-owning component. An identity compare of a `table` prop therefore never matches, so a plain `React.memo` around chrome (pagination, action bars, toolbars) never bails out, even though the underlying instance is stable.

The shared pattern (see `packages/ui/components/shadcn/data-table/data-table-chrome-memo.ts`):

1. Memoize chrome with the comparator: `React.memo(Component, areChromeTablePropsInterchangeable)`. The comparator treats two wrappers as interchangeable when they share the same `atoms` map (the atoms are created once per instance and copied by reference into every wrapper) **and** the non-state option inputs feeding chrome's derived reads (`data`, `pageCount`, `rowCount`) are unchanged.
2. Subscribe to exactly the slices the component renders: `useSelector(table.atoms.pagination)`, `useSelector(table.atoms.rowSelection)`, etc.
3. **Never read `table.state` inside a component memoized this way** — once the comparator starts bailing out, the retained wrapper's `.state` snapshot is stale. Read through `useSelector` (or live `table.get*` APIs whose inputs are covered by a subscription or the comparator).

`EMPTY_TABLE_SELECTION_SOURCE` and `getTableSliceAtoms` support minimal table doubles in unit tests (plain objects without atoms); such doubles still render correctly because they re-render with their parent.

### Table devtools

- `DataTable`, `DataTableResponsive`, and `DataGrid` accept an optional **`devtoolsKey`** prop (`DataTableWrapper` forwards it), and `useDataTableWithLiveQuery` accepts the same option. It becomes the table's `key` option — its devtools identity — and gates registration via `useTanStackTableDevtools(table, { enabled: Boolean(devtoolsKey) })`. Omit it (the default) and the table stays unregistered.
- The host shell is mounted **dev-only** in the admin app: `AdminTanStackDevtools` (`apps/admin/app/_providers/tanstack-devtools.tsx`) renders `<TanStackDevtools plugins={[tableDevtoolsPlugin()]} />` from `@tanstack/react-devtools` + `@tanstack/react-table-devtools` and returns `null` in production builds; it is wired into `apps/admin/app/layout.tsx`.
- The adapter's default `.` entry exports no-ops whenever `NODE_ENV !== "development"`, so registration is skipped outside development and `devtoolsKey` values can stay in committed code. Beware the package's `./production` entry: it is the opposite — an always-enabled opt-in that exports the real panel/plugin/hook — so never import it expecting a no-op.
- The beta engine requires the **`@beta`-tagged adapter**: `@tanstack/react-table-devtools` is pinned to the same `9.0.0-beta.9` as the engine. The `latest`-tagged adapter targets v8 instances and cannot read v9's Store-backed state.

### Testing expectations

- The characterization suite in `tests/unit/packages/ui/components/shadcn/` (`data-table-*.test.tsx`) is the **behavior oracle** for the shared table layer. It pins user-visible behavior through public interfaces and gates every engine change — it turns v9's silent row-model fallback into a visible test failure (ADR-2).
- New table features need **behavior-first tests**: extend the characterization suite through the public component API before (or with) the implementation, not engine-internal assertions after the fact.
- Contract tests pin **query-key stability** (e.g. `tests/unit/packages/database/admin-crm-relationships-query-key.test.tsx`, `tests/unit/packages/database/admin-crm-cache-stability-contracts.test.ts`). Table-state-derived query keys are public contracts; changing their shape invalidates caches and must be deliberate.

### v9 doc sources

tanstack.com Table docs and `tanstack search-docs --library table` still index **v8** content. v9 truth for this repo is:

- the [`TanStack/table` `beta` branch](https://github.com/TanStack/table/tree/beta) (the repo's default branch; v9 docs under `docs/`, including the migration guide), and
- the installed package typings under `node_modules` for the exact pinned beta.

Treat v8 docs as migration context only. See the **"TanStack Table v9 (beta) source verification"** rule in `AGENTS.md` and `docs/guides/architecture/tanstack-table-v9-decisions.md` before trusting any Table doc.

## Collection Ownership

- **Real Supabase table collections** live in `packages/database/collections/client-db.ts`.
- **Route-backed admin collections** live in `packages/database/collections/admin-locations.ts`.
- **Mock/demo collections that still need TanStack DB semantics** live in:
  - `packages/database/collections/admin-workspace.ts`
  - `packages/database/collections/donor-history.ts`
- **App code should import hooks from `@asym/database/hooks`** instead of reading app-local mock arrays or stitching browser fetches inline.

## Provider Standard

Use `QueryProvider` at app layout level:

```tsx
import { QueryProvider } from "@asym/database/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
```

## Query + Table Integration Pattern

- Put pagination/sorting/filtering in explicit serializable state.
- Query key must include that state (and the `manual*` flags when a surface can run in both modes).
- For server-mode tables, use `manualPagination`, `manualSorting`, and `manualFiltering`. The shared components skip registering the matching client-side row models automatically; direct `useTable` call sites must mirror the flags themselves (see [Building a new table on v9](#building-a-new-table-on-v9)).
- Prefer `placeholderData: keepPreviousData` in Query v5 for smoother transitions.
- Prefer `rowCount` for server pagination totals; TanStack Table derives `pageCount` from `rowCount` + page size.
- Use `pageCount` only when `rowCount` is unavailable.
- Shared `DataTable`/`DataTableResponsive` treat `rowCount` as authoritative. If both are passed, `pageCount` is ignored and a dev warning is logged.
- Only control the table state your screen actually needs outside the table. Leave noisy internal state internal unless another system depends on it.
- Prefer `initialState` when the screen only needs defaults and not external ownership.
- Pass a stable `getRowId` whenever rows have durable IDs. Row selection, action targeting, and virtualization all depend on stable row identities.
- Use `urlState` only on screens that intentionally deep-link page, sort, filter, search, or column-visibility state.

```tsx
const query = useQuery({
  queryKey: ["donations", pagination, sorting, filters],
  queryFn: () => fetchDonations({ pagination, sorting, filters }),
  placeholderData: keepPreviousData,
});
```

## TanStack DB Collection Pattern

- Define collection schema with Zod.
- Use `queryCollectionOptions` with explicit `queryKey`.
- Keep mutation handlers transactional and error-throwing.
- Prefer `Promise.all` for independent network calls.

```ts
const collection = createCollection<Item>(
  queryCollectionOptions({
    id: "items",
    queryKey: ["items"],
    queryClient: getQueryClient(),
    schema: itemSchema,
    getKey: (item) => item.id,
    queryFn: fetchItems,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(async (mutation) => {
          await updateItem(mutation.key as string, mutation.modified);
        }),
      );
    },
  }),
);
```

## Shared Virtualization Foundation

### Canonical API

Shared API is implemented in:

- `packages/ui/components/shadcn/data-table/hooks/use-data-table-virtualization.ts`
- `packages/ui/components/shadcn/data-table/types.ts` (`VirtualizationConfig`)

```ts
type VirtualizationConfig = {
  enabled?: boolean;
  estimateSize?: number;
  overscan?: number;
  containerHeight?: number | string;
  getItemKey?: (index: number) => string | number;
};
```

### Backward-Compatible Legacy Mapping

| Legacy field                              | Shared field                     |
| ----------------------------------------- | -------------------------------- |
| `enableVirtualization` / `virtualizeRows` | `virtualization.enabled`         |
| `virtualRowHeight` / `rowHeight`          | `virtualization.estimateSize`    |
| `virtualOverscan`                         | `virtualization.overscan`        |
| `virtualContainerHeight` / `maxHeight`    | `virtualization.containerHeight` |

Use `virtualization` for new code. Legacy fields are still accepted for compatibility.

### Toggle Semantics (TanStack Virtual v3)

- `virtualization.enabled` maps directly to TanStack Virtual's `enabled` option.
- Keep `count` as the real row/item length and toggle behavior with `enabled`; do not disable by forcing `count` to `0`.
- `enabled: false` resets virtualizer state (observers, scroll offset, and measurement cache).
- Keep the same `scrollElementRef` mounted regardless of `enabled`; avoid conditional ref attach/detach.
- Treat virtualization mode as stable for one component mount. If toggled at runtime, expect scroll position reset.

### Table/Grid Usage

`DataTable`, `DataTableResponsive`, and `DataGrid` all consume the shared resolver/hook.

```tsx
<DataTableResponsive
  config={{
    virtualization: {
      enabled: true,
      estimateSize: 56,
      overscan: 10,
      containerHeight: 720,
    },
  }}
/>
```

### Shared table state ownership

Shared table primitives now follow one contract:

- `DataTable` and `DataTableResponsive` accept:
  - `state` for selectively controlled `sorting`, `columnFilters`, `pagination`, `rowSelection`, and `columnVisibility`
  - `initialState` for uncontrolled defaults
  - `urlState` for opt-in query-string ownership
  - `getRowId` for stable row identity
- **`searchColumnId` (preferred)** is the TanStack **column id** used for the toolbar search input. The legacy prop **`searchKey`** means the same thing and is deprecated.
- **`DataTableUrlStateConfig.searchKey`** is unrelated: it names the **URL query parameter** for search when using `nuqs` (defaults to `q` inside `useDataTableUrlState`). Use **`searchColumnKey`** (or `searchColumnId` on the table) to choose which column receives that search value.
- **Hooks:** `useDataTableStateCore` holds local table state only (no URL). `useDataTableStateWithUrl` wires `nuqs` and must run inside a component that is mounted only when URL sync is enabled (the table components branch internally for this). **`useDataTableState`** is a deprecated alias for **`useDataTableStateCore`** only; it cannot enable URL sync by itself (Rules of Hooks forbid branching on `urlState` inside one hook).
- **Default row id:** `getDefaultDataTableRowId` matches the fallback used when no `getRowId` is passed to the table.
- **`DataTableWrapper`** delegates to `DataTableResponsive` but merges defaults first: `enableViewToggle: false`, `defaultViewMode: "table"`, and `mobileBreakpoint: 0` so the wrapper stays **table-only** and does not auto-switch to card on narrow viewports. Pass `config` to override (spread order is defaults then `...config`).
- **Remounting:** switching `urlState` from off to on (or the reverse) swaps the inner implementation component and **resets** uncontrolled table state for that mount. Avoid hot-toggling `urlState` if you need to preserve in-memory table state.
- **Pending URL transitions (`nuqs`):** When URL sync is on, `useDataTableStateWithUrl` exposes **`isUrlStatePending`** (mirrors `useDataTableUrlState`’s transition pending flag). `DataTable` / `DataTableResponsive` pass this through as **`urlStatePending`** to **`DataTableToolbar`**, **`DataTableToolbarResponsive`**, and **`DataTablePagination`**. While pending, search inputs, faceted filters, column visibility, reset/export/refresh actions, and pagination controls are **disabled**, and busy regions use **`aria-busy`** where appropriate. That reduces races (e.g. typing or paging ahead of the query string catching up) without changing committed URL semantics.

```tsx
<DataTableResponsive
  columns={columns}
  data={rows}
  getRowId={(row) => row.id}
  searchColumnId="name"
  state={{ sorting, pagination }}
  onSortingChange={setSorting}
  onPaginationChange={setPagination}
  urlState={{
    history: "replace",
    searchColumnKey: "name",
  }}
/>
```

`DataGrid` is a first-class shared export:

- `@asym/ui/components/shadcn/data-grid`
- `@asym/ui/components/shadcn/data-grid/types`

Note: `DataGrid` keeps cell-selection, focus, editing, and undo/redo state in its own React state outside the Table engine; the engine owns only row/column/sort/filter state (ADR-5).

### List Usage

For non-table lists, use the same shared hook and point it at the real scroll container. If a surface is fundamentally tabular, prefer `DataTableResponsive` over a bespoke virtualized list.

```tsx
const viewportRef = React.useRef<HTMLElement | null>(null);

const { virtualizer, virtualItems, totalSize, isEnabled } =
  useDataTableVirtualization({
    count: items.length,
    scrollElementRef: viewportRef,
    virtualization: {
      enabled: items.length > 30,
      estimateSize: 88,
      overscan: 10,
      getItemKey: (index) => items[index]?.id ?? index,
    },
  });
```

## Next.js Cache Components Notes

- Virtualization is **client-side rendering optimization only**.  
  It must not own data freshness policy.
- Keep fetch/cache invalidation decisions in server/data layers:
  - Server read models: `use cache` + `cacheTag`.
  - Mutations: call `revalidateTag`/`updateTag` and invalidate Query keys when needed.
- Do not call request-bound APIs (`cookies`, `headers`, etc.) inside cached scopes.

## Counter Mutation Consistency Pattern

When a mutation writes a reaction row and updates an aggregate counter via RPC, treat it as a two-step flow that must remain logically atomic for end users:

1. Write the relation row (`post_likes` / `post_prayers` / `post_fires`)
2. Update aggregate counter RPC (`increment_*` / `decrement_*`)
3. If step 2 fails, execute a compensating write:
   - POST-style add flow: remove inserted relation row
   - DELETE-style remove flow: restore deleted relation row

This preserves count consistency without requiring route-level SQL transactions and keeps behavior aligned across REST and GraphQL mutation paths.

## Quality Checklist

- [ ] No new direct `@tanstack/react-table` imports outside the boundary module (sanctioned exceptions only).
- [ ] Direct `useTable` call sites mirror `manual*` flags in `createDataTableRowModels` flags.
- [ ] Memoized table chrome reads state via `useSelector(table.atoms.<slice>)`, never `table.state`.
- [ ] Query keys include table/list state that impacts data.
- [ ] Table manual mode aligns with API behavior.
- [ ] Only externally controlled state slices are hoisted.
- [ ] Stable `getRowId` is provided for durable records.
- [ ] DB collection schemas are validated with Zod.
- [ ] New virtualization uses `virtualization` object config.
- [ ] `getItemKey` is stable and uses row/item IDs.
- [ ] Mutations trigger correct cache invalidation path (Query + Next cache tags).
- [ ] Counter RPC mutation flows include compensating writes on partial failure.
- [ ] URL-backed tables: expect toolbar/pagination to disable while `isUrlStatePending` is true.
- [ ] New/changed table behavior is covered by the characterization suite.
- [ ] Lint/typecheck/unit tests pass on affected workspaces.

## Latest Docs + Release Validation

- TanStack DB docs: `https://tanstack.com/db/latest`
- TanStack Virtual docs: `https://tanstack.com/virtual/latest`
- TanStack Table: tanstack.com still indexes **v8** — use the [v9 doc sources](#v9-doc-sources) above for Table work.
- Version truth for this repo is pinned via workspace `package.json` plus npm dist-tags (`npm view @tanstack/* version dist-tags`).
- TanStack CLI is installed at the repo root to support `tanstack doc` / `tanstack search-docs` for future upgrade checks.
