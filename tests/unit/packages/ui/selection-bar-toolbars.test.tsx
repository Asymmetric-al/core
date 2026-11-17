// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { checkPattern } from "@ui-sdk/core/testing";
import { useState } from "react";
import { createPortal } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSelectionBar,
  createDataGridSelectionColumn,
  dataGridFeatures,
  useTable as useGridTable,
} from "../../../../packages/ui/components/data-grid-panel";
import { Button } from "../../../../packages/ui/components/shadcn/button";
import { DataTableActionBar } from "../../../../packages/ui/components/shadcn/data-table/data-table-action-bar";
import { DataTableFloatingBar } from "../../../../packages/ui/components/shadcn/data-table/data-table-floating-bar";
import {
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

import type {
  DataGridColumnDef,
  RowSelectionState,
} from "../../../../packages/ui/components/data-grid-panel";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  }));
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

const BAR_NAME = "Selected record actions";

/** Every element inside `root` that Tab would stop on. */
function tabStops(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      "button, a[href], input, select, textarea, [tabindex]",
    ),
  ).filter((element) => element.tabIndex >= 0 && !element.matches(":disabled"));
}

async function expectToolbarPattern(bar: HTMLElement) {
  await act(async () => {
    await checkPattern(bar, "toolbar");
  });
  expect(tabStops(bar)).toHaveLength(1);
  expect(bar.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
}

function focus(element: HTMLElement) {
  act(() => element.focus());
}

/** Base UI moves roving focus in a microtask after the key press. */
async function press(key: string) {
  await act(async () => {
    fireEvent.keyDown(document.activeElement!, { key });
  });
}

interface Person {
  id: string;
  name: string;
}

const PEOPLE: Person[] = [
  { id: "p1", name: "Avery Lopez" },
  { id: "p2", name: "Maya Chen" },
  { id: "p3", name: "Jonah Reyes" },
];

// Module scope: stable cell renderers keep a row's controls mounted while
// the selection changes, as memoized app columns do.
const PEOPLE_COLUMNS: DataGridColumnDef<Person>[] = [
  createDataGridSelectionColumn<Person>({
    getRowLabel: (person) => person.name,
  }),
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <DataGridRowPrimary>{row.original.name}</DataGridRowPrimary>
    ),
  },
];

/**
 * A bulk action that is not a plain Button and opens portaled UI, as Web
 * Studio's Payload bulk actions open an edit drawer.
 */
function PortaledDrawer({ onSave }: { onSave: () => void }) {
  return createPortal(
    <div role="dialog" aria-label="Edit people">
      <input aria-label="Title" defaultValue="Draft title" />
      <button type="button" onClick={onSave}>
        Save
      </button>
    </div>,
    document.body,
  );
}

/** The selection bar in the real panel, with bulk actions as apps pass them. */
function PeopleGrid({ drawer = false }: { drawer?: boolean }) {
  const [people, setPeople] = useState(PEOPLE);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useGridTable({
    features: dataGridFeatures,
    data: people,
    columns: PEOPLE_COLUMNS,
    getRowId: (row) => row.id,
    manualPagination: true,
    enableRowSelection: true,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });
  return (
    <DataGridPanel
      table={table}
      recordCount={people.length}
      label="People"
      toolbar={<input type="search" aria-label="Search people" />}
      selectionBar={
        <DataGridSelectionBar
          count={Object.keys(rowSelection).length}
          noun="person"
          onClear={() => setRowSelection({})}
        >
          {drawer ? (
            <PortaledDrawer onSave={() => setRowSelection({})} />
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRowSelection({})}
          >
            Archive
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setPeople((current) =>
                current.filter((person) => !rowSelection[person.id]),
              );
              setRowSelection({});
            }}
          >
            Delete
          </Button>
        </DataGridSelectionBar>
      }
    />
  );
}

describe("DataGridSelectionBar", () => {
  it("is a named toolbar with one tab stop, arrow keys, Home and End", async () => {
    render(
      <DataGridSelectionBar count={2} noun="gift" onClear={vi.fn()}>
        <p>1 hidden by filters won&apos;t be included</p>
        <Button size="sm">Send receipts…</Button>
        <Button size="sm" variant="outline">
          Export
        </Button>
      </DataGridSelectionBar>,
    );
    const bar = screen.getByRole("toolbar", { name: BAR_NAME });
    await expectToolbarPattern(bar);
    // The count names the bar's group; the hint is text beside the toolbar.
    const group = screen.getByRole("group", { name: "2 gifts selected" });
    expect(group.contains(bar)).toBe(true);
    expect(group.querySelectorAll('[role="toolbar"]')).toHaveLength(1);
  });

  it("takes the caller's Button children as toolbar items and leaves other content alone", async () => {
    const onSend = vi.fn();
    render(
      <DataGridSelectionBar count={2} noun="gift" onClear={vi.fn()}>
        <p>1 hidden by filters won&apos;t be included</p>
        <Button size="sm" onClick={onSend}>
          Send receipts…
        </Button>
        <Button size="sm" variant="outline" disabled>
          Export
        </Button>
        {["Archive"].map((label) => (
          <Button key={label} size="sm" variant="outline">
            {label}
          </Button>
        ))}
      </DataGridSelectionBar>,
    );
    const bar = screen.getByRole("toolbar", { name: BAR_NAME });
    const send = within(bar).getByRole("button", { name: "Send receipts…" });
    const exportButton = within(bar).getByRole("button", { name: "Export" });
    const archive = within(bar).getByRole("button", { name: "Archive" });
    const clear = within(bar).getByRole("button", { name: "Clear selection" });

    expect(tabStops(bar)).toEqual([send]);
    // The count and the hint are text, not controls.
    expect(screen.getByText("2 gifts selected").hasAttribute("tabindex")).toBe(
      false,
    );
    expect(
      screen
        .getByText("1 hidden by filters won't be included")
        .hasAttribute("tabindex"),
    ).toBe(false);
    // A disabled action stays disabled, as the caller wrote it.
    expect(exportButton.hasAttribute("disabled")).toBe(true);

    focus(send);
    await press("ArrowRight");
    expect(document.activeElement).toBe(archive);
    await press("End");
    expect(document.activeElement).toBe(clear);
    await press("Home");
    expect(document.activeElement).toBe(send);
    expect(tabStops(bar)).toEqual([send]);

    fireEvent.click(send);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("returns focus to the row control it came from when Clear selection removes the bar", () => {
    render(<PeopleGrid />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Select Avery Lopez",
    });
    fireEvent.click(checkbox);
    focus(checkbox);
    const clear = screen.getByRole("button", { name: "Clear selection" });
    focus(clear);

    fireEvent.click(clear);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(checkbox);
  });

  it("returns focus after a bulk action that clears the selection", () => {
    render(<PeopleGrid />);
    const row = screen.getByRole("button", { name: "Maya Chen" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Maya Chen" }));
    focus(row);
    const archive = screen.getByRole("button", { name: "Archive" });
    focus(archive);

    fireEvent.click(archive);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(row);
  });

  it("falls back to the grid's first row when the row it came from is gone", async () => {
    render(<PeopleGrid />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Select Avery Lopez",
    });
    fireEvent.click(checkbox);
    focus(checkbox);
    const remove = screen.getByRole("button", { name: "Delete" });
    focus(remove);

    // Removes Avery's row and clears the selection in one update.
    await act(async () => {
      fireEvent.click(remove);
    });

    expect(screen.queryByRole("button", { name: "Avery Lopez" })).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Maya Chen" }),
    );
  });

  it("returns focus to the grid, not to a panel control passed on the way to the bar", () => {
    render(<PeopleGrid />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Maya Chen" }));
    // Shift+Tab from the rows passes the panel toolbar before the bar.
    focus(screen.getByRole("searchbox", { name: "Search people" }));
    const clear = screen.getByRole("button", { name: "Clear selection" });
    focus(clear);

    fireEvent.click(clear);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Avery Lopez" }),
    );
  });

  it("keeps a non-Button child's own controls out of the toolbar, so the toolbar claims only its items", async () => {
    render(
      <DataGridSelectionBar count={1} noun="page" onClear={vi.fn()}>
        <span>
          <button type="button">Publish</button>
          <button type="button">Delete</button>
        </span>
        <Button size="sm">Export</Button>
      </DataGridSelectionBar>,
    );
    const bar = screen.getByRole("toolbar", { name: BAR_NAME });
    await expectToolbarPattern(bar);
    expect(within(bar).queryByRole("button", { name: "Publish" })).toBeNull();
    const group = screen.getByRole("group", { name: "1 page selected" });
    expect(
      within(group).getByRole("button", { name: "Publish" }).tabIndex,
    ).toBe(0);
  });

  it("keeps portaled content of a non-Button child out of the toolbar's keys and focus handling", async () => {
    render(<PeopleGrid drawer />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Maya Chen" }));
    const drawer = screen.getByRole("dialog", { name: "Edit people" });
    const title = within(drawer).getByRole("textbox", { name: "Title" });
    const save = within(drawer).getByRole("button", { name: "Save" });

    focus(title);
    // The toolbar would select a text field's whole value on focus.
    expect(title.selectionStart).toBe(title.selectionEnd);

    focus(save);
    for (const key of ["Home", "End", "ArrowRight", "ArrowLeft"]) {
      let notPrevented = false;
      await act(async () => {
        notPrevented = fireEvent.keyDown(save, { key });
      });
      expect(notPrevented, key).toBe(true);
      expect(document.activeElement, key).toBe(save);
    }
  });

  it("returns focus to the grid when the bar goes away while focus is in portaled content", () => {
    render(<PeopleGrid drawer />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Select Avery Lopez",
    });
    fireEvent.click(checkbox);
    focus(checkbox);
    const save = screen.getByRole("button", { name: "Save" });
    focus(save);

    fireEvent.click(save);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(checkbox);
  });

  it("leaves focus alone when the bar goes away while focus is elsewhere", () => {
    render(<PeopleGrid />);
    const checkbox = screen.getByRole("checkbox", {
      name: "Select Avery Lopez",
    });
    fireEvent.click(checkbox);
    focus(checkbox);
    focus(screen.getByRole("button", { name: "Clear selection" }));
    const elsewhere = screen.getByRole("button", { name: "Jonah Reyes" });
    focus(elsewhere);

    // Unchecking the row empties the selection without touching focus.
    fireEvent.click(checkbox);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
  });
});

type RecordRow = { id: string; name: string };

const RECORDS: RecordRow[] = [
  { id: "one", name: "First record" },
  { id: "two", name: "Second record" },
];
const RECORD_COLUMNS = [{ accessorKey: "name", header: "Name" }];

/** A real table with both rows selected; every bulk action clears it. */
function TableBar({
  Bar,
  actionLabels,
}: {
  Bar: typeof DataTableActionBar | typeof DataTableFloatingBar;
  actionLabels: string[];
}) {
  const table = useTable({
    features: dataTableFeatures,
    data: RECORDS,
    columns: RECORD_COLUMNS,
    getRowId: (row) => row.id,
    initialState: { rowSelection: { one: true, two: true } },
    enableRowSelection: true,
  });
  const clear = () => table.toggleAllPageRowsSelected(false);
  return (
    <>
      <button type="button">Row control</button>
      <button type="button" onClick={clear}>
        Deselect all
      </button>
      <Bar
        table={table}
        actions={actionLabels.map((label) => ({ label, onClick: clear }))}
      />
    </>
  );
}

describe.each([
  ["DataTableActionBar", DataTableActionBar],
  ["DataTableFloatingBar", DataTableFloatingBar],
] as const)("%s", (_name, Bar) => {
  it("is a named toolbar with one tab stop, arrow keys, Home and End", async () => {
    render(<TableBar Bar={Bar} actionLabels={["Archive", "Export"]} />);
    await expectToolbarPattern(screen.getByRole("toolbar", { name: BAR_NAME }));
  });

  it("returns focus to where it came from when Clear selection removes the bar", () => {
    render(<TableBar Bar={Bar} actionLabels={["Archive"]} />);
    const row = screen.getByRole("button", { name: "Row control" });
    focus(row);
    const clear = screen.getByRole("button", { name: "Clear selection" });
    focus(clear);

    fireEvent.click(clear);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(row);
  });

  it("returns focus after a bulk action that clears the selection", () => {
    render(<TableBar Bar={Bar} actionLabels={["Archive"]} />);
    const row = screen.getByRole("button", { name: "Row control" });
    focus(row);
    const archive = screen.getByRole("button", { name: "Archive" });
    focus(archive);

    fireEvent.click(archive);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(row);
  });

  it("leaves focus alone when the bar goes away while focus is elsewhere", () => {
    render(<TableBar Bar={Bar} actionLabels={["Archive"]} />);
    focus(screen.getByRole("button", { name: "Row control" }));
    focus(screen.getByRole("button", { name: "Clear selection" }));
    const elsewhere = screen.getByRole("button", { name: "Deselect all" });
    focus(elsewhere);

    fireEvent.click(elsewhere);

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
  });
});

describe("DataTableFloatingBar overflow menu", () => {
  it("keeps the overflow trigger in the toolbar's single tab stop", async () => {
    render(
      <TableBar
        Bar={DataTableFloatingBar}
        actionLabels={["Archive", "Export", "Publish", "Delete"]}
      />,
    );
    const bar = screen.getByRole("toolbar", { name: BAR_NAME });
    const archive = within(bar).getByRole("button", { name: "Archive" });
    const more = within(bar).getByRole("button", { name: "Open actions" });
    expect(tabStops(bar)).toEqual([archive]);

    focus(archive);
    await press("ArrowRight");
    await press("ArrowRight");
    expect(document.activeElement).toBe(more);
    expect(tabStops(bar)).toEqual([more]);
  });

  it("returns focus after an action chosen from the overflow menu clears the selection", async () => {
    render(
      <TableBar
        Bar={DataTableFloatingBar}
        actionLabels={["Archive", "Export", "Publish"]}
      />,
    );
    const row = screen.getByRole("button", { name: "Row control" });
    focus(row);
    const more = screen.getByRole("button", { name: "Open actions" });
    focus(more);
    fireEvent.click(more);
    const publish = await screen.findByRole("menuitem", { name: "Publish" });
    focus(publish);

    await act(async () => {
      fireEvent.click(publish);
    });

    expect(screen.queryByRole("toolbar", { name: BAR_NAME })).toBeNull();
    expect(document.activeElement).toBe(row);
  });
});
