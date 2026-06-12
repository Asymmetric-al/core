/** @vitest-environment jsdom */

/**
 * Behavior tests for the focused-subscription data-table chrome.
 *
 * The pagination and action-bar chrome are memoized and subscribe to
 * individual table state slices (`useSelector(table.atoms.<slice>)`) instead
 * of re-rendering with the table-creating parent. These tests prove that:
 *
 * 1. the pagination chrome still works end to end (next/prev, page size),
 * 2. the action bar still appears/disappears with row selection, and
 * 3. the pagination chrome does NOT re-render when a row is selected while
 *    its selected-count display is disabled (the focused-subscription win).
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { DataTable } from "../../../../../../packages/ui/components/shadcn/data-table/data-table";
import { DataTablePagination } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-pagination";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  Updater,
} from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Person = {
  id: string;
  name: string;
};

const people: Person[] = [
  { id: "p1", name: "Mallory" },
  { id: "p2", name: "Ada" },
  { id: "p3", name: "Zoe" },
  { id: "p4", name: "Grace" },
];

const columns: ColumnDef<Person>[] = [{ accessorKey: "name", header: "Name" }];

beforeAll(() => {
  // jsdom is missing layout/observer APIs that Radix popovers and motion use.
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

function renderPeopleTable() {
  return render(
    <DataTable<Person, unknown>
      columns={columns}
      data={people}
      getRowId={(row) => row.id}
      initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
    />,
  );
}

describe("memoized pagination chrome behavior", () => {
  it("pages forward and backward and changes the page size", async () => {
    renderPeopleTable();

    expect(screen.getByText("Page 1 of 2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(screen.getByText("Page 2 of 2")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Go to previous page" }),
    );
    expect(screen.getByText("Page 1 of 2")).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: "20" }));

    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
    expect(screen.getByText("Mallory")).toBeTruthy();
    expect(screen.getByText("Grace")).toBeTruthy();
  });
});

describe("memoized action bar behavior", () => {
  it("appears when a row is selected and disappears when the selection clears", () => {
    renderPeopleTable();

    expect(
      screen.queryByRole("button", { name: "Clear selection" }),
    ).toBeNull();

    fireEvent.click(
      screen.getAllByRole("checkbox", { name: "Select row" })[0] as Element,
    );

    expect(screen.getByText("selected")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("1 of 4 row(s) selected")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(screen.queryByText("selected")).toBeNull();
    expect(screen.getByText("0 of 4 row(s) selected")).toBeTruthy();
  });
});

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

/**
 * Standalone table owner that mirrors the shared layer: `useTable` with the
 * default full-state selector and externally controlled state, so the owner
 * re-renders on every table state change (including row selection).
 */
function PaginationProbeHarness({
  pageSizes,
}: {
  pageSizes: readonly number[];
}) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    {},
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 2,
  });

  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<Person>(),
    data: people,
    columns: columns as ColumnDef<Person, unknown>[],
    getRowId: (row) => row.id,
    state: { rowSelection, pagination },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      setRowSelection((old) => resolveUpdater(updater, old));
    },
    onPaginationChange: (updater) => {
      setPagination((old) => resolveUpdater(updater, old));
    },
  });

  const firstRow = table.getRowModel().rows[0];

  return (
    <div>
      <button type="button" onClick={() => firstRow?.toggleSelected(true)}>
        select first row
      </button>
      <span data-testid="harness-selected-count">
        {Object.keys(rowSelection).length}
      </span>
      <DataTablePagination
        table={table}
        pageSizes={pageSizes}
        showSelectedCount={false}
      />
    </div>
  );
}

describe("pagination chrome focused subscriptions", () => {
  it("does not re-render when a row is selected, but does on page change", () => {
    // Render-count probe: the pagination component calls `pageSizes.map(...)`
    // exactly once per render while building the page-size options, so a
    // stable proxied array counts its renders without touching the component.
    const paginationRenderProbe = vi.fn();
    const probedPageSizes = new Proxy([2, 4] as readonly number[], {
      get(target, property, receiver) {
        if (property === "map") {
          paginationRenderProbe();
        }
        return Reflect.get(target, property, receiver) as unknown;
      },
    }) as readonly number[];

    render(<PaginationProbeHarness pageSizes={probedPageSizes} />);

    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    const rendersAfterMount = paginationRenderProbe.mock.calls.length;
    expect(rendersAfterMount).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "select first row" }));

    // The table owner re-rendered with the new selection...
    expect(screen.getByTestId("harness-selected-count").textContent).toBe("1");
    // ...but the pagination chrome (selected count hidden) did not re-render:
    // it subscribes only to the pagination/filter slices it renders.
    expect(paginationRenderProbe.mock.calls.length).toBe(rendersAfterMount);

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(screen.getByText("Page 2 of 2")).toBeTruthy();
    expect(paginationRenderProbe.mock.calls.length).toBeGreaterThan(
      rendersAfterMount,
    );
  });
});
