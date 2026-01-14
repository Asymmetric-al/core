---
name: tanstack-table
description: Use this skill when building **headless tables** with **TanStack Table v8**, especially: server-side pagination/filtering/sorting, TanStack Query integration, large datasets + virtualization citeturn4view0.
---

# TanStack Table v8 — Skill

**Name:** `tanstack-table`

Use this skill when building **headless tables** with **TanStack Table v8**, especially:
- server-side pagination/filtering/sorting
- TanStack Query integration
- large datasets + virtualization citeturn4view0

---

## Goal

Build **type-safe**, **predictable**, and **performant** tables.

Priorities:
1. Correct state model (pagination/sorting/filters)
2. Correct server ↔ client contract (query params)
3. Avoid infinite re-renders / unstable inputs
4. Virtualize when needed

---

## Core principles

### 1) Stabilize everything
- Memoize `columns` and any derived `data`
- Avoid recreating table options each render

### 2) Decide: client vs server state
- Small datasets → client-side sorting/filtering
- Large datasets / backend source-of-truth → **manual** server-side mode:
  - `manualPagination: true`
  - `manualSorting: true`
  - `manualFiltering: true`

### 3) Query key = table state
When using TanStack Query:
- query key must include `pageIndex`, `pageSize`, `sorting`, `columnFilters`, `globalFilter`
- keep a single source of truth (URL or React state), then derive the other

### 4) URL sync (optional, but recommended)
- Encode table state into search params for shareable links
- Debounce filter updates before hitting the API

### 5) Virtualize big tables
- If 1000+ rows rendered, use TanStack Virtual
- Virtualize **rows**, keep header/sticky UI outside the virtualized list

---

## Common mistakes to prevent

- Passing new `columns` array each render (breaks memoization)
- Forgetting to set `pageCount` in server-side pagination
- Query key missing `sorting`/`filters` (stale data)
- Sorting/filtering done both client-side and server-side
- Rendering thousands of rows without virtualization citeturn4view0

---

## Review checklist

- [ ] `columns` is memoized
- [ ] table state is explicit and serializable
- [ ] server-side modes use `manual*` flags
- [ ] API contract matches table state (params + response)
- [ ] `pageCount` / `rowCount` is correct
- [ ] virtualization used when row count is large

---

## Minimal example (server-side with TanStack Query)

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

  const columns = React.useMemo<ColumnDef<Row>[]>(() => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "createdAt", header: "Created" },
  ], []);

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
    pageCount: query.data ? Math.ceil(query.data.rowCount / pagination.pageSize) : -1,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="text-sm text-muted-foreground">
        {query.isFetching ? "Loading…" : null}
      </div>
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id} onClick={h.column.getToggleSortingHandler?.()}>
                  {String(h.column.columnDef.header)}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(r => (
            <tr key={r.id}>
              {r.getVisibleCells().map(c => <td key={c.id}>{String(c.getValue())}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## How to apply this skill

1. Declare the table state model (pagination/sorting/filters)
2. Decide client vs server responsibility
3. Make query key match table state
4. Ensure API responses include `rowCount`
5. Add virtualization if the UI renders too many rows
