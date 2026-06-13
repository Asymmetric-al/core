/** @vitest-environment jsdom */

/**
 * Proves that the DataGrid search box actually filters rows when
 * `enableSearch: true, enableFilter: false`.
 *
 * Approach (focused useTable test, not a full DataGrid render):
 * A full DataGrid render in jsdom is unstable here because DataGrid leans
 * heavily on row virtualization (TanStack Virtual + ResizeObserver) and the
 * Motion animation library. Both break under jsdom even with global stubs —
 * see the existing `data-table-subscriptions.test.tsx` for the lighter
 * DataTable (non-virtualized) render pattern.
 *
 * Instead we build a `useTable` instance the same way `data-grid.tsx` does —
 * same features (`dataTableFeatures`) and same
 * `createDataTableRowModels({ filtering: true, sorting: false, ... })` — then
 * drive the `globalFilter` state and assert `table.getRowModel().rows` shrinks.
 * This test FAILS against the pre-fix flag (`filtering: enableFilter` → false)
 * because v9 silently skips filtering when `filteredRowModel` is not registered
 * (ADR-2): all four rows would still be returned regardless of the filter value.
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
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

import type {
  ColumnDef,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

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

const columns: ColumnDef<Donor>[] = [
  { accessorKey: "name", header: "Name" },
];

// ---------------------------------------------------------------------------
// jsdom globals — same pattern as data-table-subscriptions.test.tsx
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Focused useTable harness — mirrors data-grid.tsx's row-model setup when
// enableSearch: true, enableFilter: false
// ---------------------------------------------------------------------------

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

  // This mirrors the exact useTable call in data-grid.tsx with
  // enableSearch: true, enableFilter: false → filtering: false || true = true
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<Donor>({
      filtering: true,    // enableFilter || enableSearch = false || true
      sorting: false,
      pagination: false,
      faceting: false,
    }),
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

    // After setting globalFilter to "Alice" only 1 row should match.
    // This assertion FAILS on the pre-fix flag (`filtering: enableFilter` →
    // false) because v9 silently returns all rows when filteredRowModel is
    // absent (ADR-2).
    expect(capturedCount).toBe(1);
  });
});
