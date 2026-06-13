/** @vitest-environment jsdom */

/**
 * Characterization tests for the shared `DataTable` component.
 *
 * These pin the CURRENT user-visible behavior of the TanStack Table v8 layer
 * ahead of the v9 engine migration. They only assert what a user sees
 * (rendered rows, headers, roles, labels) through the public `DataTable`
 * props, so they must keep passing unchanged after the engine swap.
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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

import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/types";
import type * as React from "react";

type Person = {
  id: string;
  name: string;
  role: string;
  age: number;
};

const people: Person[] = [
  { id: "p1", name: "Mallory", role: "Engineer", age: 41 },
  { id: "p2", name: "Ada", role: "Scientist", age: 36 },
  { id: "p3", name: "Zoe", role: "Designer", age: 29 },
  { id: "p4", name: "Grace", role: "Admiral", age: 52 },
  { id: "p5", name: "Linus", role: "Maintainer", age: 33 },
  { id: "p6", name: "Edsger", role: "Theorist", age: 58 },
  { id: "p7", name: "Barbara", role: "Architect", age: 47 },
  { id: "p8", name: "Katherine", role: "Analyst", age: 44 },
  { id: "p9", name: "Alan", role: "Cryptographer", age: 39 },
  { id: "p10", name: "Donald", role: "Author", age: 61 },
];

const namesInDataOrder = people.map((person) => person.name);
const namesAscending = [
  "Ada",
  "Alan",
  "Barbara",
  "Donald",
  "Edsger",
  "Grace",
  "Katherine",
  "Linus",
  "Mallory",
  "Zoe",
];
const namesDescending = [...namesAscending].reverse();

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
      </button>
    ),
  },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "age", header: "Age" },
];

type PeopleTableProps = React.ComponentProps<typeof DataTable<Person, unknown>>;

function renderPeopleTable(overrides: Partial<PeopleTableProps> = {}) {
  return render(
    <DataTable<Person, unknown>
      columns={columns}
      data={people}
      getRowId={(row) => row.id}
      searchColumnId="name"
      searchPlaceholder="Search names"
      {...overrides}
    />,
  );
}

/** Names visible in the table body, in row order. */
function visibleNames(container: HTMLElement): string[] {
  const rows = Array.from(container.querySelectorAll("tbody tr"));
  return rows
    .map(
      (row) =>
        people.find((person) => row.textContent?.includes(person.name))?.name,
    )
    .filter((name): name is string => name !== undefined);
}

function rowByName(container: HTMLElement, name: string): HTMLElement {
  const row = Array.from(container.querySelectorAll("tbody tr")).find((tr) =>
    tr.textContent?.includes(name),
  );
  if (!row) {
    throw new Error(`No rendered row contains "${name}"`);
  }
  return row as HTMLElement;
}

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

describe("DataTable rendering", () => {
  it("renders a header for each column, a select-all header, and a row per data item", () => {
    const { container } = renderPeopleTable();

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Role" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Age" })).toBeTruthy();
    // Row selection is enabled by default, which injects a select column.
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeTruthy();

    expect(visibleNames(container)).toEqual(namesInDataOrder);
  });

  it("shows the default empty state when data is empty", () => {
    renderPeopleTable({ data: [] });

    expect(screen.getByText("No results found")).toBeTruthy();
  });

  it("renders a caller-provided empty state instead of the default", () => {
    renderPeopleTable({ data: [], emptyState: <p>Nobody here yet</p> });

    expect(screen.getByText("Nobody here yet")).toBeTruthy();
    expect(screen.queryByText("No results found")).toBeNull();
  });

  it("hides a column's header when initialState marks it not visible", () => {
    renderPeopleTable({ initialState: { columnVisibility: { age: false } } });

    expect(screen.queryByRole("columnheader", { name: "Age" })).toBeNull();
    expect(screen.getByRole("columnheader", { name: "Role" })).toBeTruthy();
  });
});

describe("DataTable sorting", () => {
  it("clicking a sortable column header sorts ascending, then toggles descending", () => {
    const { container } = renderPeopleTable();
    const nameHeaderButton = screen.getByRole("button", { name: "Name" });

    expect(visibleNames(container)).toEqual(namesInDataOrder);

    fireEvent.click(nameHeaderButton);
    expect(visibleNames(container)).toEqual(namesAscending);

    fireEvent.click(nameHeaderButton);
    expect(visibleNames(container)).toEqual(namesDescending);
  });

  it("keeps row selection attached to the same row identity after sorting", () => {
    const { container } = renderPeopleTable();

    const malloryCheckbox = within(rowByName(container, "Mallory")).getByRole(
      "checkbox",
      { name: "Select row" },
    );
    fireEvent.click(malloryCheckbox);

    expect(screen.getByText("1 of 10 row(s) selected")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Name" }));

    // Mallory moved from first to ninth, but stays the selected row.
    expect(visibleNames(container)[8]).toBe("Mallory");
    const malloryRow = rowByName(container, "Mallory");
    expect(malloryRow.getAttribute("data-state")).toBe("selected");
    expect(rowByName(container, "Ada").getAttribute("data-state")).not.toBe(
      "selected",
    );
    expect(screen.getByText("1 of 10 row(s) selected")).toBeTruthy();
  });
});

describe("DataTable searching", () => {
  it("filters rows when searching by name, case-insensitively", () => {
    const { container } = renderPeopleTable();
    const searchInput = screen.getByPlaceholderText("Search names");

    fireEvent.change(searchInput, { target: { value: "gra" } });

    expect(visibleNames(container)).toEqual(["Grace"]);
  });

  it("shows the default empty state when the search matches no rows", () => {
    const { container } = renderPeopleTable();
    const searchInput = screen.getByPlaceholderText("Search names");

    fireEvent.change(searchInput, { target: { value: "zzz" } });

    expect(visibleNames(container)).toEqual([]);
    expect(screen.getByText("No results found")).toBeTruthy();
  });

  it("clears the search and restores all rows via the reset filters button", () => {
    const { container } = renderPeopleTable();
    const searchInput = screen.getByPlaceholderText("Search names");

    fireEvent.change(searchInput, { target: { value: "gra" } });
    expect(visibleNames(container)).toEqual(["Grace"]);

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(visibleNames(container)).toEqual(namesInDataOrder);
    expect((searchInput as HTMLInputElement).value).toBe("");
  });

  it("returns the user to the first page when a search filter is applied", async () => {
    const { container } = renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    });

    // Yield once after mount so the engine can arm its auto page reset
    // (it registers in a microtask); real user interaction always comes later.
    await screen.findByText("Page 1 of 2");

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(screen.getByText("Page 2 of 2")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Search names"), {
      target: { value: "Mallory" },
    });

    // The engine applies the page reset in a queued microtask, not synchronously.
    expect(await screen.findByText("Page 1 of 1")).toBeTruthy();
    expect(visibleNames(container)).toEqual(["Mallory"]);
  });
});

describe("DataTable pagination", () => {
  it("pages forward and backward with the next and previous buttons", () => {
    const { container } = renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    });

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    const previousButton = screen.getByRole("button", {
      name: "Go to previous page",
    });

    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    expect(visibleNames(container)).toEqual(namesInDataOrder.slice(0, 5));
    expect((previousButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(nextButton);

    expect(screen.getByText("Page 2 of 2")).toBeTruthy();
    expect(visibleNames(container)).toEqual(namesInDataOrder.slice(5, 10));
    expect((nextButton as HTMLButtonElement).disabled).toBe(true);
    expect((previousButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(previousButton);

    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    expect(visibleNames(container)).toEqual(namesInDataOrder.slice(0, 5));
  });

  it("changes the number of visible rows via the rows-per-page selector", async () => {
    const { container } = renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    });

    expect(visibleNames(container)).toHaveLength(5);

    fireEvent.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "20" });
    fireEvent.click(option);

    expect(visibleNames(container)).toEqual(namesInDataOrder);
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  });
});

describe("DataTable row selection", () => {
  it("select-all selects only the current page's rows and shows the selected count", () => {
    const { container } = renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(screen.getByText("5 of 10 row(s) selected")).toBeTruthy();

    const rowCheckboxes = screen.getAllByRole("checkbox", {
      name: "Select row",
    });
    expect(rowCheckboxes).toHaveLength(5);
    for (const checkbox of rowCheckboxes) {
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
    }
    for (const name of namesInDataOrder.slice(0, 5)) {
      expect(rowByName(container, name).getAttribute("data-state")).toBe(
        "selected",
      );
    }
  });

  it("shows the action bar with the selected count and clears the selection", () => {
    renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    });

    expect(screen.queryByText("selected")).toBeNull();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

    // Action bar renders "<count> selected" as two sibling text nodes.
    expect(screen.getByText("selected")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(screen.queryByText("selected")).toBeNull();
    expect(screen.getByText("0 of 10 row(s) selected")).toBeTruthy();
  });

  it("passes the selected original rows to action bar actions", () => {
    const onArchive = vi.fn();
    renderPeopleTable({
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
      actionBarActions: [{ label: "Archive", onClick: onArchive }],
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onArchive).toHaveBeenCalledWith(people.slice(0, 5));
  });
});

describe("DataTable column visibility", () => {
  it("hides a column when it is unchecked in the View options menu", async () => {
    renderPeopleTable();

    expect(screen.getByRole("columnheader", { name: "Role" })).toBeTruthy();

    const viewButton = screen.getByRole("button", { name: "Toggle columns" });
    fireEvent.keyDown(viewButton, { key: "Enter" });

    const roleMenuItem = await screen.findByRole("menuitemcheckbox", {
      name: "role",
    });
    // The injected select column is not offered in the menu.
    expect(
      screen.queryByRole("menuitemcheckbox", { name: "select" }),
    ).toBeNull();

    fireEvent.click(roleMenuItem);

    expect(screen.queryByRole("columnheader", { name: "Role" })).toBeNull();
    expect(screen.queryByText("Engineer")).toBeNull();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
  });
});
