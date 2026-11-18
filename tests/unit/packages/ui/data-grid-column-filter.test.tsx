// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  DataGridPanel,
  DataGridRowPrimary,
  dataGridFeatures,
  useTable,
} from "../../../../packages/ui/components/data-grid-panel";
import { DataGridColumnFilter } from "../../../../packages/ui/components/reui/data-grid/data-grid-column-filter";

import type {
  ColumnFiltersState,
  DataGridColumnDef,
} from "../../../../packages/ui/components/data-grid-panel";

interface Person {
  id: string;
  name: string;
  city: string;
}

const PEOPLE: Person[] = [
  { id: "p1", name: "Avery Lopez", city: "Austin" },
  { id: "p2", name: "Maya Chen", city: "Denver" },
  { id: "p3", name: "Jonah Reyes", city: "Tulsa" },
];

const CITY_OPTIONS = [
  { label: "Austin", value: "Austin" },
  { label: "Denver", value: "Denver" },
  { label: "Tulsa", value: "Tulsa" },
];

const columns: DataGridColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <DataGridRowPrimary onClick={() => {}}>
        {row.original.name}
      </DataGridRowPrimary>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    filterFn: (row, columnId, value: string[]) =>
      value.includes(row.getValue(columnId)),
  },
];

function Grid() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useTable({
    features: dataGridFeatures,
    data: PEOPLE,
    columns,
    getRowId: (row) => row.id,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });
  return (
    <DataGridPanel
      table={table}
      recordCount={PEOPLE.length}
      label="People"
      toolbar={
        <DataGridColumnFilter
          column={table.getColumn("city")}
          title="City"
          options={CITY_OPTIONS}
        />
      }
    />
  );
}

async function openFilter() {
  fireEvent.click(screen.getByRole("button", { name: "City" }));
  return screen.findByRole("dialog", { name: "Filter by City" });
}

function option(popup: HTMLElement, name: RegExp) {
  return within(popup).getByRole("button", { name });
}

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
});

describe("DataGridColumnFilter", () => {
  it("offers each option as a native toggle button that exposes its state", async () => {
    render(<Grid />);
    const popup = await openFilter();

    for (const { label } of CITY_OPTIONS) {
      const control = option(popup, new RegExp(`^${label}`));
      expect(control.tagName).toBe("BUTTON");
      expect(control.getAttribute("type")).toBe("button");
      expect(control.getAttribute("aria-pressed")).toBe("false");
    }
    expect(popup.querySelector('div[role="button"]')).toBeNull();
  });

  it("toggles an option when it is pressed and filters the grid", async () => {
    render(<Grid />);
    const popup = await openFilter();

    fireEvent.click(option(popup, /^Austin/));

    expect(option(popup, /^Austin/).getAttribute("aria-pressed")).toBe("true");
    expect(option(popup, /^Denver/).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "Avery Lopez" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Maya Chen" })).toBeNull();

    fireEvent.click(option(popup, /^Austin/));

    expect(option(popup, /^Austin/).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: "Maya Chen" })).toBeTruthy();
  });

  it("leaves Enter and Space to the button's own activation", async () => {
    render(<Grid />);
    const popup = await openFilter();
    const austin = option(popup, /^Austin/);

    act(() => austin.focus());

    // A cancelled keydown would stop the browser from pressing the button.
    expect(fireEvent.keyDown(austin, { key: "Enter" })).toBe(true);
    expect(fireEvent.keyDown(austin, { key: " " })).toBe(true);
    expect(austin.getAttribute("aria-pressed")).toBe("false");
  });

  it("moves focus to the search box when Clear filters removes itself", async () => {
    render(<Grid />);
    const popup = await openFilter();
    fireEvent.click(option(popup, /^Denver/));
    const clear = within(popup).getByRole("button", { name: "Clear filters" });
    expect(clear.tagName).toBe("BUTTON");

    act(() => clear.focus());
    fireEvent.click(clear);

    expect(option(popup, /^Denver/).getAttribute("aria-pressed")).toBe("false");
    expect(
      within(popup).queryByRole("button", { name: "Clear filters" }),
    ).toBeNull();
    expect(document.activeElement).toBe(
      within(popup).getByRole("textbox", { name: "Search City options" }),
    );
  });
});
