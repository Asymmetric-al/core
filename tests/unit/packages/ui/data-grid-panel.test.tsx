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
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridSortSelect,
  DataGridViewOptions,
  DataGridViewToggle,
  createDataGridSelectionColumn,
  dataGridFeatures,
  handleDataGridRowKeyDown,
  useTable,
} from "../../../../packages/ui/components/data-grid-panel";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "../../../../packages/ui/components/reui/data-grid/data-grid-table";
import { Checkbox } from "../../../../packages/ui/components/shadcn/checkbox";

import type {
  DataGridColumnDef,
  DataGridPanelProps,
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

function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `person-${index}`,
    name: `Person ${index + 1}`,
    city: "Austin",
  }));
}

function Grid({
  data = PEOPLE,
  recordCount = data.length,
  onOpen = () => {},
  selectable = false,
  namedSelection = false,
  error,
  empty,
  view,
  cardLayout,
  labelledBy,
  footer,
  pagination,
  onRowAction,
  toolbar,
  isLoading,
  virtual,
}: {
  data?: Person[];
  recordCount?: number;
  onOpen?: (person: Person) => void;
  selectable?: boolean;
  namedSelection?: boolean;
  error?: { message: string; onRetry?: () => void; retryLabel?: string };
  empty?: React.ReactNode;
  view?: "table" | "list";
  cardLayout?: DataGridPanelProps<Person>["cardLayout"];
  labelledBy?: string;
  footer?: React.ReactNode;
  pagination?: boolean;
  onRowAction?: (person: Person) => void;
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  virtual?: DataGridPanelProps<Person>["virtual"];
}) {
  const [rowSelection, setRowSelection] = useState({});
  const columns: DataGridColumnDef<Person>[] = [
    ...(namedSelection
      ? [
          createDataGridSelectionColumn<Person>({
            getRowLabel: (person) => person.name,
          }),
        ]
      : []),
    ...(selectable && !namedSelection
      ? [
          {
            id: "select",
            header: () => <DataGridTableRowSelectAll />,
            cell: ({ row }) => <DataGridTableRowSelect row={row} />,
            size: 40,
          } satisfies DataGridColumnDef<Person>,
        ]
      : []),
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <DataGridRowPrimary onClick={() => onOpen(row.original)}>
          {row.original.name}
        </DataGridRowPrimary>
      ),
    },
    { accessorKey: "city", header: "City" },
    ...(onRowAction
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <button type="button" onClick={() => onRowAction(row.original)}>
                {`More for ${row.original.name}`}
              </button>
            ),
          } satisfies DataGridColumnDef<Person>,
        ]
      : []),
  ];
  const table = useTable({
    features: dataGridFeatures,
    data,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    enableRowSelection: selectable || namedSelection,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });
  const selected = Object.keys(rowSelection).length;
  return (
    <DataGridPanel
      table={table}
      recordCount={recordCount}
      label="People"
      labelledBy={labelledBy}
      onRowClick={onOpen}
      error={error}
      empty={empty}
      view={view}
      cardLayout={cardLayout}
      footer={footer}
      pagination={pagination}
      toolbar={toolbar}
      isLoading={isLoading}
      virtual={virtual}
      renderMobileRow={(row) => (
        <div>
          <DataGridRowPrimary onClick={() => onOpen(row.original)}>
            {row.original.name}
          </DataGridRowPrimary>
          <span>{row.original.city}</span>
        </div>
      )}
      selectionBar={
        <DataGridSelectionBar
          count={selected}
          noun="person record"
          onClear={() => setRowSelection({})}
        />
      }
    />
  );
}

beforeAll(() => {
  // jsdom has neither; the panel reads the md breakpoint and the ReUI scroll
  // area observes its viewport size.
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
  vi.unstubAllGlobals();
});

describe("DataGridPanel", () => {
  it("renders a named data region with one primary control per row", () => {
    render(<Grid />);
    expect(screen.getByRole("region", { name: "People" })).toBeTruthy();
    for (const person of PEOPLE) {
      expect(screen.getByRole("button", { name: person.name })).toBeTruthy();
    }
    expect(screen.getByText("Denver")).toBeTruthy();
  });

  it("opens a record exactly once from its primary control and once from a row click", () => {
    const onOpen = vi.fn();
    render(<Grid onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Maya Chen" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenLastCalledWith(PEOPLE[1]);
    fireEvent.click(screen.getByText("Tulsa"));
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenLastCalledWith(PEOPLE[2]);
  });

  it("moves focus between rows with the arrow, Page and Ctrl+Home/End keys", () => {
    render(<Grid />);
    const first = screen.getByRole("button", { name: "Avery Lopez" });
    const second = screen.getByRole("button", { name: "Maya Chen" });
    const last = screen.getByRole("button", { name: "Jonah Reyes" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: "ArrowUp" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "End", ctrlKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "PageUp" });
    expect(document.activeElement).toBe(first);
  });

  it("reaches the logical first and last rows of a virtualized list with Ctrl+Home/End", async () => {
    // A stand-in virtual body: only a window of rows is mounted, and
    // scrolling the body swaps which rows are in the DOM.
    const ALL = Array.from({ length: 100 }, (_, index) => `Person ${index}`);
    function VirtualList() {
      const [start, setStart] = useState(0);
      return (
        <div
          onKeyDown={(event) => {
            handleDataGridRowKeyDown(event);
          }}
        >
          <div
            data-testid="scroller"
            style={{ overflowY: "auto" }}
            onScroll={(event) =>
              setStart(event.currentTarget.scrollTop > 0 ? 90 : 0)
            }
          >
            <ul>
              {ALL.slice(start, start + 10).map((name) => (
                <li key={name} data-slot="data-grid-panel-row">
                  <DataGridRowPrimary>{name}</DataGridRowPrimary>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    render(<VirtualList />);
    const scroller = screen.getByTestId("scroller");
    Object.defineProperty(scroller, "scrollHeight", { value: 4000 });
    Object.defineProperty(scroller, "clientHeight", { value: 400 });

    const first = screen.getByRole("button", { name: "Person 0" });
    first.focus();
    fireEvent.keyDown(first, { key: "End", ctrlKey: true });
    fireEvent.scroll(scroller);
    await vi.waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Person 99"),
    );

    const last = document.activeElement as HTMLElement;
    scroller.scrollTop = 0;
    fireEvent.keyDown(last, { key: "Home", ctrlKey: true });
    fireEvent.scroll(scroller);
    await vi.waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Person 0"),
    );
  });

  it("toggles row selection with Space, selects all with Ctrl+A and announces the count", () => {
    render(<Grid selectable />);
    const first = screen.getByRole("button", { name: "Avery Lopez" });
    first.focus();
    fireEvent.keyDown(first, { key: " " });
    expect(screen.getByText("1 person record selected")).toBeTruthy();
    // Re-query: selection re-renders the row cells.
    const firstAgain = screen.getByRole("button", { name: "Avery Lopez" });
    fireEvent.keyDown(firstAgain, { key: "a", ctrlKey: true });
    expect(screen.getByText("3 person records selected")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByText(/selected$/)).toBeNull();
  });

  it("announces the count from a live region that is already in the page", () => {
    const { container } = render(<Grid selectable />);
    // A live region mounted already filled is not announced; this one waits,
    // empty, before anything is selected.
    const live = container.querySelector(
      '[data-slot="data-grid-selection-bar"] [aria-live="polite"]',
    );
    expect(live).not.toBeNull();
    expect(live!.textContent).toBe("");
    expect(screen.queryByRole("toolbar")).toBeNull();
    // Inactive, the bar makes no box, so the panel's gap adds no empty band
    // above the toolbar.
    const bar = container.querySelector(
      '[data-slot="data-grid-selection-bar"]',
    )!;
    expect(bar.className.split(" ")).toContain("contents");

    const first = screen.getByRole("button", { name: "Avery Lopez" });
    first.focus();
    fireEvent.keyDown(first, { key: " " });
    const after = container.querySelector(
      '[data-slot="data-grid-selection-bar"] [aria-live="polite"]',
    );
    expect(after).toBe(live);
    expect(after!.textContent).toBe("1 person record selected");
  });

  it("keeps the bulk actions in view while scrolling through selected rows", () => {
    render(<Grid selectable />);
    const first = screen.getByRole("button", { name: "Avery Lopez" });
    first.focus();
    fireEvent.keyDown(first, { key: " " });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    // Pinned below the 48px app header while the grid scrolls past, on an
    // opaque surface so rows do not show through it.
    expect(bar.className.split(" ")).toContain("sticky");
    expect(bar.className.split(" ")).toContain("top-14");
    expect(bar.className).not.toMatch(/bg-muted\/50/);
  });

  it("replaces the grid with an inline error and a working Retry", () => {
    const onRetry = vi.fn();
    render(<Grid error={{ message: "Service unavailable", onRetry }} />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Service unavailable");
    expect(screen.queryByRole("table")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not open the record when a control inside the row is used", () => {
    const onOpen = vi.fn();
    const onRowAction = vi.fn();
    render(<Grid onOpen={onOpen} onRowAction={onRowAction} />);
    fireEvent.click(screen.getByRole("button", { name: "More for Maya Chen" }));
    expect(onRowAction).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
    // A plain cell click still opens the record.
    fireEvent.click(screen.getByText("Denver"));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("labels the error action after what it does", () => {
    const onRetry = vi.fn();
    render(
      <Grid
        error={{
          message: "No pages match these filters.",
          onRetry,
          retryLabel: "Clear filters",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("shows the provided empty state when there are no rows", () => {
    render(<Grid data={[]} empty={<p>No people yet</p>} />);
    expect(screen.getByText("No people yet")).toBeTruthy();
  });

  it("keeps the selection bar short on phones: Clear is an icon with its name", () => {
    render(<Grid namedSelection />);
    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    const clear = within(bar).getByRole("button", { name: "Clear selection" });
    // The visible words show from sm up; phones keep the X and the name.
    const words = within(clear).getByText("Clear selection");
    expect(words.className.split(" ")).toEqual(
      expect.arrayContaining(["hidden", "sm:inline"]),
    );
  });

  it("drops the pager when there is nothing to page through", () => {
    render(<Grid data={[]} empty={<p>No people yet</p>} pagination />);
    // A "0 - 0 of 0" pager and a page-size menu are dead controls here.
    expect(screen.queryByText(/0 - 0 of 0/)).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: /pagination/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("combobox", { name: /rows per page/i }),
    ).toBeNull();
  });

  it("shows a cards-only sort control whenever the panel draws cards", () => {
    const sort = (
      <DataGridSortSelect
        whenCards
        label="Sort people"
        options={{ "name:asc": "Name: A to Z" }}
        fallback="name:asc"
        sorting={[]}
        onSortingChange={() => {}}
      />
    );
    const { unmount } = render(<Grid view="table" toolbar={sort} />);
    // The table's own headers sort; the select would only repeat them.
    expect(screen.queryByRole("combobox", { name: "Sort people" })).toBeNull();
    unmount();
    render(<Grid view="list" toolbar={sort} />);
    expect(screen.getByRole("combobox", { name: "Sort people" })).toBeTruthy();
  });

  it("offers page sizes when a paged panel is given no sizes of its own", async () => {
    // `pagination` without sizes passes sizes: undefined to the pager, which
    // used to overwrite its defaults and leave the menu empty (round 10).
    render(<Grid pagination />);
    fireEvent.click(screen.getByRole("combobox", { name: /rows per page/i }));
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent?.trim())).toEqual(
      expect.arrayContaining(["10", "25", "50"]),
    );
  });

  it("renders the card list at desktop widths when the list view is chosen", () => {
    render(<Grid view="list" />);
    expect(screen.queryByRole("table")).toBeNull();
    const list = screen.getByRole("list", { name: "People" });
    expect(
      list.querySelectorAll('[data-slot="data-grid-panel-row"]'),
    ).toHaveLength(3);
    const first = screen.getByRole("button", { name: "Avery Lopez" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Maya Chen" }),
    );
  });

  it("stretches each card to its grid row so cards side by side match in height", () => {
    render(<Grid view="list" />);
    const list = screen.getByRole("list", { name: "People" });
    for (const row of list.querySelectorAll(
      '[data-slot="data-grid-panel-row"]',
    )) {
      // A one-cell grid stretches its only child to the row's full height;
      // its one column is minmax(0, 1fr), so a long truncated title never
      // widens the card past its slot (the 1024 overlap in round 6).
      expect(row.className.split(" ")).toEqual(
        expect.arrayContaining(["grid", "grid-cols-1"]),
      );
    }
  });

  it("keeps two card columns until 2xl so a 1440 viewport leaves no orphan card", () => {
    render(<Grid view="list" />);
    const classes = screen
      .getByRole("list", { name: "People" })
      .className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining(["md:grid-cols-2", "2xl:grid-cols-3"]),
    );
    expect(classes).not.toContain("xl:grid-cols-3");
  });

  it("opts into three desktop card columns while retaining the two-column tablet layout", () => {
    render(<Grid data={makePeople(6)} view="list" cardLayout="balanced" />);
    const list = screen.getByRole("list", { name: "People" });
    // Six equal tracks let three cards each span two, with room to widen
    // trailing pairs without changing reading or keyboard order.
    expect(list.className.split(" ")).toEqual(
      expect.arrayContaining([
        "grid-cols-1",
        "md:grid-cols-2",
        "xl:grid-cols-6",
      ]),
    );
    expect(list.children).toHaveLength(6);
    for (const row of list.children) {
      expect(row.className.split(" ")).toContain("xl:col-span-2");
    }
  });

  it.each([
    { count: 1, spans: [6] },
    { count: 2, spans: [3, 3] },
    { count: 3, spans: [2, 2, 2] },
    { count: 4, spans: [3, 3, 3, 3] },
    { count: 5, spans: [2, 2, 2, 3, 3] },
    { count: 7, spans: [2, 2, 2, 3, 3, 3, 3] },
    { count: 8, spans: [2, 2, 2, 2, 2, 2, 3, 3] },
    { count: 9, spans: [2, 2, 2, 2, 2, 2, 2, 2, 2] },
    { count: 10, spans: [2, 2, 2, 2, 2, 2, 3, 3, 3, 3] },
  ])(
    "balances $count displayed cards independently of the paged total",
    ({ count, spans }) => {
      const data = makePeople(count);
      render(
        <Grid
          data={data}
          recordCount={100}
          pagination
          view="list"
          cardLayout="balanced"
        />,
      );
      const list = screen.getByRole("list", { name: "People" });
      const rows = within(list).getAllByRole("listitem");
      expect(rows).toHaveLength(count);
      expect(
        rows.map((row) =>
          Number(row.className.match(/xl:col-span-(\d+)/)?.[1]),
        ),
      ).toEqual(spans);
      expect(
        within(list)
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual(data.map((person) => person.name));
      expect(
        document.querySelector('[data-slot="data-grid-panel-pagination"]'),
      ).toBeTruthy();
    },
  );

  it("widens an odd tablet tail and resets its span at the desktop breakpoint", () => {
    const { rerender } = render(
      <Grid data={makePeople(5)} view="list" cardLayout="balanced" />,
    );
    const rows = () =>
      within(screen.getByRole("list", { name: "People" })).getAllByRole(
        "listitem",
      );
    expect(
      rows().map((row) => row.classList.contains("md:col-span-2")),
    ).toEqual([false, false, false, false, true]);
    expect(rows()[4]!.classList.contains("xl:col-span-3")).toBe(true);

    rerender(<Grid data={makePeople(4)} view="list" cardLayout="balanced" />);
    expect(rows().some((row) => row.classList.contains("md:col-span-2"))).toBe(
      false,
    );
  });

  it.each([640, 390])(
    "keeps balanced cards in the existing single phone column at %ipx",
    (width) => {
      vi.stubGlobal("innerWidth", width);
      render(<Grid view="list" cardLayout="balanced" />);
      const list = screen.getByRole("list", { name: "People" });
      expect(list.className.split(" ")).toEqual(["flex", "flex-col", "gap-2"]);
      for (const row of within(list).getAllByRole("listitem")) {
        expect(row.getAttribute("class")).toBeNull();
      }
    },
  );

  it("leaves table view and its primary controls intact when balanced cards are enabled", () => {
    render(<Grid view="table" cardLayout="balanced" />);
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "People" })).toBeNull();
    expect(screen.getByRole("button", { name: "Avery Lopez" })).toBeTruthy();
  });

  it("keeps balanced cards in reading and keyboard order, with one open action and select-all", () => {
    const onOpen = vi.fn();
    render(
      <Grid view="list" cardLayout="balanced" selectable onOpen={onOpen} />,
    );
    const list = screen.getByRole("list", { name: "People" });
    const first = within(list).getByRole("button", { name: "Avery Lopez" });
    const second = within(list).getByRole("button", { name: "Maya Chen" });
    const last = within(list).getByRole("button", { name: "Jonah Reyes" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: "End", ctrlKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "a", ctrlKey: true });
    expect(screen.getByText("3 person records selected")).toBeTruthy();
    fireEvent.click(second);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(PEOPLE[1]);
  });

  it("preserves loading, empty, error and pagination states with balanced cards", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <Grid data={[]} isLoading view="list" cardLayout="balanced" pagination />,
    );
    const region = screen.getByRole("region", { name: "People" });
    expect(region.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByRole("list", { name: "People" })).toBeNull();
    expect(
      document.querySelector('[data-slot="data-grid-panel-pagination"]'),
    ).toBeNull();

    rerender(
      <Grid
        data={[]}
        empty={<p>No people yet</p>}
        view="list"
        cardLayout="balanced"
        pagination
      />,
    );
    expect(screen.getByText("No people yet")).toBeTruthy();
    expect(region.querySelector('[aria-busy="true"]')).toBeNull();

    rerender(
      <Grid
        error={{ message: "Service unavailable", onRetry }}
        view="list"
        cardLayout="balanced"
        pagination
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Service unavailable",
    );
    expect(screen.queryByRole("list", { name: "People" })).toBeNull();
    expect(
      document.querySelector('[data-slot="data-grid-panel-pagination"]'),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<Grid view="list" cardLayout="balanced" pagination />);
    expect(screen.getByRole("list", { name: "People" })).toBeTruthy();
    expect(
      document.querySelector('[data-slot="data-grid-panel-pagination"]'),
    ).toBeTruthy();
  });

  it("preserves the card list's load-more action while a balanced layout is enabled", () => {
    const onFetchMore = vi.fn();
    const { rerender } = render(
      <Grid
        view="list"
        cardLayout="balanced"
        virtual={{ hasMore: true, onFetchMore }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(onFetchMore).toHaveBeenCalledTimes(1);
    rerender(
      <Grid
        view="list"
        cardLayout="balanced"
        virtual={{ hasMore: true, onFetchMore, isFetchingMore: true }}
      />,
    );
    expect(
      screen
        .getByRole("button", { name: /Loading more$/ })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("names the region from a visible heading when labelledBy is given", () => {
    render(
      <>
        <h2 id="people-heading">Team directory</h2>
        <Grid labelledBy="people-heading" />
      </>,
    );
    const region = screen.getByRole("region", { name: "Team directory" });
    expect(region.getAttribute("aria-label")).toBeNull();
  });

  it("closes the grid with a bottom rule only when content follows it in the card", () => {
    const { unmount } = render(<Grid />);
    const container = () =>
      document.querySelector(
        '[data-slot="data-grid-panel"] > [data-slot="data-grid"]',
      );
    expect(container()?.className).toContain("border-t");
    expect(container()?.className).not.toContain("border-b");
    unmount();
    render(<Grid footer={<p>3 people</p>} />);
    expect(container()?.className).toContain("border-b");
  });
});

describe("Checkbox", () => {
  it("draws a minus for the mixed state and a check when fully selected", () => {
    const { rerender } = render(
      <Checkbox aria-label="Select all" checked={false} indeterminate />,
    );
    const box = screen.getByRole("checkbox", { name: "Select all" });
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    expect(box.querySelector("svg.lucide-minus")).toBeTruthy();
    expect(box.querySelector("svg.lucide-check")).toBeNull();
    rerender(<Checkbox aria-label="Select all" checked />);
    expect(box.querySelector("svg.lucide-check")).toBeTruthy();
    expect(box.querySelector("svg.lucide-minus")).toBeNull();
  });
});

describe("createDataGridSelectionColumn", () => {
  it("names each row checkbox after its record and keeps the select-all header", () => {
    render(<Grid namedSelection />);
    const avery = screen.getByRole("checkbox", { name: "Select Avery Lopez" });
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeTruthy();
    fireEvent.click(avery);
    expect(screen.getByText("1 person record selected")).toBeTruthy();
    expect(
      screen
        .getByRole("checkbox", { name: "Select Avery Lopez" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    // The checkbox sits in a flex wrapper so the inline root keeps its box.
    expect(avery.parentElement?.className).toContain("flex");
  });
});

describe("DataGridViewOptions", () => {
  it("stays off phones, where every grid shows cards and columns do nothing", () => {
    function Harness() {
      const table = useTable({
        features: dataGridFeatures,
        data: PEOPLE,
        columns: [{ accessorKey: "name", header: "Name" }],
        getRowId: (row) => row.id,
      });
      return (
        <DataGridPanel
          table={table}
          recordCount={PEOPLE.length}
          label="People"
          toolbar={<DataGridViewOptions table={table} />}
        />
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "View" });
    const wrapper = trigger.closest("[data-slot='data-grid-view-options']");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className.split(" ")).toEqual(
      expect.arrayContaining(["hidden", "md:flex"]),
    );
  });
});

describe("DataGridViewOptions in card mode", () => {
  it("steps aside whenever the panel shows cards, at any width", () => {
    // Columns change nothing on cards: the panel can show cards above md
    // too (a chosen card view, or columns that would not fit).
    function Harness({ view }: { view: "table" | "list" }) {
      const table = useTable({
        features: dataGridFeatures,
        data: PEOPLE,
        columns: [{ accessorKey: "name", header: "Name" }],
        getRowId: (row) => row.id,
      });
      return (
        <DataGridPanel
          table={table}
          recordCount={PEOPLE.length}
          label="People"
          view={view}
          renderMobileRow={(row) => <span>{row.original.name}</span>}
          toolbar={<DataGridViewOptions table={table} />}
        />
      );
    }
    const { rerender } = render(<Harness view="table" />);
    expect(screen.getByRole("button", { name: "View" })).toBeTruthy();
    rerender(<Harness view="list" />);
    expect(screen.queryByRole("button", { name: "View" })).toBeNull();
  });
});

describe("DataGridViewToggle", () => {
  it("switches between the table and card views as a pressed toggle pair", () => {
    function Harness() {
      const [view, setView] = useState<"table" | "list">("table");
      return (
        <>
          <DataGridViewToggle value={view} onValueChange={setView} />
          <Grid view={view} />
        </>
      );
    }
    render(<Harness />);
    const table = screen.getByRole("button", { name: "Table view" });
    const cards = screen.getByRole("button", { name: "Card view" });
    expect(table.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("table")).toBeTruthy();
    fireEvent.click(cards);
    expect(cards.getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("list", { name: "People" })).toBeTruthy();
    // Pressing the active item keeps the current view (never "no view").
    fireEvent.click(cards);
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("DataGridSearch", () => {
  it("debounces typing, clears immediately and adopts external resets", () => {
    vi.useFakeTimers();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DataGridSearch
        label="Search people"
        value=""
        onValueChange={onValueChange}
        debounceMs={250}
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search people" });
    fireEvent.change(input, { target: { value: "may" } });
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onValueChange).toHaveBeenLastCalledWith("may");
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    rerender(
      <DataGridSearch
        label="Search people"
        value="reset"
        onValueChange={onValueChange}
        debounceMs={250}
      />,
    );
    expect((input as HTMLInputElement).value).toBe("reset");
    vi.useRealTimers();
  });

  it("offers one clear control, not the browser's native search cancel button", () => {
    render(
      <DataGridSearch
        label="Search people"
        value="may"
        onValueChange={() => {}}
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search people" });
    // type="search" adds WebKit's own cancel button next to ours.
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("enterkeyhint")).toBe("search");
    expect(screen.getAllByRole("button", { name: /clear/i })).toHaveLength(1);
  });
});
