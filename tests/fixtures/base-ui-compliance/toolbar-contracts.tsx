import React, { useState } from "react";

import { DataTableToolbarResponsive } from "../../../packages/ui/components/shadcn/data-table/data-table-toolbar-responsive";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../packages/ui/components/shadcn/data-table/tanstack";

import type { ColumnDef } from "../../../packages/ui/components/shadcn/data-table/tanstack";

type Person = { id: string; name: string; email: string };
const people: Person[] = [
  { id: "one", name: "Ada", email: "ada@example.test" },
];
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", meta: { label: "Name" } },
  { accessorKey: "email", meta: { label: "Email" } },
];

export function ToolbarContracts() {
  const [exports, setExports] = useState(0);
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<Person>(),
    data: people,
    columns,
  });
  return (
    <section
      id="toolbar-contracts"
      className="my-8 grid gap-4 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">Responsive table toolbar</h2>
      <DataTableToolbarResponsive
        table={table}
        searchKey="name"
        searchPlaceholder="Search people"
        filterFields={[
          {
            id: "name",
            label: "People",
            options: [
              { value: "Ada", label: "Ada" },
              { value: "Grace", label: "Grace" },
            ],
          },
        ]}
        enableExport
        onExport={() => setExports((count) => count + 1)}
      />
      <output aria-label="Active people filter">
        {JSON.stringify(table.getColumn("name")?.getFilterValue() ?? [])}
      </output>
      <output aria-label="Table exports">{exports}</output>
      <output aria-label="Visible columns">
        {table
          .getVisibleLeafColumns()
          .map((column) => column.id)
          .join(",")}
      </output>
    </section>
  );
}
