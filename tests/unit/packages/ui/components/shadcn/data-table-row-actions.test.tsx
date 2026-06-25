/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableRowActions } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-row-actions";

type SampleRow = { id: string; name: string };

const mockRow = {
  original: { id: "row-1", name: "Ada Lovelace" },
} as never;

const actions = [{ label: "Edit", onClick: vi.fn() }];

afterEach(() => {
  cleanup();
});

describe("DataTableRowActions", () => {
  it("uses default aria-label when getAriaLabel is omitted", () => {
    render(<DataTableRowActions row={mockRow} actions={actions} />);

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
  });

  it("uses contextual aria-label from getAriaLabel", () => {
    render(
      <DataTableRowActions<SampleRow>
        row={mockRow}
        actions={actions}
        getAriaLabel={(row) =>
          `Row actions for ${(row.original as SampleRow).name}`
        }
      />,
    );

    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
  });

  it("falls back to the default label when getAriaLabel returns whitespace", () => {
    render(
      <DataTableRowActions
        row={mockRow}
        actions={actions}
        getAriaLabel={() => "   "}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
  });

  it("falls back to the default label when getAriaLabel returns an empty string", () => {
    render(
      <DataTableRowActions
        row={mockRow}
        actions={actions}
        getAriaLabel={() => ""}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
  });

  it("marks the decorative menu icon as aria-hidden", () => {
    const { container } = render(
      <DataTableRowActions row={mockRow} actions={actions} />,
    );

    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});
