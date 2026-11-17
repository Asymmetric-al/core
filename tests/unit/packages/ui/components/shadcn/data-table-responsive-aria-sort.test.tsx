/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableResponsive } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive";

import type {
  ColumnDef,
  SortingState,
} from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Person = { id: string; name: string; email: string; city: string };

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "email", header: "Email", enableSorting: false },
];

const data: Person[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.org", city: "London" },
  { id: "2", name: "Grace Hopper", email: "grace@example.org", city: "York" },
];

function installDesktopMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        }) satisfies Partial<MediaQueryList> as MediaQueryList,
    ),
  });
}

function renderSortedBy(sorting: SortingState) {
  installDesktopMatchMedia();
  render(
    <DataTableResponsive
      columns={columns}
      data={data}
      label="Partners"
      config={{
        enableFilters: false,
        enablePagination: false,
        enableRowSelection: false,
      }}
      initialState={{ sorting }}
      rowActions={[{ label: "Open", onClick: () => {} }]}
    />,
  );
  return (name: string) =>
    screen.getByRole("columnheader", { name }).getAttribute("aria-sort");
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DataTableResponsive sort state", () => {
  it("marks the column sorted ascending, and other sortable columns as not sorted", () => {
    const sortOf = renderSortedBy([{ id: "name", desc: false }]);
    expect(sortOf("Name")).toBe("ascending");
    expect(sortOf("City")).toBe("none");
    expect(sortOf("Email")).toBeNull();
    expect(sortOf("Actions")).toBeNull();
  });

  it("marks the column sorted descending", () => {
    const sortOf = renderSortedBy([{ id: "city", desc: true }]);
    expect(sortOf("City")).toBe("descending");
    expect(sortOf("Name")).toBe("none");
  });

  it("marks no column sorted before a sort is chosen", () => {
    const sortOf = renderSortedBy([]);
    expect(sortOf("Name")).toBe("none");
    expect(sortOf("City")).toBe("none");
    expect(sortOf("Email")).toBeNull();
  });
});
