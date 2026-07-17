/** @vitest-environment jsdom */

/**
 * Smoke tests for the optional `devtoolsKey` prop on the shared `DataTable`.
 *
 * The TanStack Table devtools hook is called unconditionally inside the
 * table-creating components (gated by `enabled`), so these tests pin that a
 * table renders identically with and without a devtools key. Under vitest
 * (NODE_ENV !== "development") the adapter exports no-ops, matching
 * production behavior.
 */

import { cleanup, render, screen } from "@testing-library/react";
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

type Person = {
  id: string;
  name: string;
  role: string;
};

const people: Person[] = [
  { id: "p1", name: "Mallory", role: "Engineer" },
  { id: "p2", name: "Ada", role: "Scientist" },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];

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

describe("DataTable devtoolsKey", () => {
  it("renders rows when a devtoolsKey is provided", () => {
    render(
      <DataTable<Person, unknown>
        columns={columns}
        data={people}
        getRowId={(row) => row.id}
        devtoolsKey="test-table"
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByText("Mallory")).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
  });

  it("renders rows without a devtoolsKey", () => {
    render(
      <DataTable<Person, unknown>
        columns={columns}
        data={people}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeTruthy();
    expect(screen.getByText("Mallory")).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
  });
});
