/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DataTableCardView,
  DataTableMobileView,
} from "../../../../../../packages/ui/components/shadcn/data-table/data-table-card-view";

type Person = { id: string; name: string };

const rows = [
  {
    id: "row-1",
    original: { id: "person-1", name: "Ada Lovelace" },
    getIsSelected: () => false,
    toggleSelected: vi.fn(),
  },
] as never;

const rowActions = [{ label: "Edit", onClick: vi.fn() }];
const getRowModel = vi.fn(() => ({ rows }));
const table = {
  getRowModel,
} as never;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DataTableCardView row action trigger", () => {
  it("names card row action triggers from the primary field by default", () => {
    const multiRows = [
      rows[0],
      {
        id: "row-2",
        original: { id: "person-2", name: "Grace Hopper" },
        getIsSelected: () => false,
        toggleSelected: vi.fn(),
      },
    ] as never;

    render(
      <DataTableCardView
        rows={multiRows}
        primaryField="name"
        enableRowSelection={false}
        rowActions={rowActions}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Row actions for Grace Hopper" }),
    ).toBeTruthy();
    expect(
      screen.queryAllByRole("button", { name: "Open row actions" }),
    ).toHaveLength(0);
  });

  it("uses getRowActionAriaLabel when provided", () => {
    render(
      <DataTableCardView<Person>
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        rowActions={rowActions}
        getRowActionAriaLabel={(row) =>
          `Row actions for ${(row.original as Person).name}`
        }
      />,
    );

    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
  });

  it("falls back to the shared default row action label without a primary field", () => {
    render(
      <DataTableCardView
        rows={rows}
        enableRowSelection={false}
        rowActions={rowActions}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
  });

  it("runs card row actions without invoking the row click handler", () => {
    const onRowClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <DataTableCardView
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        onRowClick={onRowClick}
        rowActions={[{ label: "Edit", onClick: onActionClick }]}
      />,
    );

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
      { key: "Enter" },
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onActionClick).toHaveBeenCalledWith({
      id: "person-1",
      name: "Ada Lovelace",
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("renders mobile rows from the table model with forced selection and row actions", () => {
    render(
      <DataTableMobileView<Person>
        table={table}
        primaryField="name"
        rowActions={rowActions}
        getRowActionAriaLabel={(row) =>
          `Row actions for ${(row.original as Person).name}`
        }
      />,
    );

    expect(getRowModel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
  });
});
