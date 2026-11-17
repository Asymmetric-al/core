/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataTableResponsive } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive";

import type { DataTableResponsiveProps } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive";
import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Gift = { id: string; name: string };

const data: Gift[] = [
  { id: "gift-1", name: "Ada Lovelace" },
  { id: "gift-2", name: "Grace Hopper" },
  { id: "gift-3", name: "Katherine Johnson" },
];

const columns: ColumnDef<Gift>[] = [
  { accessorKey: "name", header: "Name" },
  {
    id: "receipt",
    header: "Receipt",
    cell: ({ row }) => (
      <>
        <a href={`/receipts/${row.original.id}`}>
          {`Receipt for ${row.original.name}`}
        </a>
        <button type="button">{`Resend to ${row.original.name}`}</button>
      </>
    ),
  },
];

function renderTable(
  props: Partial<DataTableResponsiveProps<Gift, unknown>> = {},
) {
  const { config, ...rest } = props;
  return render(
    <DataTableResponsive
      columns={columns}
      data={data}
      getRowId={(gift) => gift.id}
      {...rest}
      config={{
        enableFilters: false,
        enablePagination: false,
        enableRowSelection: false,
        ...config,
      }}
    />,
  );
}

function bodyRows() {
  return screen
    .getAllByRole("row")
    .filter((row) => row.closest("tbody") !== null);
}

function tabStops() {
  return bodyRows().map((row) => row.getAttribute("tabindex"));
}

beforeEach(() => {
  // Desktop: the table, not the phone cards.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DataTableResponsive row keyboard", () => {
  it("puts only the first row in the tab order until a row takes focus", () => {
    renderTable();

    expect(tabStops()).toEqual(["0", "-1", "-1"]);
  });

  it("moves focus and the tab stop with ArrowDown and ArrowUp", () => {
    renderTable();
    const [first, second] = bodyRows();

    act(() => first!.focus());
    fireEvent.keyDown(first!, { key: "ArrowDown" });

    expect(document.activeElement).toBe(second);
    expect(tabStops()).toEqual(["-1", "0", "-1"]);

    fireEvent.keyDown(second!, { key: "ArrowUp" });

    expect(document.activeElement).toBe(first);
    expect(tabStops()).toEqual(["0", "-1", "-1"]);
  });

  it("keeps the focused row's tab stop and leaves Escape to its surroundings", () => {
    renderTable();
    const [, second] = bodyRows();

    act(() => second!.focus());
    const escape = fireEvent.keyDown(second!, { key: "Escape" });

    // A dialog or sheet around the table still receives Escape.
    expect(escape).toBe(true);
    expect(document.activeElement).toBe(second);
    expect(tabStops()).toEqual(["-1", "0", "-1"]);
  });

  it("keeps the tab stop on the last focused row after focus leaves the table", () => {
    renderTable();
    const [, second] = bodyRows();

    act(() => second!.focus());
    act(() => second!.blur());

    expect(tabStops()).toEqual(["-1", "0", "-1"]);
  });

  it("shows the row focus ring only while the row itself holds focus", () => {
    renderTable();
    const [first] = bodyRows();
    const link = within(first!).getByRole("link");

    expect(first!.className).not.toContain("ring-2");

    act(() => first!.focus());
    expect(first!.className).toContain("ring-2");

    // The link draws its own focus ring; two rings would be one too many.
    act(() => link.focus());
    expect(first!.className).not.toContain("ring-2");

    act(() => first!.focus());
    act(() => first!.blur());
    expect(first!.className).not.toContain("ring-2");
  });

  it("keeps every row out of the tab order when keyboard navigation is off", () => {
    renderTable({ config: { enableKeyboardNavigation: false } });

    expect(tabStops()).toEqual(["-1", "-1", "-1"]);
  });

  it("leaves Enter on a link inside a row to the link", () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    const link = screen.getByRole("link", { name: "Receipt for Ada Lovelace" });

    act(() => link.focus());
    const notCancelled = fireEvent.keyDown(link, { key: "Enter" });

    expect(notCancelled).toBe(true);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("leaves Space on a button inside a row to the button", () => {
    renderTable({ config: { enableRowSelection: true } });
    const [first] = bodyRows();
    const button = screen.getByRole("button", {
      name: "Resend to Ada Lovelace",
    });

    act(() => button.focus());
    const notCancelled = fireEvent.keyDown(button, { key: " " });

    expect(notCancelled).toBe(true);
    expect(first!.getAttribute("data-state")).not.toBe("selected");
  });

  it("leaves the arrow keys alone when they come from a control inside a row", () => {
    renderTable();
    const link = screen.getByRole("link", { name: "Receipt for Ada Lovelace" });

    act(() => link.focus());
    const notCancelled = fireEvent.keyDown(link, { key: "ArrowDown" });

    expect(notCancelled).toBe(true);
    expect(document.activeElement).toBe(link);
  });

  it("toggles a row's own selection checkbox once with Space", () => {
    renderTable({ config: { enableRowSelection: true } });
    const [first] = bodyRows();
    const checkbox = within(first!).getByRole("checkbox", {
      name: "Select row",
    });

    act(() => checkbox.focus());
    fireEvent.keyDown(checkbox, { key: " " });
    fireEvent.keyUp(checkbox, { key: " " });

    expect(first!.getAttribute("data-state")).toBe("selected");
  });

  it("opens the row with Enter on the row itself", () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    const [, second] = bodyRows();

    act(() => second!.focus());
    const notCancelled = fireEvent.keyDown(second!, { key: "Enter" });

    expect(notCancelled).toBe(false);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]![0].original).toEqual(data[1]);
  });

  it("selects the row with Space on the row itself", () => {
    renderTable({ config: { enableRowSelection: true } });
    const [first] = bodyRows();

    act(() => first!.focus());
    const notCancelled = fireEvent.keyDown(first!, { key: " " });

    expect(notCancelled).toBe(false);
    expect(first!.getAttribute("data-state")).toBe("selected");
  });
});

describe("DataTableResponsive table semantics", () => {
  it("is a named grid while its rows are keyboard navigable", () => {
    renderTable({ label: "Giving history" });

    const grid = screen.getByRole("grid", { name: "Giving history" });
    expect(within(grid).getAllByRole("gridcell").length).toBeGreaterThan(0);
  });

  it("stays a plain table when keyboard navigation is off", () => {
    renderTable({
      label: "Partners",
      config: { enableKeyboardNavigation: false },
    });

    expect(screen.queryByRole("grid")).toBeNull();
    expect(screen.queryByRole("gridcell")).toBeNull();
    const table = screen.getByRole("table", { name: "Partners" });
    expect(within(table).getAllByRole("cell").length).toBeGreaterThan(0);
  });
});
