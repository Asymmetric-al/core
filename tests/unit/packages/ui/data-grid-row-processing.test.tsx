// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DataGrid } from "../../../../packages/ui/components/shadcn/data-grid/data-grid";

const rows = Array.from({ length: 15 }, (_, index) => ({
  id: `donor-${index}`,
  name: `Donor ${index}`,
}));
const columns = [{ id: "name", header: "Name", accessorKey: "name" as const }];

afterEach(cleanup);

describe("DataGrid row processing", () => {
  it("keeps every supplied row visible without pagination and searches when filters are disabled", () => {
    render(
      <DataGrid
        data={rows}
        columns={columns}
        config={{
          enableSearch: true,
          enableFilter: false,
          enableSort: false,
          enableSelection: false,
          enableEditing: false,
          virtualization: { enabled: false },
        }}
      />,
    );

    expect(screen.getAllByRole("row")).toHaveLength(15);
    expect(screen.getByText("15 rows")).toBeDefined();

    fireEvent.change(screen.getByRole("textbox", { name: "Search grid" }), {
      target: { value: "Donor 14" },
    });

    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.getByText("Donor 14")).toBeDefined();
    expect(screen.getByText("1 row")).toBeDefined();
  });
});
