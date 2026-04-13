# TanStack Table v8 — Skill

**Name:** `tanstack-table`  
**Purpose:** Implement type-safe, high-performance TanStack Table flows that align with TanStack Query v5, DB collections, and the shared Virtual foundation in this repo.

## Triggers

Use this skill when:

- Building or refactoring table UIs with `@tanstack/react-table`
- Wiring server-side pagination, sorting, filtering, and URL state
- Integrating table state with TanStack Query v5
- Handling large datasets that need virtualization

Do not use this skill when the UI is not a TanStack Table-based surface.

## Repo-specific standards

- Table package: `@tanstack/react-table@^8.21.3`
- Query package: `@tanstack/react-query@^5.96.2`
- Virtual package: `@tanstack/react-virtual@^3.13.19`
- Shared virtualization API:
  - `VirtualizationConfig` in `packages/ui/components/shadcn/data-table/types.ts`
  - `useDataTableVirtualization` in `packages/ui/components/shadcn/data-table/hooks/use-data-table-virtualization.ts`
- Shared grid export:
  - `@asym/ui/components/shadcn/data-grid`

## Workflow Steps

1. Define explicit table state (`pagination`, `sorting`, `columnFilters`).
2. Decide client mode vs server mode (`manual*` flags).
3. Build Query keys from table state and API params.
4. Ensure response includes `rowCount`/pagination metadata.
5. Use shared virtualization config for large row counts.
6. Validate cache invalidation behavior after mutations.

## Rules

- Memoize `columns` and expensive derived data.
- Keep sorting/filtering owner single-source (client or server, not both).
- In Query v5, prefer `placeholderData: keepPreviousData` for page/sort transitions.
- Use stable item keys for virtualization (`row.id`, not array index).
- Prefer shared `virtualization` object config over legacy fields.
- If a surface is fundamentally tabular, prefer `DataTableResponsive` over a bespoke virtualized list.

## Checklists

### Implementation checklist

- [ ] `columns` and derived transforms are memoized
- [ ] Query key includes relevant table state
- [ ] Server mode uses `manualPagination`/`manualSorting`/`manualFiltering` when needed
- [ ] API returns `rowCount` (or equivalent)
- [ ] Virtualization uses shared API (`virtualization` or shared hook)

### Review checklist

- [ ] No duplicated client+server sorting/filtering
- [ ] Query transitions are smooth (`placeholderData: keepPreviousData`)
- [ ] Stable row keys are used in virtualized renders
- [ ] Selection/actions remain correct while scrolling

## Minimal Example

```tsx
import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";

type Row = { id: string; name: string; amount: number };

export function DonationsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "amount", header: "Amount" },
    ],
    [],
  );

  const query = useQuery({
    queryKey: ["donations", pagination, sorting],
    queryFn: () => fetchDonations({ pagination, sorting }),
    placeholderData: keepPreviousData,
  });

  const table = useReactTable({
    data: query.data?.rows ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    pageCount: query.data
      ? Math.ceil(query.data.rowCount / pagination.pageSize)
      : -1,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableResponsive
      table={table}
      config={{
        virtualization: {
          enabled: true,
          estimateSize: 56,
          overscan: 10,
          containerHeight: 720,
        },
      }}
    />
  );
}
```

## Common pitfalls

- Recreating `columns` every render
- Omitting sorting/filter state from Query keys
- Using legacy Query APIs (`keepPreviousData: true`) instead of v5 pattern
- Rendering very large result sets without virtualization
- Using unstable keys for virtualized items
