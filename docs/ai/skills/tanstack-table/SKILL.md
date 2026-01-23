# TanStack Table v8 — Skill

**Name:** `tanstack-table`
**Purpose:** Build type-safe, performant tables with TanStack Table v8, including server-side state.
Use this skill for pagination, sorting, filtering, and large datasets.

**Applies when:** Using TanStack Table v8 or integrating with TanStack Query.
**Do not use when:** Tables are not built with TanStack Table.

## Rules

- **Stabilize inputs:** Memoize `columns` and derived `data`.
- **Choose client vs server mode:** Use manual server mode for large datasets.
- **Query key = table state:** Include pagination, sorting, and filters.
- **URL sync (optional):** Encode table state in search params for shareable links.
- **Virtualize big tables:** Use TanStack Virtual for 1000+ rows.

## Workflow

1. Declare the table state model (pagination, sorting, filters).
2. Decide client vs server responsibility.
3. Make the query key match table state.
4. Ensure API responses include `rowCount`.
5. Add virtualization when row count is large.

## Checklists

### Implementation checklist

- [ ] `columns` is memoized
- [ ] Table state is explicit and serializable
- [ ] Server-side mode uses `manual*` flags
- [ ] API contract includes `rowCount`

### Review checklist

- [ ] Query keys include sorting/filter state
- [ ] `pageCount`/`rowCount` is correct
- [ ] Virtualization used when needed

## Minimal example

### Server-side table with TanStack Query

```tsx
import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

type Row = { id: string; name: string; createdAt: string };

async function fetchRows(params: {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.pageIndex));
  sp.set("pageSize", String(params.pageSize));
  sp.set("sort", JSON.stringify(params.sorting));
  const res = await fetch(`/api/rows?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to load rows");
  return (await res.json()) as { rows: Row[]; rowCount: number };
}

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "createdAt", header: "Created" },
    ],
    [],
  );

  const query = useQuery({
    queryKey: ["rows", pagination, sorting],
    queryFn: () => fetchRows({ ...pagination, sorting }),
    keepPreviousData: true,
  });

  const table = useReactTable({
    data: query.data?.rows ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    pageCount: query.data
      ? Math.ceil(query.data.rowCount / pagination.pageSize)
      : -1,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} onClick={h.column.getToggleSortingHandler?.()}>
                {String(h.column.columnDef.header)}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((r) => (
          <tr key={r.id}>
            {r.getVisibleCells().map((c) => (
              <td key={c.id}>{String(c.getValue())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Common mistakes / pitfalls

- Recreating `columns` on every render
- Missing `pageCount` in server-side pagination
- Query keys that omit sorting/filter state
- Sorting/filtering on both client and server
- Rendering thousands of rows without virtualization
