import * as React from "react";
import { createRoot } from "react-dom/client";
import { DataGrid } from "../../../packages/ui/components/shadcn/data-grid/data-grid";
import type { DataGridColumn } from "../../../packages/ui/components/shadcn/data-grid/types";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";

type Person = { name: string };
const people: Person[] = [{ name: "Alpha" }, { name: "Beta" }];
const columns: DataGridColumn<Person>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    cellType: "text",
    editable: true,
  },
];
function GridFixture() {
  const [deletions, setDeletions] = React.useState<number[][]>([]);
  const [copies, setCopies] = React.useState(0);
  return (
    <TooltipProvider>
      <main className="bg-background p-4 text-foreground">
        <h1 className="text-xl">Grid editing ownership</h1>
        <DataGrid
          data={people}
          columns={columns}
          config={{
            enableSelection: true,
            enableEditing: true,
            enableCopy: true,
            enableRowDelete: true,
            enableSearch: false,
            enableUndo: false,
            enablePaste: false,
            enableRowAdd: false,
            enableSort: false,
            enableFilter: false,
            virtualizeRows: false,
            maxHeight: 280,
          }}
          callbacks={{
            onRowDelete: (indices) => setDeletions((old) => [...old, indices]),
            onCopy: () => setCopies((old) => old + 1),
          }}
        />
        <output data-testid="row-deletions">{JSON.stringify(deletions)}</output>
        <output data-testid="grid-copies">{copies}</output>
      </main>
    </TooltipProvider>
  );
}
createRoot(document.getElementById("root")!).render(<GridFixture />);
