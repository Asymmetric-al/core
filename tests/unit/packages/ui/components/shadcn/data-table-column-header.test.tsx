// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DataTableColumnHeader } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-column-header";
import {
  dataTableFeatures,
  useTable,
} from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Row = { id: string; name: string };

const data: Row[] = [
  { id: "person-1", name: "Ada" },
  { id: "person-2", name: "Grace" },
];

function HeaderHarness({ column }: { column: ColumnDef<Row> }) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: [column],
  });

  return (
    <DataTableColumnHeader column={table.getColumn("name")} title="Name" />
  );
}

afterEach(cleanup);

describe("DataTableColumnHeader accessible names", () => {
  it("names the column and its sort state, and updates it after sorting", async () => {
    render(<HeaderHarness column={{ accessorKey: "name" }} />);

    const trigger = screen.getByRole("button", {
      name: "Name, not sorted, column options",
    });
    fireEvent.click(trigger);
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Sort descending" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Name, sorted descending, column options",
        }),
      ).toBeTruthy();
    });
  });

  it("makes no sort claim on a column that cannot sort", async () => {
    render(
      <HeaderHarness column={{ accessorKey: "name", enableSorting: false }} />,
    );

    const trigger = screen.getByRole("button", {
      name: "Name, column options",
    });
    fireEvent.click(trigger);

    await screen.findByRole("menuitem", { name: "Hide column" });
    expect(screen.queryByRole("menuitem", { name: /sort/i })).toBeNull();
  });

  it("renders plain text when the column has no actions", () => {
    render(
      <HeaderHarness
        column={{
          accessorKey: "name",
          enableSorting: false,
          enableHiding: false,
          enablePinning: false,
        }}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Name")).toBeTruthy();
  });

  it("offers only the pin action that applies", async () => {
    render(<HeaderHarness column={{ accessorKey: "name" }} />);

    const trigger = screen.getByRole("button", { name: /^Name,/ });
    fireEvent.click(trigger);
    const pin = await screen.findByRole("menuitem", { name: "Pin to left" });
    expect(screen.queryByRole("menuitem", { name: "Unpin" })).toBeNull();
    fireEvent.click(pin);

    fireEvent.click(screen.getByRole("button", { name: /^Name,/ }));
    await screen.findByRole("menuitem", { name: "Unpin" });
    expect(screen.queryByRole("menuitem", { name: "Pin to left" })).toBeNull();
  });
});
