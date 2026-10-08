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

const data = [{ id: "person-1", name: "Ada" }];
const columns: ColumnDef<(typeof data)[number]>[] = [{ accessorKey: "name" }];

function PinningHarness() {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
  });
  const column = table.getColumn("name");

  return (
    <>
      <DataTableColumnHeader column={column} title="Name" />
      <output aria-label="Column pinning">
        {column.getIsPinned() ? "Pinned" : "Unpinned"}
      </output>
    </>
  );
}

afterEach(cleanup);

describe("shared table column pinning", () => {
  it("pins and unpins a column through the header menu", async () => {
    render(<PinningHarness />);
    expect(screen.getByLabelText("Column pinning").textContent).toBe(
      "Unpinned",
    );

    const trigger = screen.getByRole("button", {
      name: "Not sorted. Click to sort ascending.",
    });
    fireEvent.click(trigger);
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Pin to left" }),
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Column pinning").textContent).toBe(
        "Pinned",
      );
    });

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Unpin" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Column pinning").textContent).toBe(
        "Unpinned",
      );
    });
  });
});
