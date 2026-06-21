/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableCardView } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-card-view";

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

afterEach(() => {
  cleanup();
});

describe("DataTableCardView row action trigger", () => {
  it("names the card row action trigger with a default label", () => {
    render(
      <DataTableCardView
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        rowActions={rowActions}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
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
});
