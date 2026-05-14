/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", async () => {
  const React = await import("react");

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    LazyMotion: ({ children }: { children: React.ReactNode }) => children,
    domAnimation: {},
    m: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
        React.createElement("div", props, children),
    },
  };
});

import { DataTableActionBar } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-action-bar";
import { DataTableFloatingBar } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-floating-bar";

function createTable<TData>(rows: TData[], clearSelection = vi.fn()) {
  return {
    getFilteredSelectedRowModel: () => ({
      rows: rows.map((original) => ({ original })),
    }),
    toggleAllPageRowsSelected: clearSelection,
  } as never;
}

afterEach(() => {
  cleanup();
});

describe("data table action bars", () => {
  it("does not render placeholder default actions in the desktop action bar", () => {
    const clearSelection = vi.fn();
    const table = createTable([{ id: "row-1" }], clearSelection);

    render(<DataTableActionBar table={table} />);

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("selected")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(clearSelection).toHaveBeenCalledWith(false);
  });

  it("passes selected rows to caller-provided desktop actions", () => {
    const selectedRows = [{ id: "row-1" }, { id: "row-2" }];
    const onArchive = vi.fn();
    const table = createTable(selectedRows);

    render(
      <DataTableActionBar
        table={table}
        actions={[{ label: "Archive", onClick: onArchive }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onArchive).toHaveBeenCalledWith(selectedRows);
  });

  it("does not render placeholder default actions in the responsive floating bar", () => {
    const clearSelection = vi.fn();
    const table = createTable([{ id: "row-1" }], clearSelection);

    render(<DataTableFloatingBar table={table} />);

    expect(screen.getByText("1 selected")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(clearSelection).toHaveBeenCalledWith(false);
  });

  it("passes selected rows to caller-provided floating bar actions", () => {
    const selectedRows = [{ id: "row-1" }, { id: "row-2" }];
    const onExport = vi.fn();
    const table = createTable(selectedRows);

    render(
      <DataTableFloatingBar
        table={table}
        actions={[{ label: "Export CSV", onClick: onExport }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(onExport).toHaveBeenCalledWith(selectedRows);
  });
});
