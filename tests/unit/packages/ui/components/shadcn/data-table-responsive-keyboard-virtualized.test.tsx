/** @vitest-environment jsdom */

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataTableResponsive } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive";

import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

// jsdom has no layout for the virtualizer to measure, so each test names the
// rows that are mounted.
const mounted = vi.hoisted(() => ({ from: 0, to: 0 }));

vi.mock(
  "../../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-virtualization",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useDataTableVirtualization: ({ count }: { count: number }) => ({
      config: {
        enabled: true,
        estimateSize: 56,
        overscan: 8,
        containerHeight: 640,
      },
      virtualItems: Array.from(
        { length: mounted.to - mounted.from + 1 },
        (_, offset) => ({ index: mounted.from + offset }),
      ),
      paddingTop: mounted.from * 56,
      paddingBottom: (count - 1 - mounted.to) * 56,
      totalSize: count * 56,
      isEnabled: true,
    }),
  }),
);

type Gift = { id: string; name: string };

const data: Gift[] = Array.from({ length: 40 }, (_, index) => ({
  id: `gift-${index}`,
  name: `Gift ${index}`,
}));

const columns: ColumnDef<Gift>[] = [{ accessorKey: "name", header: "Name" }];

function Table() {
  return (
    <DataTableResponsive
      columns={columns}
      data={data}
      getRowId={(gift) => gift.id}
      config={{
        enableFilters: false,
        enablePagination: false,
        manualPagination: true,
        enableRowSelection: false,
        virtualization: { enabled: true },
      }}
    />
  );
}

function dataRows() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('tbody tr[role="row"]'),
  );
}

function tabStopNames() {
  return dataRows()
    .filter((row) => row.getAttribute("tabindex") === "0")
    .map((row) => row.textContent);
}

beforeEach(() => {
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

describe("DataTableResponsive row keyboard in a virtualized table", () => {
  it("keeps one mounted row in the tab order when the first row is scrolled away", () => {
    mounted.from = 20;
    mounted.to = 29;
    render(<Table />);

    expect(dataRows()).toHaveLength(10);
    expect(tabStopNames()).toEqual(["Gift 20"]);
  });

  it("leaves the tab stop on the focused row while it is mounted", () => {
    mounted.from = 20;
    mounted.to = 29;
    render(<Table />);

    act(() => dataRows()[2]!.focus());

    expect(tabStopNames()).toEqual(["Gift 22"]);
  });

  it("hands the tab stop to a mounted row once the focused row is scrolled away", () => {
    mounted.from = 0;
    mounted.to = 9;
    const { rerender } = render(<Table />);
    act(() => dataRows()[3]!.focus());
    expect(tabStopNames()).toEqual(["Gift 3"]);

    mounted.from = 20;
    mounted.to = 29;
    rerender(<Table />);

    expect(tabStopNames()).toEqual(["Gift 20"]);
  });
});
