// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataTableFloatingBar } from "../../../../packages/ui/components/shadcn/data-table/data-table-floating-bar";
import {
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

type RecordRow = { id: string; name: string };
const selectedRows: RecordRow[] = [
  { id: "one", name: "First record" },
  { id: "two", name: "Second record" },
];
const columns = [{ accessorKey: "name", header: "Name" }];

function SelectionHarness({
  actions,
}: {
  actions: {
    label: string;
    hideOnMobile?: boolean;
    onClick: (rows: RecordRow[]) => void;
  }[];
}) {
  const table = useTable({
    features: dataTableFeatures,
    data: selectedRows,
    columns,
    getRowId: (row) => row.id,
    initialState: { rowSelection: { one: true, two: true } },
    enableRowSelection: true,
  });
  return <DataTableFloatingBar table={table} actions={actions} />;
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setViewport(width: number) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: query.includes("max-width") ? width < 768 : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

describe("floating selection action reachability", () => {
  it.each([1280, 390])(
    "exposes every action exactly once at %ipx, including actions hidden from the mobile toolbar",
    async (width) => {
      setViewport(width);
      const actions = [
        { label: "Archive", hideOnMobile: true, onClick: vi.fn() },
        { label: "Export", onClick: vi.fn() },
        { label: "Delete", onClick: vi.fn() },
        { label: "Publish", onClick: vi.fn() },
      ];
      render(<SelectionHarness actions={actions} />);
      if (width < 768) {
        expect(screen.queryByRole("button", { name: "Archive" })).toBeNull();
      }
      fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
      await screen.findByRole("menu");
      for (const action of actions) {
        const available = [
          ...screen.queryAllByRole("button", { name: action.label }),
          ...screen.queryAllByRole("menuitem", { name: action.label }),
        ];
        expect(
          available,
          `${action.label} must have one reachable control`,
        ).toHaveLength(1);
      }
    },
  );

  it("passes the original selected records to an overflow action", async () => {
    setViewport(390);
    const onPublish = vi.fn();
    render(
      <SelectionHarness
        actions={[
          { label: "Export", onClick: vi.fn() },
          { label: "Archive", onClick: vi.fn() },
          { label: "Publish", onClick: onPublish },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Publish" }));
    expect(onPublish).toHaveBeenCalledExactlyOnceWith(selectedRows);
  });
});
