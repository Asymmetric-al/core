# TanStack Integration Guide

This guide documents the project-standard integration for TanStack Query v5, Table v8, DB, and Virtual v3 in this Next.js 16.1.1 monorepo.

## Version Matrix

| Package                          | Version    | Primary workspace(s)               | Role                      |
| -------------------------------- | ---------- | ---------------------------------- | ------------------------- |
| `@tanstack/react-query`          | `^5.90.21` | `packages/database`, apps          | Query state and caching   |
| `@tanstack/react-query-devtools` | `^5.91.3`  | `packages/database`                | Query debugging           |
| `@tanstack/react-table`          | `^8.21.3`  | `packages/ui`, apps                | Headless table state      |
| `@tanstack/react-db`             | `^0.1.72`  | `packages/database`, `packages/ui` | React DB bindings         |
| `@tanstack/query-db-collection`  | `^1.0.25`  | `packages/database`                | Query-backed collections  |
| `@tanstack/db`                   | `^0.5.28`  | `packages/database`                | DB runtime                |
| `@tanstack/react-virtual`        | `^3.13.19` | `packages/ui`                      | Row/list virtualization   |
| `zod`                            | `^4.3.6`   | apps + shared packages             | Runtime schema validation |

## Architecture Boundaries

1. **Server/cache layer (Next.js Cache Components)**  
   Use `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, and `updateTag` only in server-safe code paths.

2. **Data layer (TanStack Query + TanStack DB)**  
   Fetching, optimistic updates, cache invalidation, and collection joins belong here.

3. **View state layer (TanStack Table + TanStack Virtual)**  
   Sorting/filter/pagination/virtualization belong in UI components and should stay decoupled from fetch logic.

4. **Rendering layer (App/UI components)**  
   Components read from Query/DB state and opt into virtualization through the shared API.

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
- Keep `rowCount`/`pageCount` accurate from API responses.

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

### List Usage

For non-table lists, use the same shared hook and point it at the real scroll container:

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

## Quality Checklist

- [ ] Query keys include table/list state that impacts data.
- [ ] Table manual mode aligns with API behavior.
- [ ] DB collection schemas are validated with Zod.
- [ ] New virtualization uses `virtualization` object config.
- [ ] `getItemKey` is stable and uses row/item IDs.
- [ ] Mutations trigger correct cache invalidation path (Query + Next cache tags).
- [ ] Lint/typecheck/unit tests pass on affected workspaces.
