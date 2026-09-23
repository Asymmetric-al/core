import * as React from "react";
import { createRoot } from "react-dom/client";

import { DataTablePagination } from "../../../packages/ui/components/shadcn/data-table/data-table-pagination";
import { DataTableToolbarResponsive } from "../../../packages/ui/components/shadcn/data-table/data-table-toolbar-responsive";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
} from "../../../packages/ui/components/shadcn/data-table/tanstack";

interface Person {
  id: string;
  name: string;
  city: string;
}

const people: Person[] = [
  { id: "1", name: "Alice", city: "London" },
  { id: "2", name: "Bob", city: "Paris" },
  { id: "3", name: "Charlie", city: "Bangkok" },
  { id: "4", name: "Diana", city: "Seattle" },
  { id: "5", name: "Eli", city: "Tokyo" },
  { id: "6", name: "Frida", city: "Berlin" },
];
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { label: "Name" } },
  { accessorKey: "city", header: "City", meta: { label: "City" } },
];
const rowModels = createDataTableRowModels<Person>();
const pageSizes = [2, 4, 6];

function DataTableAccessibilityFixture() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 2,
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [pending, setPending] = React.useState(false);
  const [refreshes, setRefreshes] = React.useState(0);
  const [exports, setExports] = React.useState(0);
  const table = useTable({
    features: dataTableFeatures,
    rowModels,
    data: people,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, columnFilters, columnVisibility },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <main className="grid grid-cols-1 gap-6 p-4">
      <h1>Table controls</h1>
      <button type="button" data-testid="before-table-controls">
        Before table controls
      </button>
      <div data-testid="toolbar">
        <DataTableToolbarResponsive
          table={table}
          searchKey="name"
          searchPlaceholder="Search people"
          enableExport
          onExport={() => setExports((value) => value + 1)}
          onRefresh={() => setRefreshes((value) => value + 1)}
          urlStatePending={pending}
          isLoading={pending}
        />
      </div>
      <div data-testid="pagination">
        <DataTablePagination
          table={table}
          pageSizes={pageSizes}
          urlStatePending={pending}
        />
      </div>
      <ul aria-label="Visible people">
        {table.getRowModel().rows.map((row) => (
          <li key={row.id}>{row.original.name}</li>
        ))}
      </ul>
      <output data-testid="visible-columns">
        {table
          .getVisibleLeafColumns()
          .map((column) => column.id)
          .join(",")}
      </output>
      <output data-testid="refreshes">{refreshes}</output>
      <output data-testid="exports">{exports}</output>
      <button type="button" onClick={() => setPending((value) => !value)}>
        Toggle pending
      </button>
      <section aria-label="Second pagination">
        <DataTablePagination
          table={table}
          pageSizes={pageSizes}
          showSelectedCount={false}
          urlStatePending={pending}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <DataTableAccessibilityFixture />,
);
