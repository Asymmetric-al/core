// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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

import { DataTableFacetedFilter } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-faceted-filter";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Entry = { status: string };
const data = [{ status: "a" }, { status: "a" }, { status: "p" }];
const columns: ColumnDef<Entry>[] = [
  { accessorKey: "status", filterFn: "arrIncludesSome" },
];
const options = [
  { value: "a", label: "Active" },
  { value: "p", label: "Pending" },
];

function Harness({ disabled = false }: { disabled?: boolean }) {
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<Entry>(),
    data,
    columns,
    initialState: { columnFilters: [{ id: "status", value: ["a"] }] },
    autoResetPageIndex: false,
  });
  return (
    <>
      <DataTableFacetedFilter
        column={table.getColumn("status")}
        title="Status"
        options={options}
        disabled={disabled}
      />
      <output aria-label="Filters">
        {JSON.stringify(table.state.columnFilters)}
      </output>
    </>
  );
}

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollIntoViewDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("table faceted filter", () => {
  it("announces persistent selections and adds filtered results with the keyboard", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const listbox = await screen.findByRole("listbox");
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
    const active = screen.getByRole("option", { name: /Active/ });
    expect(active.getAttribute("aria-selected")).toBe("true");
    expect(active.textContent).toContain("2");
    const search = screen.getByRole("combobox", { name: "Search status" });
    fireEvent.change(search, { target: { value: "Pending" } });
    const pending = await screen.findByRole("option", { name: /Pending/ });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect(search.getAttribute("aria-activedescendant")).toBe(pending.id),
    );
    fireEvent.keyDown(search, { key: "Enter" });
    expect(pending.getAttribute("aria-selected")).toBe("true");
    expect(search).toHaveProperty("value", "Pending");
    expect(screen.getByLabelText("Filters").textContent).toBe(
      '[{"id":"status","value":["a","p"]}]',
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByLabelText("Filters").textContent).toBe("[]");
  });

  it("keeps disabled filters closed", () => {
    render(<Harness disabled />);
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("returns focus to search when the focused clear button is removed", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const search = await screen.findByRole("combobox", {
      name: "Search status",
    });
    const clear = screen.getByRole("button", { name: "Clear filters" });
    act(() => clear.focus());
    expect(document.activeElement).toBe(clear);

    fireEvent.click(clear);

    expect(screen.getByLabelText("Filters").textContent).toBe("[]");
    await waitFor(() => expect(document.activeElement).toBe(search));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    fireEvent.change(search, { target: { value: "Active" } });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(screen.getByLabelText("Filters").textContent).toBe(
      '[{"id":"status","value":["a"]}]',
    );
  });
});
