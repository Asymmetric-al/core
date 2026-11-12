// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { NativeCollectionGrid } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionGrid";

import type { ReactNode } from "react";

const BULK_ACTIONS_CSS = path.join(
  process.cwd(),
  "apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/grid-bulk-actions.module.css",
);

/** The declarations of the first rule whose selector ends with `selectorEnd`. */
function cssRule(css: string, selectorEnd: string): string {
  const at = css.indexOf(selectorEnd);
  expect(at, `rule ending in ${selectorEnd}`).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf("}", at));
}

const fixture = vi.hoisted(() => ({
  handleSearchChange: vi.fn(async () => {}),
  handleSortChange: vi.fn(async () => {}),
  handlePageChange: vi.fn(async () => {}),
  handlePerPageChange: vi.fn(async () => {}),
  handleWhereChange: vi.fn(async () => {}),
  refineListData: vi.fn(async () => {}),
  setActiveColumns: vi.fn(async () => {}),
  setColumns: vi.fn(async () => {}),
  isTransitioning: false,
  refresh: vi.fn(),
  list: {} as Record<string, unknown>,
  columns: [] as unknown[],
  selected: new Map<number | string, boolean>(),
  setSelection: vi.fn(),
  toggleAll: vi.fn(),
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useListQuery: () => fixture.list,
    useTableColumns: () => ({
      columns: fixture.columns,
      setActiveColumns: fixture.setActiveColumns,
      setColumns: fixture.setColumns,
    }),
    useRouteTransition: () => ({ isTransitioning: fixture.isTransitioning }),
    useSelection: () => ({
      count: [...fixture.selected.values()].filter(Boolean).length,
      selected: fixture.selected,
      selectedIDs: [...fixture.selected.entries()]
        .filter(([, on]) => on)
        .map(([id]) => id),
      selectAll: "none",
      setSelection: fixture.setSelection,
      toggleAll: fixture.toggleAll,
      totalDocs: 14,
    }),
    EditMany: ({ count }: { count: number }) => (
      <button type="button">Edit {count}</button>
    ),
    PublishMany: () => <button type="button">Publish</button>,
    UnpublishMany: () => <button type="button">Unpublish</button>,
    DeleteMany: (props: {
      selections: Record<string, { ids?: unknown[] }>;
    }) => (
      <button type="button" data-ids={JSON.stringify(props.selections)}>
        Delete
      </button>
    ),
    useConfig: () => ({
      config: { serverURL: "", routes: { api: "/api" } },
      getEntityConfig: () => ({ admin: { useAsTitle: "name" } }),
    }),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
  useRouter: () => ({ push: vi.fn(), refresh: fixture.refresh }),
}));

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
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
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fixture.selected = new Map();
  fixture.isTransitioning = false;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  });
});

function column(
  accessor: string,
  label: string,
  type: string,
  active: boolean,
  cells: string[] = [],
) {
  return {
    accessor,
    active,
    field: { name: accessor, type, label },
    Heading: <span>{label}</span>,
    renderedCells: cells.map((text) => <span key={text}>{text}</span>),
  };
}

function setup({
  docs = [
    { id: 1, title: "Year-End Giving", _status: "published" },
    {
      id: 2,
      title: "Kenya School Build",
      _status: "draft",
      _displayStatus: "changed",
    },
  ],
  totalDocs = 14,
  query = { sort: "title", page: 1, limit: 10 },
  fields = [
    { name: "title", type: "text", label: "Title" },
    { name: "slug", type: "text", label: "Slug" },
  ],
  groupedTable,
  groupedData,
  trash = false,
  trashEnabled = false,
  bulk,
}: {
  bulk?: Record<string, unknown>;
  docs?: Array<Record<string, unknown>>;
  totalDocs?: number;
  query?: Record<string, unknown>;
  fields?: Array<Record<string, unknown>>;
  groupedTable?: ReactNode;
  groupedData?: Array<Record<string, unknown>>;
  trash?: boolean;
  trashEnabled?: boolean;
} = {}) {
  fixture.columns = [
    column("title", "Title", "text", true, ["Year-End Giving", "Kenya"]),
    column("slug", "Slug", "text", true, ["year-end-giving", "kenya-school"]),
    column("layout", "Layout", "blocks", true, ["3 blocks", "1 block"]),
    column("updatedAt", "Updated At", "date", false),
  ];
  fixture.list = {
    data: {
      docs,
      totalDocs,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalDocs / Number(query.limit)),
    },
    query,
    hasActiveFilters: Boolean(query.where),
    defaultSort: undefined,
    handleSearchChange: fixture.handleSearchChange,
    handleSortChange: fixture.handleSortChange,
    handlePageChange: fixture.handlePageChange,
    handlePerPageChange: fixture.handlePerPageChange,
    handleWhereChange: fixture.handleWhereChange,
    refineListData: fixture.refineListData,
  };
  return render(
    <NativeCollectionGrid
      title="Pages"
      useAsTitle="title"
      hasDrafts
      listPath="/web-studio/collections/pages"
      createHref="/web-studio/pages/new-from-template"
      createLabel="New page"
      fields={fields as never}
      groupedTable={groupedTable}
      groupedData={groupedData as never}
      trash={trash}
      trashEnabled={trashEnabled}
      bulk={bulk as never}
    />,
  );
}

describe("NativeCollectionGrid", () => {
  it("renders Payload's docs in a ReUI grid with one named primary link per row", () => {
    const view = setup();
    const region = screen.getByRole("region", { name: "Pages" });
    expect(
      view.container.querySelector('[data-slot="data-grid-panel"]'),
    ).toBeTruthy();
    expect(within(region).getByRole("table")).toBeTruthy();
    const first = within(region).getByRole("link", {
      name: "Year-End Giving",
    });
    expect(first.getAttribute("href")).toBe("/web-studio/collections/pages/1");
    expect(
      within(region)
        .getByRole("link", { name: "Kenya School Build" })
        .getAttribute("href"),
    ).toBe("/web-studio/collections/pages/2");
    // Field-aware cells keep Payload's server rendering.
    expect(within(region).getByText("year-end-giving")).toBeTruthy();
    expect(within(region).getByText("3 blocks")).toBeTruthy();
    // Inactive Payload columns stay hidden until chosen.
    expect(
      within(region).queryByRole("columnheader", { name: /Updated At/ }),
    ).toBeNull();
    expect(within(region).getByText("Published")).toBeTruthy();
    expect(within(region).getByText("Changed")).toBeTruthy();
  });

  it("drives Payload's sort from ReUI column headers", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /^Title/ }));
    expect(fixture.handleSortChange).toHaveBeenCalledExactlyOnceWith("-title");
    fireEvent.click(screen.getByRole("button", { name: /^Slug/ }));
    expect(fixture.handleSortChange).toHaveBeenLastCalledWith("slug");
    // Blocks are not sortable in Payload, so they get no sort control.
    expect(screen.queryByRole("button", { name: /^Layout/ })).toBeNull();
  });

  it("pages and sizes through Payload's list query", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(fixture.handlePageChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(screen.getByText(/1\D+10\D+14/)).toBeTruthy();
  });

  it("searches through Payload after a short pause", async () => {
    setup();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search pages" }), {
      target: { value: "kenya" },
    });
    await waitFor(() =>
      expect(fixture.handleSearchChange).toHaveBeenCalledWith("kenya"),
    );
  });

  it("shows and hides Payload columns from the View menu", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const option = await screen.findByRole("checkbox", {
      name: "Updated at",
    });
    await act(async () => {
      fireEvent.click(option);
    });
    expect(fixture.setActiveColumns).toHaveBeenCalledExactlyOnceWith([
      "title",
      "slug",
      "layout",
      "updatedAt",
    ]);
  });

  it("opens the shared filter builder with readable fields and operators", () => {
    setup();
    expect(screen.queryByRole("group", { name: "Filter pages" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    const panel = screen.getByRole("group", { name: "Filter pages" });
    expect(within(panel).getByText("No filters applied")).toBeTruthy();
    fireEvent.click(within(panel).getByRole("button", { name: /Add filter/ }));
    // Regression: Payload's deep-imported WhereBuilder showed raw
    // translation keys ("operators:equals") and only the ID field.
    expect(panel.textContent).not.toMatch(/operators:/);
    expect(panel.textContent).toContain("Title");
    expect(panel.textContent).toContain("contains");
    expect(within(panel).getByRole("textbox", { name: "Title" })).toBeTruthy();
  });

  it("filters by tenant, naming each tenant, as Payload's own filter did", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        docs: [
          { id: 1, name: "E2E Tenant" },
          { id: 2, name: "Second Tenant" },
        ],
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      setup({
        fields: [
          { name: "title", type: "text", label: "Title" },
          {
            name: "tenant",
            type: "relationship",
            relationTo: "tenants",
            label: "Tenant",
          },
        ],
        query: {
          sort: "title",
          page: 1,
          limit: 10,
          where: { or: [{ and: [{ tenant: { equals: "2" } }] }] },
        },
      });
      const panel = screen.getByRole("group", { name: "Filter pages" });
      // The tenant filter is editable, not the "can't show" notice.
      expect(panel.textContent).not.toMatch(/can.t show/);
      expect(panel.textContent).toContain("Tenant");
      await waitFor(() => expect(panel.textContent).toContain("Second Tenant"));
      expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/^\/api\/tenants\?/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("selects documents into Payload's selection and offers Payload's bulk actions", () => {
    const view = setup({
      bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
    });
    const region = screen.getByRole("region", { name: "Pages" });
    // Each checkbox is named after its document.
    fireEvent.click(
      within(region).getByRole("checkbox", { name: "Select Year-End Giving" }),
    );
    expect(fixture.setSelection).toHaveBeenCalledWith(1);

    fixture.selected = new Map([[1, true]]);
    view.unmount();
    setup({
      bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
    });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    expect(bar.textContent).toContain("1 page selected");
    expect(within(bar).getByRole("button", { name: "Edit 1" })).toBeTruthy();
    expect(within(bar).getByRole("button", { name: "Publish" })).toBeTruthy();
    expect(within(bar).getByRole("button", { name: "Unpublish" })).toBeTruthy();
    const remove = within(bar).getByRole("button", { name: "Delete" });
    expect(JSON.parse(remove.dataset.ids ?? "{}")).toEqual({
      pages: { all: false, ids: [1], totalCount: 1 },
    });
    fireEvent.click(
      within(bar).getByRole("button", { name: "Clear selection" }),
    );
    expect(fixture.toggleAll).toHaveBeenCalled();
  });

  it("reorders columns from the View panel and saves Payload's column order", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const panel = await screen.findByRole("dialog", { name: "Columns" });
    // Title (and the status badge) stay first, so they offer no moves.
    expect(
      within(panel).queryByRole("button", { name: /^Move Title/ }),
    ).toBeNull();
    const up = within(panel).getByRole("button", { name: "Move Slug up" });
    expect(up.hasAttribute("disabled")).toBe(true);
    fireEvent.click(
      within(panel).getByRole("button", { name: "Move Slug down" }),
    );
    const saved = fixture.setColumns.mock.calls[0]?.[0] as Array<{
      accessor: string;
    }>;
    expect(saved.map((column) => column.accessor)).toEqual([
      "title",
      "layout",
      "slug",
      "updatedAt",
    ]);
  });

  it("shows no checkboxes where Payload offers no bulk actions", () => {
    setup();
    expect(screen.queryByRole("checkbox", { name: /^Select / })).toBeNull();
  });

  it("applies a complete filter to Payload's query after a pause", async () => {
    vi.useFakeTimers();
    try {
      setup();
      fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
      const panel = screen.getByRole("group", { name: "Filter pages" });
      fireEvent.click(
        within(panel).getByRole("button", { name: /Add filter/ }),
      );
      fireEvent.change(within(panel).getByRole("textbox", { name: "Title" }), {
        target: { value: "Kenya" },
      });
      expect(fixture.handleWhereChange).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(fixture.handleWhereChange).toHaveBeenCalledExactlyOnceWith({
        or: [{ and: [{ title: { like: "Kenya" } }] }],
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("groups the list through Payload's query and clears grouping", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /^Group by/ }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Status" }),
    );
    expect(fixture.refineListData).toHaveBeenCalledWith({
      groupBy: "_status",
      page: 1,
    });
  });

  it("shows Payload's grouped tables while grouped, under the same toolbar", () => {
    const view = setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      groupedTable: <div data-testid="payload-grouped">Grouped tables</div>,
    });
    expect(view.getByTestId("payload-grouped")).toBeTruthy();
    expect(view.container.querySelector("table")).toBeNull();
    expect(
      screen.getByRole("button", { name: /^Group by: Status/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("searchbox", { name: /search pages/i }),
    ).toBeTruthy();
    // Columns still apply to Payload's grouped tables.
    expect(screen.getByRole("button", { name: "View" })).toBeTruthy();
  });

  it("shows each group on Core's grid, under its own heading and count", () => {
    const view = setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      // Payload's own tables are not used when the grouped data is given.
      groupedTable: <div data-testid="payload-grouped">Grouped tables</div>,
      groupedData: [
        {
          heading: "Published",
          value: "published",
          data: {
            docs: [{ id: 1, title: "Year-End Giving", _status: "published" }],
            totalDocs: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        {
          heading: "Draft",
          value: "draft",
          data: {
            docs: [
              { id: 2, title: "Kenya School Build", _status: "draft" },
              { id: 3, title: "Spring Appeal", _status: "draft" },
            ],
            totalDocs: 12,
            page: 1,
            limit: 2,
            totalPages: 6,
          },
        },
      ],
    });
    expect(view.queryByTestId("payload-grouped")).toBeNull();
    const published = screen.getByRole("region", { name: /^Published/ });
    expect(within(published).getByText("1")).toBeTruthy();
    expect(
      within(published).getByRole("link", { name: "Year-End Giving" }),
    ).toBeTruthy();
    const draft = screen.getByRole("region", { name: /^Draft/ });
    expect(within(draft).getByText("12")).toBeTruthy();
    expect(within(draft).getAllByRole("row")).toHaveLength(3);
    // The shared toolbar stays above the groups.
    expect(
      screen.getByRole("searchbox", { name: /search pages/i }),
    ).toBeTruthy();
  });

  it("lines grouped tables up: heading in each card's top row, shared column widths, toolbar in a card", () => {
    setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      groupedData: [
        {
          heading: "Draft",
          value: "draft",
          data: {
            docs: [{ id: 2, title: "Kenya School Build", _status: "draft" }],
            totalDocs: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        {
          heading: "Published",
          value: "published",
          data: {
            docs: [{ id: 1, title: "Year-End Giving", _status: "published" }],
            totalDocs: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      ],
    });
    const draft = screen.getByRole("region", { name: /^Draft/ });
    // The heading is the card's toolbar row, so no empty band sits above
    // the column headers.
    const heading = within(draft).getByRole("heading", { name: /^Draft/ });
    expect(
      heading.closest("[data-slot='data-grid-panel-toolbar']"),
    ).not.toBeNull();
    // Fixed layout: every group's columns take the same widths.
    for (const table of screen.getAllByRole("table")) {
      expect(table.className).toContain("table-fixed");
    }
    // The shared toolbar sits in a card, as it does above the flat list.
    const search = screen.getByRole("searchbox", { name: /search pages/i });
    expect(search.closest("[data-slot='card']")).not.toBeNull();
  });

  it("pages a single group through Payload's per-group query", async () => {
    setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      groupedData: [
        {
          heading: "Draft",
          value: "draft",
          data: {
            docs: [
              { id: 2, title: "Kenya School Build", _status: "draft" },
              { id: 3, title: "Spring Appeal", _status: "draft" },
            ],
            totalDocs: 12,
            page: 1,
            limit: 2,
            totalPages: 6,
          },
        },
      ],
    });
    const draft = screen.getByRole("region", { name: /^Draft/ });
    await act(async () => {
      fireEvent.click(
        within(draft).getByRole("button", { name: /go to next page/i }),
      );
    });
    expect(fixture.refineListData).toHaveBeenCalledWith({
      queryByGroup: { draft: { page: 2, limit: 2 } },
    });
  });

  it("names related documents in grouped rows, never the flat list's cells", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        // Two organizations: with one, the grid leaves the column out.
        json: async () => ({
          docs: [
            { id: "t-1", name: "Give Hope" },
            { id: "t-2", name: "Second Org" },
          ],
        }),
      })),
    );
    const fields = [
      { name: "title", type: "text", label: "Title" },
      {
        name: "tenant",
        type: "relationship",
        relationTo: "tenants",
        label: "Tenant",
      },
    ];
    const groupedData = [
      {
        heading: "Draft",
        value: "draft",
        data: {
          docs: [
            { id: 9, title: "Grouped page", tenant: "t-1", _status: "draft" },
          ],
          totalDocs: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    ];
    const view = setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      fields,
      groupedData,
    });
    // Payload's rendered cells belong to the flat page, not grouped rows.
    fixture.columns = [
      column("title", "Title", "text", true, ["Flat row A", "Flat row B"]),
      {
        ...column("tenant", "Tenant", "relationship", true, [
          "Flat tenant cell",
          "Flat tenant cell",
        ]),
        field: {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          label: "Tenant",
        },
      },
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={fields as never}
        groupedData={groupedData as never}
      />,
    );
    const draft = screen.getByRole("region", { name: /^Draft/ });
    expect(within(draft).queryByText("Flat tenant cell")).toBeNull();
    await waitFor(() =>
      expect(within(draft).getAllByText("Give Hope").length).toBeGreaterThan(0),
    );
    vi.unstubAllGlobals();
  });

  it("names related documents in flat rows once loaded, not Payload's loading cell", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        // Two organizations: with one, the grid leaves the column out.
        json: async () => ({
          docs: [
            { id: "t-1", name: "Give Hope" },
            { id: "t-2", name: "Second Org" },
          ],
        }),
      })),
    );
    const fields = [
      { name: "title", type: "text", label: "Title" },
      {
        name: "tenant",
        type: "relationship",
        relationTo: "tenants",
        label: "Tenant",
      },
    ];
    const docs = [{ id: 1, title: "Home", tenant: "t-1", _status: "draft" }];
    const view = setup({ docs, totalDocs: 1, fields });
    // Payload's relationship cell fetches on its own and starts as
    // "Loading..."; the grid already has the tenant's name.
    fixture.columns = [
      column("title", "Title", "text", true, ["Home"]),
      {
        ...column("tenant", "Tenant", "relationship", true, ["Loading..."]),
        field: {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          label: "Tenant",
        },
      },
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={fields as never}
      />,
    );
    const region = screen.getByRole("region", { name: "Pages" });
    await waitFor(() =>
      expect(within(region).getAllByText("Give Hope").length).toBeGreaterThan(
        0,
      ),
    );
    expect(within(region).queryByText("Loading...")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("acts on documents selected in the grouped tables with the same bulk bar", () => {
    // Payload's grouped tables select through the same SelectionProvider.
    fixture.selected = new Map([[2, true]]);
    setup({
      query: { sort: "title", page: 1, limit: 10, groupBy: "_status" },
      groupedTable: <div>Grouped tables</div>,
      bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
    });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    expect(bar.textContent).toContain("1 page selected");
    expect(within(bar).getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("never rewrites a filter it cannot show; it offers to clear it", () => {
    setup({
      query: {
        sort: "title",
        page: 1,
        limit: 10,
        // An OR nested inside an AND: deeper than Payload's OR of AND
        // groups, so the builder would change it.
        where: {
          and: [
            { or: [{ title: { like: "a" } }, { slug: { equals: "b" } }] },
            { title: { like: "c" } },
          ],
        },
      },
    });
    const panel = screen.getByRole("group", { name: "Filter pages" });
    expect(panel.textContent).toContain("can't show");
    expect(
      within(panel).queryByRole("button", { name: /Add filter/ }),
    ).toBeNull();
    fireEvent.click(
      within(panel).getByRole("button", { name: "Clear filters" }),
    );
    expect(fixture.refineListData).toHaveBeenCalledExactlyOnceWith({
      search: undefined,
      where: {},
    });
    expect(fixture.handleWhereChange).not.toHaveBeenCalled();
  });

  it("edits an OR of AND groups group by group, as Payload's filter did", () => {
    vi.useFakeTimers();
    try {
      setup({
        query: {
          sort: "title",
          page: 1,
          limit: 10,
          // (title AND slug) OR (title AND slug)
          where: {
            or: [
              { and: [{ title: { like: "a" } }, { slug: { equals: "a" } }] },
              { and: [{ title: { like: "b" } }, { slug: { equals: "b" } }] },
            ],
          },
        },
      });
      const panel = screen.getByRole("group", { name: "Filter pages" });
      expect(panel.textContent).not.toContain("can't show");
      const groups = within(panel).getAllByRole("group", {
        name: /^Condition group/,
      });
      expect(groups).toHaveLength(2);
      expect(
        (
          within(groups[1]!).getByRole("textbox", {
            name: "Slug",
          }) as HTMLInputElement
        ).value,
      ).toBe("b");

      fireEvent.change(
        within(groups[1]!).getByRole("textbox", { name: "Slug" }),
        { target: { value: "c" } },
      );
      vi.advanceTimersByTime(400);
      expect(fixture.handleWhereChange).toHaveBeenCalledExactlyOnceWith({
        or: [
          { and: [{ title: { like: "a" } }, { slug: { equals: "a" } }] },
          { and: [{ title: { like: "b" } }, { slug: { equals: "c" } }] },
        ],
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows filters a URL already applies", () => {
    setup({
      query: {
        sort: "title",
        page: 1,
        limit: 10,
        where: { or: [{ and: [{ slug: { equals: "home" } }] }] },
      },
    });
    const panel = screen.getByRole("group", { name: "Filter pages" });
    expect(
      (within(panel).getByRole("textbox", { name: "Slug" }) as HTMLInputElement)
        .value,
    ).toBe("home");
  });

  it("links trashed documents to their trash view and says when trash is empty", () => {
    const view = setup({ trash: true, trashEnabled: true });
    const region = screen.getByRole("region", { name: "Pages" });
    expect(
      within(region)
        .getByRole("link", { name: "Year-End Giving" })
        .getAttribute("href"),
    ).toBe("/web-studio/collections/pages/trash/1");
    view.unmount();

    const empty = setup({
      trash: true,
      trashEnabled: true,
      docs: [],
      totalDocs: 0,
    });
    expect(screen.getByText("Trash is empty")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "New page" })).toBeNull();
    expect(screen.queryByText("No pages yet")).toBeNull();
    empty.unmount();

    // A collection without trash deletes permanently; say so instead.
    setup({ trash: true, docs: [], totalDocs: 0 });
    expect(screen.getByText("Trash isn't turned on")).toBeTruthy();
    expect(screen.queryByText("Trash is empty")).toBeNull();
    // Nothing can be in it, so no search, filters, grouping or pages.
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Filters/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Group by/ })).toBeNull();
    expect(screen.queryByText(/rows per page/i)).toBeNull();
  });

  it("offers an honest empty state with the create action", () => {
    setup({ docs: [], totalDocs: 0 });
    expect(screen.getByText("No pages yet")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "New page" }).getAttribute("href"),
    ).toBe("/web-studio/pages/new-from-template");
  });

  it("clears search and filters when they hide every document", () => {
    setup({
      docs: [],
      totalDocs: 0,
      query: {
        sort: "title",
        page: 1,
        limit: 10,
        search: "zzz",
        where: { and: [{ slug: { equals: "x" } }] },
      },
    });
    expect(screen.getByText("No matching pages")).toBeTruthy();
    // One clear control: the empty state's, not a second toolbar Reset.
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    // One refinement, so Payload cannot merge the cleared search back in.
    expect(fixture.refineListData).toHaveBeenCalledExactlyOnceWith({
      search: undefined,
      where: {},
    });
    expect(fixture.handleSearchChange).not.toHaveBeenCalled();
  });

  it("sizes columns to their content and never clips the record name", () => {
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Financial Accountability and Annual Reporting",
          _status: "published",
          updatedAt: "2026-11-07T21:06:00.000Z",
          missionaryId: "33333333-3333-3333-3333-333333333333",
        },
      ],
      totalDocs: 1,
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("missionaryId", "Missionary Id", "text", true, [
        "33333333-3333-3333-3333-333333333333",
      ]),
      column("updatedAt", "Updated At", "date", true, [
        "November 7th 2026, 9:06 PM",
      ]),
    ];
    view.rerender(
      <NativeCollectionGrid
        collectionSlug="missionary-giving-pages"
        title="Missionary Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/missionary-giving-pages"
        fields={[]}
      />,
    );
    const region = screen.getByRole("region", { name: "Missionary Pages" });
    // Auto layout: columns take their content width instead of equal slices.
    expect(within(region).getByRole("table").className).toContain("table-auto");
    const name = within(region).getByText(
      "Financial Accountability and Annual Reporting",
    );
    expect(name.className).not.toContain("truncate");

    // Dates: a compact, one-line format with the full value on hover.
    const updated = region.querySelector("time");
    expect(updated?.getAttribute("dateTime")).toBe("2026-11-07T21:06:00.000Z");
    expect(updated?.textContent).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}/);
    expect(updated?.textContent).not.toMatch(/(st|nd|rd|th) \d{4}/);
    expect(updated?.className).toContain("whitespace-nowrap");
    expect(updated?.getAttribute("title")).toBeTruthy();

    // Reference IDs: both ends in one compact mono line, the full value
    // in a copy button keyboard and touch users can reach.
    const reference = within(region).getByText("33333333…3333");
    expect(reference.className).toContain("font-mono");
    const copy = within(region).getByRole("button", {
      name: "Copy Missionary ID 33333333-3333-3333-3333-333333333333",
    });
    expect(copy.tagName).toBe("BUTTON");
  });

  it("tells reference IDs that share a prefix apart and copies the full value", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Grace Okafor",
          missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
        },
        {
          id: 2,
          title: "Daniel Mensah",
          missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02",
        },
      ],
      totalDocs: 2,
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("missionaryId", "Missionary Id", "text", true),
    ];
    view.rerender(
      <NativeCollectionGrid
        collectionSlug="missionary-giving-pages"
        title="Giving Pages"
        useAsTitle="title"
        hasDrafts={false}
        listPath="/web-studio/collections/missionary-giving-pages"
        fields={[]}
      />,
    );
    expect(screen.getByText("5b0c2a52…0a01")).toBeTruthy();
    expect(screen.getByText("5b0c2a52…0a02")).toBeTruthy();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Copy Missionary ID 5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02",
        }),
      );
    });
    expect(writeText).toHaveBeenCalledExactlyOnceWith(
      "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02",
    );
  });

  it("renders cards with the same primary link below the md breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    setup();
    const list = screen.getByRole("list", { name: "Pages" });
    const link = within(list).getByRole("link", { name: "Year-End Giving" });
    expect(link.getAttribute("href")).toBe("/web-studio/collections/pages/1");
    expect(within(list).getByText("Published")).toBeTruthy();
  });

  it("never nests a cell's block markup inside a card paragraph", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const view = setup();
    // Payload's server-rendered cells can be block elements.
    fixture.columns = [
      column("title", "Title", "text", true),
      {
        ...column("slug", "Slug", "text", true),
        renderedCells: [
          <div key="a">year-end-giving</div>,
          <div key="b">kenya-school</div>,
        ],
      },
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
      />,
    );
    const list = screen.getByRole("list", { name: "Pages" });
    expect(within(list).getByText("year-end-giving")).toBeTruthy();
    // `<div>` inside `<p>` is invalid HTML and a hydration error in React.
    expect(list.querySelector("p div")).toBeNull();
  });

  it("wraps a long card title to two lines instead of cutting it off", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    setup();
    const link = screen.getAllByRole("link", { name: "Year-End Giving" })[0]!;
    const title = link.querySelector("span")!;
    expect(title.className.split(" ")).toContain("line-clamp-2");
    expect(title.className.split(" ")).not.toContain("truncate");
  });

  it("sorts the card list from a Sort menu through Payload's sort handler", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    setup();
    // The cards have no column headers, so the toolbar carries the sort.
    fireEvent.click(await screen.findByRole("button", { name: /^Sort/ }));
    const slug = await screen.findByRole("menuitemradio", { name: "Slug" });
    // Only sortable fields are offered (blocks are not sortable in Payload).
    expect(screen.queryByRole("menuitemradio", { name: "Layout" })).toBeNull();
    expect(
      screen
        .getByRole("menuitemradio", { name: "Title" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await act(async () => {
      fireEvent.click(slug);
    });
    expect(fixture.handleSortChange).toHaveBeenCalledExactlyOnceWith("slug");

    // The menu stays open so the field and the order can both be set.
    await act(async () => {
      fireEvent.click(
        await screen.findByRole("menuitemradio", { name: "Descending" }),
      );
    });
    // The fixture's query still sorts by title: the order flips on it.
    expect(fixture.handleSortChange).toHaveBeenLastCalledWith("-title");
  });

  it("shows Payload's default order in the Sort menu until a field is chosen", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    // No sort in the query: Payload lists newest first.
    setup({ query: { page: 1, limit: 10 } });
    const trigger = await screen.findByRole("button", { name: /^Sort/ });
    expect(trigger.textContent).toContain("default (newest first)");
    fireEvent.click(trigger);
    expect(
      (
        await screen.findByRole("menuitemradio", {
          name: "Default (newest first)",
        })
      ).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByRole("menuitemradio", { name: "Title" })
        .getAttribute("aria-checked"),
    ).toBe("false");
    // Order applies to a chosen field; neither direction claims the default.
    const ascending = screen.getByRole("menuitemradio", { name: "Ascending" });
    const descending = screen.getByRole("menuitemradio", {
      name: "Descending",
    });
    expect(ascending.getAttribute("aria-checked")).toBe("false");
    expect(descending.getAttribute("aria-checked")).toBe("false");
    expect(descending.getAttribute("aria-disabled")).toBe("true");
    await act(async () => {
      fireEvent.click(descending);
    });
    expect(fixture.handleSortChange).not.toHaveBeenCalled();
  });

  it("returns the card list to Payload's default order from the Sort menu", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    setup();
    fireEvent.click(await screen.findByRole("button", { name: /^Sort/ }));
    await act(async () => {
      fireEvent.click(
        await screen.findByRole("menuitemradio", {
          name: "Default (newest first)",
        }),
      );
    });
    expect(fixture.handleSortChange).toHaveBeenCalledExactlyOnceWith(
      "-createdAt",
    );
  });

  it("keeps the tenant on each card while the Tenant column is shown", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Year-End Giving",
          slug: "year-end-giving",
          tenant: "E2E Tenant",
          _status: "published",
        },
      ],
      totalDocs: 1,
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("slug", "Slug", "text", true, ["year-end-giving"]),
      column("tenant", "Tenant", "relationship", true, ["E2E Tenant"]),
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
      />,
    );
    const list = screen.getByRole("list", { name: "Pages" });
    expect(within(list).getByText("year-end-giving")).toBeTruthy();
    expect(within(list).getByText("E2E Tenant")).toBeTruthy();
  });

  it("adds the sorted value to each card when the card would leave it out", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Year-End Giving",
          slug: "year-end-giving",
          updatedAt: "2026-11-07T21:06:00.000Z",
          _status: "published",
        },
      ],
      totalDocs: 1,
      query: { sort: "-updatedAt", page: 1, limit: 10 },
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("slug", "Slug", "text", true, ["year-end-giving"]),
      column("updatedAt", "Updated At", "date", true),
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
      />,
    );
    const list = screen.getByRole("list", { name: "Pages" });
    expect(within(list).getByText("year-end-giving")).toBeTruthy();
    expect(within(list).getByText("Updated at")).toBeTruthy();
    expect(list.querySelector("time")?.getAttribute("dateTime")).toBe(
      "2026-11-07T21:06:00.000Z",
    );
    // A phone card wraps the value under its label rather than cutting the
    // date short.
    const value = list
      .querySelector("time")!
      .closest('[data-slot="card-meta-value"]')!;
    expect(value.className.split(" ")).not.toContain("truncate");
    expect(value.parentElement!.className.split(" ")).toContain("flex-wrap");
  });

  it("retries the same list and keeps clearing filters a separate control", () => {
    setup({
      query: {
        sort: "title",
        page: 1,
        limit: 10,
        search: "kenya",
      },
    });
    fixture.list = { ...fixture.list, data: null };
    cleanup();
    render(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
      />,
    );
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Couldn't load pages")).toBeTruthy();
    expect(alert.textContent).toContain("Reset it to see every document");
    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(fixture.refresh).toHaveBeenCalledTimes(1);
    expect(fixture.refineListData).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
  });

  it("reads a checkbox column as Yes or No, not Payload's raw true", () => {
    const view = setup({
      docs: [
        { id: 1, title: "Main org", active: true },
        { id: 2, title: "Old org", active: false },
      ],
      totalDocs: 2,
    });
    // Payload's own checkbox cell prints the raw value in code type.
    fixture.columns = [
      column("title", "Title", "text", true),
      {
        ...column("active", "Active", "checkbox", true),
        renderedCells: [<code key="a">true</code>, <code key="b">false</code>],
      },
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Organizations"
        useAsTitle="title"
        hasDrafts={false}
        listPath="/web-studio/collections/tenants"
        fields={[]}
      />,
    );
    const region = screen.getByRole("region", { name: "Organizations" });
    expect(within(region).getByText("Yes")).toBeTruthy();
    expect(within(region).getByText("No")).toBeTruthy();
    expect(within(region).queryByText("true")).toBeNull();
  });

  it("shows a muted dash for an empty value instead of Payload's placeholder", () => {
    const view = setup({
      docs: [{ id: 18, title: "", slug: null, _status: "draft" }],
      totalDocs: 1,
    });
    fixture.columns = [
      column("title", "Title", "text", true, ["<No Title>"]),
      column("slug", "Slug", "text", true, ["<No Slug>"]),
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
      />,
    );
    const region = screen.getByRole("region", { name: "Pages" });
    expect(within(region).queryByText("<No Slug>")).toBeNull();
    expect(within(region).getByText("—")).toBeTruthy();
    expect(
      within(region).getByRole("link", { name: "Untitled (18)" }),
    ).toBeTruthy();
  });

  it("leaves the column menu off phones, where cards show no columns", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    setup();
    expect(screen.queryByRole("button", { name: "View" })).toBeNull();
    // Sort is the phone's control instead.
    expect(screen.getByRole("button", { name: /^Sort/ })).toBeTruthy();
  });

  it("keeps the Sort menu off the table view, where headers sort", () => {
    setup();
    expect(screen.queryByRole("button", { name: /^Sort/ })).toBeNull();
  });

  it("reads Payload's generated labels in sentence case with ID", () => {
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Grace Okafor",
          missionaryId: "33333333-3333-3333-3333-333333333333",
          templateKey: "giving",
        },
      ],
      totalDocs: 1,
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("missionaryId", "Missionary Id", "text", true),
      column("sourceId", "Source Id", "text", true),
      column("templateKey", "Template Key", "text", true),
      column("filename", "File Name", "text", true),
      column("updatedAt", "Updated At", "date", true),
      // A label that is not Payload's generated form is the author's: kept.
      column("summary", "Card Blurb", "text", true),
    ];
    view.rerender(
      <NativeCollectionGrid
        collectionSlug="missionary-giving-pages"
        title="Missionary Pages"
        useAsTitle="title"
        hasDrafts={false}
        listPath="/web-studio/collections/missionary-giving-pages"
        fields={[]}
      />,
    );
    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim());
    expect(headers).toEqual(
      expect.arrayContaining([
        "Source ID",
        // No missionary names load here, so the cells show IDs and the
        // column keeps the ID heading.
        "Missionary ID",
        "Template key",
        "File name",
        "Updated at",
        "Card Blurb",
      ]),
    );
  });

  it("keeps phone bulk actions on one row and marks Delete as destructive", () => {
    fixture.selected = new Map([[1, true]]);
    setup({
      bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
    });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    // Phones: tighter buttons and gaps, so Edit, Publish, Unpublish, Delete
    // and Clear share one row under the count instead of wrapping.
    const actions = bar.querySelector("[data-web-studio-bulk-actions]")!;
    const classes = actions.className.split(" ");
    expect(classes).toContain("gap-0.5");
    expect(classes).toContain("sm:gap-2");
    // Delete reads as the shared destructive Button.
    const remove = within(bar).getByRole("button", { name: "Delete" });
    const destructive = remove.closest("[data-web-studio-bulk-delete]")!;
    expect(destructive).toBeTruthy();
    // No `!` overrides: a scoped stylesheet outranks Payload's `.btn` rules
    // by specificity instead.
    expect(actions.className).not.toMatch(/!/);
    expect(destructive.className).not.toMatch(/!/);
    const css = readFileSync(BULK_ACTIONS_CSS, "utf8");
    expect(css).not.toMatch(/!important/);
    const toggle = cssRule(css, ":global(.delete-documents__toggle) {");
    expect(toggle).toContain("background-color: var(--destructive);");
    expect(toggle).toContain("color: var(--destructive-foreground);");
    expect(
      cssRule(
        css,
        ":global(.delete-documents__toggle):hover:not(:global(.btn--disabled)) {",
      ),
    ).toContain("var(--destructive) 90%");
    // Phones: tighter buttons, so the actions and Clear share one row.
    expect(css).toMatch(
      /@media \(width < 40rem\)[^}]*:global\(\.btn\) \{\s*padding-inline: calc\(var\(--spacing\) \* 1\.5\);/,
    );
    // The class the stylesheet targets is the one Payload's DeleteMany gives
    // its toggle (the mock above renders a bare button).
    expect(
      readFileSync(
        path.join(
          process.cwd(),
          "apps/admin/node_modules/@payloadcms/ui/dist/elements/DeleteMany/index.js",
        ),
        "utf8",
      ),
    ).toContain('className: "delete-documents__toggle"');
  });

  it("gives every View menu row one height and names the locked columns", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const panel = await screen.findByRole("dialog", { name: "Columns" });
    const rows = within(panel).getAllByRole("listitem");
    for (const row of rows) {
      expect(row.className.split(" ")).toContain("min-h-8");
    }
    const title = rows.find((row) => row.textContent?.startsWith("Title"))!;
    expect(title.textContent).toContain("Always shown");
    const slug = rows.find((row) => row.textContent?.startsWith("Slug"))!;
    expect(slug.textContent).not.toContain("Always shown");
  });

  it("names the missionary and fund behind reference IDs, keeping the copy button", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("/api/admin/missionaries")) {
        return Response.json({
          missionaries: [
            {
              id: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
              profile: { full_name: "Grace Okafor" },
            },
          ],
        });
      }
      return new Response("unexpected", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const view = setup({
      docs: [
        {
          id: 1,
          title: "Grace - Give",
          missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
        },
        {
          id: 2,
          title: "Unknown - Give",
          missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02",
        },
      ],
      totalDocs: 2,
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("missionaryId", "Missionary Id", "text", true),
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Giving Pages"
        useAsTitle="title"
        hasDrafts={false}
        listPath="/web-studio/collections/missionary-giving-pages"
        fields={[]}
      />,
    );
    const region = screen.getByRole("region", { name: "Giving Pages" });
    await waitFor(() =>
      expect(within(region).getByText("Grace Okafor")).toBeTruthy(),
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/admin/missionaries?limit=200",
    );
    // The full ID stays one click away.
    expect(
      within(region).getByRole("button", {
        name: "Copy Missionary ID 5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
      }),
    ).toBeTruthy();
    // An ID the viewer's list does not name keeps its short form.
    expect(within(region).getByText("5b0c2a52…0a02")).toBeTruthy();
    // The cells show names, so the column is headed "Missionary", not
    // "Missionary ID". Payload sorts it by the stored ID, and that sort is
    // kept (round 8 offered it), labelled as an ID order once chosen.
    const headers = within(region)
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim());
    expect(headers).toContain("Missionary");
    expect(headers).not.toContain("Missionary ID");
    expect(
      within(region).getByRole("button", { name: /^Missionary/ }),
    ).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("filters a reference column by the ID it stores, under the ID's own label", async () => {
    const grace = "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01";
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("/api/admin/missionaries")) {
        return Response.json({
          missionaries: [
            { id: grace, profile: { full_name: "Grace Okafor" } },
            {
              id: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02",
              profile: { full_name: "Samuel Mensah" },
            },
          ],
        });
      }
      return new Response("unexpected", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const view = setup({
        fields: [
          { name: "title", type: "text", label: "Title" },
          { name: "missionaryId", type: "text", label: "Missionary ID" },
        ],
        query: {
          sort: "title",
          page: 1,
          limit: 10,
          where: { or: [{ and: [{ missionaryId: { equals: grace } }] }] },
        },
        docs: [{ id: 1, title: "Grace - Give", missionaryId: grace }],
        totalDocs: 1,
      });
      fixture.columns = [
        column("title", "Title", "text", true),
        column("missionaryId", "Missionary ID", "text", true),
      ];
      view.rerender(
        <NativeCollectionGrid
          title="Giving Pages"
          useAsTitle="title"
          hasDrafts={false}
          listPath="/web-studio/collections/missionary-giving-pages"
          fields={
            [
              { name: "title", type: "text", label: "Title" },
              { name: "missionaryId", type: "text", label: "Missionary ID" },
            ] as never
          }
        />,
      );
      const region = screen.getByRole("region", { name: "Giving Pages" });
      await waitFor(() =>
        expect(within(region).getAllByText("Grace Okafor").length).toBe(1),
      );
      // The names list holds at most 200 records, so filtering by name
      // would lose every missionary past it, and any applied ID it does not
      // hold. The filter matches the stored ID (copied from the cell's copy
      // button) and says so.
      const panel = screen.getByRole("group", { name: "Filter giving pages" });
      expect(panel.textContent).toContain("Missionary ID");
      expect(panel.textContent).not.toMatch(/can.t show/);
      expect(
        within(panel)
          .getAllByRole("textbox")
          .some((input) => (input as HTMLInputElement).value === grace),
      ).toBe(true);
      expect(panel.textContent).not.toContain("Grace Okafor");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps a saved sort on a named reference column and says it is by ID", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("/api/admin/missionaries")) {
        return Response.json({
          missionaries: [
            {
              id: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
              profile: { full_name: "Grace Okafor" },
            },
          ],
        });
      }
      return new Response("unexpected", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      // A saved preference or a link from before names showed.
      const view = setup({
        query: { sort: "-missionaryId", page: 1, limit: 10 },
        docs: [
          {
            id: 1,
            title: "Grace - Give",
            missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
          },
        ],
        totalDocs: 1,
      });
      fixture.columns = [
        column("title", "Title", "text", true),
        column("missionaryId", "Missionary ID", "text", true),
      ];
      view.rerender(
        <NativeCollectionGrid
          title="Giving Pages"
          useAsTitle="title"
          hasDrafts={false}
          listPath="/web-studio/collections/missionary-giving-pages"
          fields={[]}
        />,
      );
      const region = screen.getByRole("region", { name: "Giving Pages" });
      await waitFor(() =>
        expect(within(region).getByText("Grace Okafor")).toBeTruthy(),
      );
      // A saved preference or link keeps its order (an existing feature);
      // the header says the order is by ID, since names would sort apart.
      await act(async () => {});
      expect(fixture.handleSortChange).not.toHaveBeenCalled();
      const missionary = within(region)
        .getAllByRole("columnheader")
        .find((header) => header.textContent?.trim() === "Missionary (by ID)")!;
      expect(missionary.getAttribute("aria-sort")).toBe("descending");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("offers a named reference column's phone sort as an ID order", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("/api/admin/missionaries")) {
        return Response.json({
          missionaries: [
            {
              id: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
              profile: { full_name: "Grace Okafor" },
            },
          ],
        });
      }
      return new Response("unexpected", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const view = setup({
        query: { sort: "-missionaryId", page: 1, limit: 10 },
        docs: [
          {
            id: 1,
            title: "Grace - Give",
            missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
          },
        ],
        totalDocs: 1,
      });
      fixture.columns = [
        column("title", "Title", "text", true),
        column("missionaryId", "Missionary ID", "text", true),
      ];
      view.rerender(
        <NativeCollectionGrid
          title="Giving Pages"
          useAsTitle="title"
          hasDrafts={false}
          listPath="/web-studio/collections/missionary-giving-pages"
          fields={[]}
        />,
      );
      await waitFor(() =>
        expect(screen.getAllByText("Grace Okafor").length).toBeGreaterThan(0),
      );
      // Payload orders the column by the stored ID, so the phone summary and
      // its choice say so rather than promising an order by name.
      const trigger = await screen.findByRole("button", { name: /^Sort/ });
      expect(trigger.textContent).toContain("by Missionary ID descending");
      fireEvent.click(trigger);
      const choice = await screen.findByRole("menuitemradio", {
        name: "Missionary ID",
      });
      expect(choice.getAttribute("aria-checked")).toBe("true");
      expect(
        screen.queryByRole("menuitemradio", { name: "Missionary" }),
      ).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps a reference column sort while its cells show IDs", async () => {
    const fetchMock = vi.fn(
      async () => new Response("forbidden", { status: 403 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const view = setup({
        query: { sort: "missionaryId", page: 1, limit: 10 },
        docs: [
          {
            id: 1,
            title: "Grace - Give",
            missionaryId: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
          },
        ],
        totalDocs: 1,
      });
      fixture.columns = [
        column("title", "Title", "text", true),
        column("missionaryId", "Missionary ID", "text", true),
      ];
      view.rerender(
        <NativeCollectionGrid
          title="Giving Pages"
          useAsTitle="title"
          hasDrafts={false}
          listPath="/web-studio/collections/missionary-giving-pages"
          fields={[]}
        />,
      );
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      await act(async () => {});
      expect(fixture.handleSortChange).not.toHaveBeenCalled();
      const region = screen.getByRole("region", { name: "Giving Pages" });
      const header = within(region)
        .getAllByRole("columnheader")
        .find((cell) => cell.textContent?.trim() === "Missionary ID")!;
      expect(header.getAttribute("aria-sort")).toBe("ascending");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  describe("at 1024, beside the rail", () => {
    const pagesColumns = () => [
      column("title", "Title", "text", true),
      column("slug", "Slug", "text", true),
      {
        ...column("tenant", "Organization", "relationship", true),
        field: {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          label: "Organization",
        },
      },
      column("updatedAt", "Updated at", "date", true),
    ];
    const tenantFields = [
      { name: "title", type: "text", label: "Title" },
      {
        name: "tenant",
        type: "relationship",
        relationTo: "tenants",
        label: "Organization",
      },
    ];
    const tenants = (docs: Array<{ id: number; name: string }>) =>
      vi.fn(async () => ({ ok: true, json: async () => ({ docs }) }));

    async function renderPages(fetchMock: ReturnType<typeof tenants>) {
      vi.stubGlobal("fetch", fetchMock);
      // The 1024 capture: the list panel is about 743px wide.
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        width: 743,
      } as DOMRect);
      const view = setup({
        bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
        fields: tenantFields,
      });
      fixture.columns = pagesColumns();
      view.rerender(
        <NativeCollectionGrid
          title="Pages"
          useAsTitle="title"
          hasDrafts
          listPath="/web-studio/collections/pages"
          fields={tenantFields as never}
          bulk={{ collection: { slug: "pages" } } as never}
        />,
      );
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      await act(async () => {});
      return screen.getByRole("region", { name: "Pages" });
    }

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("counts each heading's width, so a table that would scroll turns to cards", async () => {
      const region = await renderPages(
        tenants([
          { id: 1, name: "E2E Tenant" },
          { id: 2, name: "Second Tenant" },
        ]),
      );
      // "Organization" with its sort button is wider than an organization's
      // name; counted, the five columns no longer fit 743px.
      expect(within(region).queryByRole("table")).toBeNull();
      expect(within(region).getByRole("list", { name: "Pages" })).toBeTruthy();
    });

    it("leaves out Organization when the viewer has only one, keeping the table", async () => {
      const region = await renderPages(
        tenants([{ id: 1, name: "E2E Tenant" }]),
      );
      const table = within(region).getByRole("table");
      const headers = within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent?.trim());
      expect(headers).toContain("Updated at");
      expect(headers).not.toContain("Organization");
      // Payload's saved columns still list it; toggling another column must
      // not drop it.
      expect(fixture.setActiveColumns).not.toHaveBeenCalled();
    });
  });

  it("keeps the table at 1024 when the visible columns fit the panel", () => {
    // The 1024 capture: the list panel is about 743px wide beside the rail.
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 743 } as DOMRect);
    const view = setup({
      bulk: { collection: { slug: "pages" }, hasDeletePermission: true },
    });
    fixture.columns = [
      column("title", "Title", "text", true),
      column("slug", "Slug", "text", true),
      {
        ...column("tenant", "Tenant", "relationship", true),
        field: {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          label: "Tenant",
        },
      },
      column("updatedAt", "Updated At", "date", true),
    ];
    view.rerender(
      <NativeCollectionGrid
        title="Pages"
        useAsTitle="title"
        hasDrafts
        listPath="/web-studio/collections/pages"
        fields={[]}
        bulk={{ collection: { slug: "pages" } } as never}
      />,
    );
    const region = screen.getByRole("region", { name: "Pages" });
    expect(within(region).getByRole("table")).toBeTruthy();
    rect.mockRestore();
  });
});
