# TanStack Integration Guide

This guide documents the project-standard integration for TanStack Query v5, Table v8, DB, and Virtual v3 in this Next.js 16.2.1 monorepo.

## Version Matrix

| Package                         | Version    | Primary workspace(s)               | Role                      |
| ------------------------------- | ---------- | ---------------------------------- | ------------------------- |
| `@tanstack/react-query`         | `^5.96.2`  | `packages/database`, apps          | Query state and caching   |
| `@tanstack/react-table`         | `^8.21.3`  | `packages/ui`, apps                | Headless table state      |
| `@tanstack/react-db`            | `^0.1.80`  | `packages/database`, `packages/ui` | React DB bindings         |
| `@tanstack/query-db-collection` | `^1.0.33`  | `packages/database`                | Query-backed collections  |
| `@tanstack/db`                  | `^0.6.2`   | `packages/database`                | DB runtime                |
| `@tanstack/react-virtual`       | `^3.13.23` | `packages/ui`                      | Row/list virtualization   |
| `zod`                           | `^4.3.6`   | apps + shared packages             | Runtime schema validation |

## Architecture Boundaries

1. **Server/cache layer (Next.js Cache Components)**  
   Use `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, and `updateTag` only in server-safe code paths.

2. **Data layer (TanStack Query + TanStack DB)**  
   Fetching, optimistic updates, cache invalidation, and collection joins belong here.

3. **View state layer (TanStack Table + TanStack Virtual)**  
   Sorting/filter/pagination/virtualization belong in UI components and should stay decoupled from fetch logic.

4. **Rendering layer (App/UI components)**  
   Components read from Query/DB state and opt into virtualization through the shared API.

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
- Query key must include that state.
- For server-mode tables, use `manualPagination`, `manualSorting`, and `manualFiltering`.
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
- [ ] Lint/typecheck/unit tests pass on affected workspaces.
