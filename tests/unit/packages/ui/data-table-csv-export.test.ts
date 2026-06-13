import { describe, expect, it } from "vitest";

import { exportToCSV } from "../../../../packages/ui/components/shadcn/data-table/utils/export";

// Minimal Table double — cast as `never` so TypeScript does not require every
// method on the real Table type (same pattern used in data-table-action-bars).
function makeTable(
  columns: { id: string; header: string; visible?: boolean }[],
  rows: Record<string, unknown>[],
) {
  const leafColumns = columns.map((col) => ({
    id: col.id,
    columnDef: { header: col.header, meta: undefined },
    getIsVisible: () => col.visible ?? true,
  }));

  const tableRows = rows.map((original) => ({
    original,
    getAllCells: () =>
      Object.entries(original).map(([key, val]) => ({
        column: { id: key },
        getValue: () => val,
      })),
  }));

  return {
    getAllLeafColumns: () => leafColumns,
    getFilteredRowModel: () => ({ rows: tableRows }),
    getSelectedRowModel: () => ({ rows: tableRows }),
    getCoreRowModel: () => ({ rows: tableRows }),
  } as never;
}

describe("exportToCSV — formula injection neutralization", () => {
  it("prefixes a cell value starting with '=' with a single quote", () => {
    const table = makeTable(
      [{ id: "formula", header: "Formula" }],
      [{ formula: "=1+1" }],
    );
    const csv = exportToCSV(table);
    // header row then data row; the cell should be neutralized to '=1+1
    expect(csv).toBe("Formula\n'=1+1");
  });

  it("prefixes values starting with '+', '-', '@', and tab", () => {
    const table = makeTable(
      [
        { id: "plus", header: "Plus" },
        { id: "minus", header: "Minus" },
        { id: "at", header: "At" },
        { id: "tab", header: "Tab" },
      ],
      [{ plus: "+1", minus: "-1", at: "@x", tab: "\tindented" }],
    );
    const csv = exportToCSV(table);
    const dataLine = csv.split("\n")[1];
    expect(dataLine).toBe("'+1,'-1,'@x,'\tindented");
  });

  it("quotes a formula+delimiter cell after neutralization", () => {
    // '=a,b contains the delimiter so it must be wrapped in quotes.
    const table = makeTable(
      [{ id: "val", header: "Val" }],
      [{ val: "=a,b" }],
    );
    const csv = exportToCSV(table);
    expect(csv).toBe(`Val\n"'=a,b"`);
  });

  it("does not alter a benign cell value", () => {
    const table = makeTable(
      [{ id: "name", header: "Name" }],
      [{ name: "Acme Inc" }],
    );
    const csv = exportToCSV(table);
    expect(csv).toBe("Name\nAcme Inc");
  });

  it("neutralizes a header that starts with '='", () => {
    const table = makeTable(
      [{ id: "col", header: "=SUM(A1:A10)" }],
      [{ col: "safe" }],
    );
    const csv = exportToCSV(table);
    const headerLine = csv.split("\n")[0];
    expect(headerLine).toBe("'=SUM(A1:A10)");
  });
});
