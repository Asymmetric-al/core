// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataGrid } from "../../../../packages/ui/components/shadcn/data-grid/data-grid";

const data = [{ name: "Fixture member", email: "fixture@example.invalid" }];
const columns = [
  { id: "name", header: "Name", accessorKey: "name" as const },
  { id: "email", header: "Email", accessorKey: "email" as const },
];
const config = { virtualizeRows: false, enableSelection: false };

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

describe("shared grid header access", () => {
  it("exposes the displayed column names as headers in a grid row", () => {
    render(<DataGrid data={data} columns={columns} config={config} />);
    const grid = screen.getByRole("grid", { name: "Data grid" });
    const headers = within(grid).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Name",
      "Email",
    ]);
    expect(
      headers.every(
        (header) => header.parentElement?.getAttribute("role") === "row",
      ),
    ).toBe(true);
  });
});
