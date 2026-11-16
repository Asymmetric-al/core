/** @vitest-environment jsdom */

/**
 * DataGrid search must filter rows when `enableSearch: true,
 * enableFilter: false`.
 *
 * Approach (focused useTable test, not a full DataGrid render):
 * A full DataGrid render in jsdom is unstable here because DataGrid leans
 * heavily on row virtualization (TanStack Virtual + ResizeObserver) and the
 * Motion animation library. Both break under jsdom even with global stubs —
 * see `data-table-subscriptions.test.tsx` for the lighter DataTable
 * (non-virtualized) render pattern.
 *
 * Instead the harness builds a `useTable` instance with the shared feature set
 * (`dataTableFeatures`) and filtering left on, which is what `data-grid.tsx`'s
 * `manualFiltering: !(enableFilter || enableSearch)` resolves to here, then
 * drives `globalFilter` and asserts `table.getRowModel().rows` shrinks. With
 * `manualFiltering: true`, v9 skips the filtered row model and all four rows
 * come back regardless of the filter (ADR-2 in
 * docs/guides/architecture/tanstack-table-v9-decisions.md). The harness copies
 * those options rather than reading them from `data-grid.tsx`, so it does not
 * catch a regression of that flag on its own.
 */

import * as React from "react";
import { act, cleanup, render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

import type { ColumnDef } from "../../../../packages/ui/components/shadcn/data-table/tanstack";

type Donor = {
  id: string;
  name: string;
};

const donors: Donor[] = [
  { id: "d1", name: "Alice" },
  { id: "d2", name: "Bob" },
  { id: "d3", name: "Charlie" },
  { id: "d4", name: "Dave" },
];

const columns: ColumnDef<Donor>[] = [{ accessorKey: "name", header: "Name" }];

// jsdom lacks these browser APIs; same stubs as data-table-subscriptions.test.tsx.
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  }
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
});

/**
 * Captures the live `table.getRowModel().rows` count after each render so the
 * test can assert on it without touching the DOM.
 */
function SearchFilterHarness({
  onRowCount,
}: {
  onRowCount: (count: number) => void;
}) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Filtering stays on (manualFiltering defaults to false), as data-grid.tsx
  // resolves `!(enableFilter || enableSearch)` with search enabled. The other
  // options are not a copy of data-grid.tsx's call.
  const table = useTable({
    features: dataTableFeatures,
    manualSorting: true,
    manualPagination: true,
    data: donors,
    columns: columns as ColumnDef<Donor, unknown>[],
    getRowId: (row) => row.id,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const rowCount = table.getRowModel().rows.length;
  onRowCount(rowCount);

  return (
    <button
      type="button"
      onClick={() => setGlobalFilter("Alice")}
      data-testid="filter-trigger"
    >
      filter to Alice
    </button>
  );
}

describe("DataGrid search filtering (focused useTable test)", () => {
  it("reduces visible rows when globalFilter is set and filteredRowModel is registered", () => {
    let capturedCount = -1;

    const { getByTestId } = render(
      <SearchFilterHarness
        onRowCount={(count) => {
          capturedCount = count;
        }}
      />,
    );

    // Before filtering all 4 donors should be visible.
    expect(capturedCount).toBe(4);

    act(() => {
      getByTestId("filter-trigger").click();
    });

    // Only "Alice" matches. With manual filtering, all four rows would remain.
    expect(capturedCount).toBe(1);
  });
});
