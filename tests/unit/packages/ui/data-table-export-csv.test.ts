import { csvSafeCell } from "@asym/lib/csv";
import { describe, expect, it } from "vitest";

import { exportToCSV } from "../../../../packages/ui/components/shadcn/data-table/utils/export";

import type { Table } from "@tanstack/react-table";

type Rec = Record<string, unknown>;

/**
 * Minimal TanStack-table stand-in exposing only the surface `exportToCSV`
 * touches: leaf columns, visibility, the filtered row model, and per-cell
 * values. Keeps the test focused on serialization, not table internals.
 */
function fakeTable(
  columnDefs: Array<{ id: string; header: string }>,
  data: Rec[],
): Table<Rec> {
  const columns = columnDefs.map((c) => ({
    id: c.id,
    columnDef: { header: c.header },
    getIsVisible: () => true,
  }));
  const rows = data.map((original) => ({
    original,
    getAllCells: () =>
      columnDefs.map((c) => ({
        column: { id: c.id },
        getValue: () => original[c.id],
      })),
  }));
  return {
    getAllLeafColumns: () => columns,
    getFilteredRowModel: () => ({ rows }),
    getCoreRowModel: () => ({ rows }),
    getSelectedRowModel: () => ({ rows: [] }),
  } as unknown as Table<Rec>;
}

describe("exportToCSV — DataTable client export hardening", () => {
  it("neutralizes formula injection in donor-controlled cell values", () => {
    const payload = '=HYPERLINK("http://evil.example","x")';
    const csv = exportToCSV(
      fakeTable([{ id: "name", header: "Name" }], [{ name: payload }]),
    );
    const [header, dataRow] = csv.split("\n");

    expect(header).toBe(csvSafeCell("Name"));
    // The client path neutralizes identically to the shared serializer.
    expect(dataRow).toBe(csvSafeCell(payload));
    // And the neutralization is actually present: an apostrophe before the `=`.
    expect(dataRow).toContain(`"'=HYPERLINK(`);
  });

  it("quotes benign values without adding a formula prefix", () => {
    const csv = exportToCSV(
      fakeTable([{ id: "name", header: "Name" }], [{ name: "Ada Lovelace" }]),
    );
    expect(csv.split("\n")[1]).toBe(`"Ada Lovelace"`);
  });
});
