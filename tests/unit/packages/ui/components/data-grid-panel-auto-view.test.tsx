// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DataGridPanel,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
} from "../../../../../packages/ui/components/data-grid-panel";

type Row = { id: string; name: string; owner: string };

const COLUMNS: DataGridColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", size: 400 },
  { accessorKey: "owner", header: "Owner", size: 400 },
];

const ROWS: Row[] = [
  { id: "1", name: "First", owner: "Ana" },
  { id: "2", name: "Second", owner: "Ben" },
];

let panelWidth = 1200;

function Grid() {
  const table = useTable({
    features: dataGridFeatures,
    data: ROWS,
    columns: COLUMNS,
    getRowId: (row) => row.id,
  });
  return (
    <DataGridPanel
      table={table}
      recordCount={ROWS.length}
      label="Things"
      view="auto"
      renderMobileRow={(row) => <p>Card {row.original.name}</p>}
    />
  );
}

beforeEach(() => {
  vi.stubGlobal("innerWidth", 1440);
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ width: panelWidth }) as DOMRect,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DataGridPanel auto view", () => {
  it("shows the table when every visible column fits", () => {
    panelWidth = 1200;
    render(<Grid />);
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.queryByText("Card First")).toBeNull();
  });

  it("shows cards instead of a sideways-scrolling table when the columns do not fit", () => {
    panelWidth = 700;
    render(<Grid />);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("Card First")).toBeTruthy();
  });
});
