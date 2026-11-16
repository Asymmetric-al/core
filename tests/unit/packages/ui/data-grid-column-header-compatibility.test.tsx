// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  Subscribe,
  useTable,
} from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import {
  DataGrid,
  dataGridFeatures,
} from "../../../../packages/ui/components/reui/data-grid/data-grid";
import { DataGridColumnHeader } from "../../../../packages/ui/components/reui/data-grid/data-grid-column-header";

import type { DataGridColumnDef } from "../../../../packages/ui/components/data-grid-panel/data-grid-engine";
import type { DataGridI18nOverrides } from "../../../../packages/ui/components/reui/data-grid/data-grid-i18n";
import type { ReactNode } from "react";

interface Person {
  id: string;
  name: string;
  hidden: string;
  pinned: string;
  email: string;
  city: string;
}

const rows: Person[] = [
  {
    id: "one",
    name: "Person",
    hidden: "Hidden detail",
    pinned: "Reference",
    email: "person@example.test",
    city: "City",
  },
];
const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", meta: { headerTitle: "Person name" } },
  { accessorKey: "hidden", header: "Hidden detail" },
  { accessorKey: "pinned", header: "Reference" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "city", header: "City" },
];
const initialState = {
  columnVisibility: { hidden: false },
  columnPinning: { start: ["pinned"], end: [] },
};
const tableLayout = {
  columnsMovable: true,
  columnsPinnable: true,
  columnsVisibility: true,
  columnsResizable: true,
};

function HeaderFixture({
  definitions = columns,
  filter,
  i18n,
  title,
}: {
  definitions?: DataGridColumnDef<Person>[];
  filter?: ReactNode;
  i18n?: DataGridI18nOverrides;
  title?: string;
}) {
  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: definitions,
    initialState,
  });
  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      tableLayout={tableLayout}
      i18n={i18n}
    >
      <Subscribe
        source={table.store}
        selector={(state) => ({
          sorting: state.sorting,
          columnOrder: state.columnOrder,
          columnPinning: state.columnPinning,
          columnVisibility: state.columnVisibility,
        })}
      >
        {(state) => (
          <div data-slot="scroll-area-viewport" tabIndex={-1}>
            {[
              ...table.getStartVisibleLeafColumns(),
              ...table.getCenterVisibleLeafColumns(),
              ...table.getEndVisibleLeafColumns(),
            ].map((column) => (
              <DataGridColumnHeader
                key={`${column.getIsPinned() || "center"}-${column.id}`}
                column={column}
                visibility
                filter={column.id === "name" ? filter : undefined}
                title={column.id === "name" ? title : undefined}
              />
            ))}
            <output aria-label="Column order">
              {JSON.stringify(state.columnOrder)}
            </output>
            <output aria-label="Column sorting">
              {JSON.stringify(state.sorting)}
            </output>
            <output aria-label="Column pinning">
              {JSON.stringify(state.columnPinning)}
            </output>
            <output aria-label="Column visibility">
              {JSON.stringify(state.columnVisibility)}
            </output>
          </div>
        )}
      </Subscribe>
    </DataGrid>
  );
}

const animationDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "getAnimations",
);

beforeEach(() => {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterEach(() => {
  cleanup();
  if (animationDescriptor)
    Object.defineProperty(
      Element.prototype,
      "getAnimations",
      animationDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "getAnimations");
});

async function openHeader(name = "Person name") {
  const trigger = screen.getByRole("button", { name, exact: true });
  fireEvent.click(trigger);
  return screen.findByRole("menu");
}

async function clickAction(name: string) {
  fireEvent.click(await screen.findByRole("menuitem", { name, exact: true }));
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

describe("DataGridColumnHeader builder compatibility", () => {
  it("keeps filter controls before sort actions and toggles current sorting", async () => {
    render(<HeaderFixture filter={<input aria-label="Filter people" />} />);
    const menu = await openHeader();
    const filter = screen.getByRole("textbox", { name: "Filter people" });
    const ascending = screen.getByRole("menuitem", { name: "Asc" });
    expect(menu.contains(filter)).toBe(true);
    expect(
      filter.compareDocumentPosition(ascending) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    await clickAction("Asc");
    expect(screen.getByLabelText("Column sorting").textContent).toBe(
      '[{"id":"name","desc":false}]',
    );
    await openHeader();
    await clickAction("Asc");
    expect(screen.getByLabelText("Column sorting").textContent).toBe("[]");
    await openHeader();
    await clickAction("Desc");
    expect(screen.getByLabelText("Column sorting").textContent).toBe(
      '[{"id":"name","desc":true}]',
    );
  });

  it("completes omitted order and moves beside visible unpinned peers without shuffling other columns", async () => {
    render(<HeaderFixture />);
    expect(screen.getByLabelText("Column order").textContent).toBe("[]");
    await openHeader();
    expect(
      screen
        .getByRole("menuitem", { name: "Move to left" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    await clickAction("Move to right");
    expect(screen.getByLabelText("Column order").textContent).toBe(
      '["hidden","pinned","email","name","city"]',
    );
    await openHeader("Email");
    expect(
      screen
        .getByRole("menuitem", { name: "Move to left" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("moves a spanned header and its covered leaf as one unit", async () => {
    const definitions: DataGridColumnDef<Person>[] = [
      { accessorKey: "name", header: "Name", meta: { headerColSpan: 2 } },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "city", header: "City" },
    ];
    render(<HeaderFixture definitions={definitions} />);
    await openHeader("Name");
    await clickAction("Move to right");
    expect(screen.getByLabelText("Column order").textContent).toBe(
      '["city","name","email"]',
    );
  });

  it("refreshes labels, filter content, and visibility checkbox state through the same header", async () => {
    const view = render(
      <HeaderFixture filter={<input aria-label="Original filter" />} />,
    );
    await openHeader();
    view.rerender(
      <HeaderFixture
        title="Renamed person"
        filter={<input aria-label="Current filter" />}
        i18n={{
          labels: {
            sortAscending: "Ascending now",
            columnsMenu: "Visible fields",
          },
        }}
      />,
    );
    expect(
      await screen.findByRole("menuitem", { name: "Ascending now" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("menuitem", { name: "Asc", exact: true }),
    ).toBeNull();
    expect(
      screen.queryByRole("textbox", { name: "Original filter" }),
    ).toBeNull();
    expect(
      screen.getByRole("textbox", { name: "Current filter" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Renamed person", exact: true }),
    ).toBeTruthy();
    fireEvent.keyDown(
      screen.getByRole("menuitem", { name: "Visible fields" }),
      { key: "ArrowRight" },
    );
    const hidden = await screen.findByRole("menuitemcheckbox", {
      name: "Hidden detail",
    });
    expect(hidden.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(hidden);
    await waitFor(() =>
      expect(screen.getByLabelText("Column visibility").textContent).toBe(
        '{"hidden":true}',
      ),
    );
    expect(
      screen
        .getByRole("menuitemcheckbox", { name: "Hidden detail" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Person name" }),
    ).toBeTruthy();
  });

  it("preserves pin actions and hands unpin focus to the remounted header", async () => {
    render(<HeaderFixture />);
    await openHeader();
    await clickAction("Pin to left");
    expect(screen.getByLabelText("Column pinning").textContent).toBe(
      '{"start":["pinned","name"],"end":[]}',
    );
    await openHeader();
    expect(
      screen
        .getByRole("menuitem", { name: "Move to right" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    fireEvent.click(
      screen.getByRole("button", { name: "Unpin Person name column" }),
    );
    expect(screen.getByLabelText("Column pinning").textContent).toBe(
      '{"start":["pinned"],"end":[]}',
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Person name", exact: true }),
      ),
    );
  });
});
