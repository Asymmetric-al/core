/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/crm"} */

import { QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { CrmGridRow } from "@asym/database/types";
import type { ComponentType } from "react";

/**
 * CRM records workspace (/crm): the ReUI grid shows every loaded record and
 * keeps loading pages, money is integer cents, and every control is honest.
 */

const route = vi.hoisted(() => ({
  search: "",
  listeners: new Set<() => void>(),
  push: vi.fn(),
  replace: vi.fn(),
}));
const grid = vi.hoisted(() => ({ hook: vi.fn() }));
const detail = vi.hoisted(() => ({ hook: vi.fn() }));

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    usePathname: () => "/crm",
    useRouter: () => ({ push: route.push, replace: route.replace }),
    useSearchParams: () => {
      const search = useSyncExternalStore(
        (listener) => {
          route.listeners.add(listener);
          return () => route.listeners.delete(listener);
        },
        () => route.search,
      );
      return new URLSearchParams(search);
    },
  };
});

vi.mock("@asym/database/hooks", () => ({
  useAdminCrmTagOptions: () => ({ data: [] }),
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: ["admin", "attention"],
  useAdminCrmRecordsInfiniteGrid: grid.hook,
  useAdminCrmRecordDetail: detail.hook,
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

// The drawer and gift overlay have their own suites; keep this one on the grid.
vi.mock("../../../../../apps/admin/app/(app)/crm/detail-drawer", () => ({
  DetailDrawer: ({
    contact,
    open,
    onClose,
    onClosed,
  }: {
    contact: CrmGridRow;
    open?: boolean;
    onClose: () => void;
    onClosed?: () => void;
  }) => (
    <div
      role="dialog"
      aria-label="Donor details"
      data-open={String(open ?? true)}
    >
      {contact.displayName}
      <button type="button" onClick={onClose}>
        Close drawer
      </button>
      <button type="button" onClick={onClosed}>
        Finish closing
      </button>
    </div>
  ),
}));
vi.mock(
  "../../../../../apps/admin/app/(app)/contributions/contribution-detail-overlay",
  () => ({ ContributionDetailOverlay: () => null }),
);

function makeRow(index: number, overrides: Partial<CrmGridRow> = {}) {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `record-${number}`,
    recordType: "individual",
    displayName: `Record person ${number}`,
    title: null,
    primaryOrganization: null,
    primaryContactLine: null,
    location: "Austin, TX",
    lifecycleStatus: index % 5 === 0 ? "prospect" : "active",
    lastGiftAt: "2026-10-01T12:00:00.000Z",
    lifetimeGiving: 10_000,
    fundsGivenToSummary: null,
    lastTouchAt: "2026-10-02T12:00:00.000Z",
    nextTaskSummary: null,
    portalAccessLabel: "none",
    linkedAuthUserId: null,
    tags: [],
    assignedMissionaryName: null,
    avatarUrl: null,
    email: `person${number}@example.org`,
    phone: null,
    notesPreview: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-10-02T12:00:00.000Z",
    ...overrides,
  } satisfies CrmGridRow;
}

const SIXTY_ROWS = Array.from({ length: 60 }, (_, index) => makeRow(index));

function gridState(overrides: Record<string, unknown> = {}) {
  return {
    columnFilters: [],
    hasMore: false,
    isFetchingMore: false,
    isLoading: false,
    loadMore: vi.fn(),
    onFiltersChange: vi.fn(),
    onRefresh: vi.fn().mockResolvedValue(undefined),
    onSortingChange: vi.fn(),
    rows: SIXTY_ROWS,
    sorting: [{ id: "lastTouchAt", desc: true }],
    tableError: null,
    ...overrides,
  };
}

let CrmWorkspace: ComponentType;
const clientHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "clientHeight",
);

function renderWorkspace() {
  return render(
    <QueryProvider>
      <CrmWorkspace />
    </QueryProvider>,
  );
}

function recordButtons() {
  return screen.getAllByRole("button", { name: /^Record person \d+/ });
}

describe("CRM records workspace", () => {
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    CrmWorkspace = (
      await import("../../../../../apps/admin/app/(app)/crm/page-client")
    ).default;
  }, 120_000);

  beforeEach(() => {
    route.search = "";
    route.push.mockImplementation((url: string) => {
      route.search = url.split("?")[1] ?? "";
      for (const listener of route.listeners) listener();
    });
    route.replace.mockImplementation((url: string) => {
      route.search = url.split("?")[1] ?? "";
      for (const listener of route.listeners) listener();
    });
    grid.hook.mockReturnValue(gridState());
    detail.hook.mockReturnValue({ data: undefined, dataUpdatedAt: 0 });
    // A desktop viewport: wide enough for the full default column set.
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("min-width: 1280px"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.scrollIntoView ??= () => {};
    // jsdom has no layout: give the virtualized grid body a tall viewport so
    // every loaded row is inside the rendered window.
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 6000,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    route.listeners.clear();
  });

  afterAll(() => {
    if (clientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientHeight",
        clientHeight,
      );
    }
  });

  it("renders every loaded record instead of a ten-row page", async () => {
    renderWorkspace();
    await waitFor(() => expect(recordButtons()).toHaveLength(60));
    expect(screen.getByRole("region", { name: "CRM records" })).toBeTruthy();
  });

  it("says how many records are listed in the toolbar, not only at the end", async () => {
    renderWorkspace();
    const region = await screen.findByRole("region", { name: "CRM records" });
    const toolbar = region.querySelector(
      "[data-slot='data-grid-panel-toolbar']",
    )!;
    await waitFor(() => expect(toolbar.textContent).toContain("60 records"));
  });

  it("counts loaded records while more remain to load", async () => {
    grid.hook.mockReturnValue(gridState({ hasMore: true }));
    renderWorkspace();
    const region = await screen.findByRole("region", { name: "CRM records" });
    const toolbar = region.querySelector(
      "[data-slot='data-grid-panel-toolbar']",
    )!;
    await waitFor(() => expect(toolbar.textContent).toContain("60 loaded"));
  });

  it("says the count once when every record is loaded", async () => {
    grid.hook.mockReturnValue(
      gridState({
        columnFilters: [{ id: "displayName", value: "Record person 01" }],
        rows: [makeRow(0)],
      }),
    );
    renderWorkspace();
    const region = await screen.findByRole("region", { name: "CRM records" });
    const toolbar = region.querySelector(
      "[data-slot='data-grid-panel-toolbar']",
    )!;
    await waitFor(() => expect(toolbar.textContent).toContain("1 record"));
    // The toolbar holds the count; the list end does not repeat it.
    expect(region.textContent).not.toMatch(/records? loaded/);
  });

  it("names Reset in visible text so it is not mistaken for clearing search", async () => {
    const state = gridState({
      columnFilters: [{ id: "displayName", value: "Record" }],
    });
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    const reset = await screen.findByRole("button", { name: "Reset" });
    // The search box has its own clear ×; Reset says what it does.
    expect(reset.textContent?.trim()).toBe("Reset");
    fireEvent.click(reset);
    expect(state.onFiltersChange).toHaveBeenCalledWith([]);
  });

  it("loads the next page when the end of the loaded records is reached", async () => {
    const state = gridState({ hasMore: true });
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    await waitFor(() => expect(state.loadMore).toHaveBeenCalled());
  });

  it("formats lifetime giving from integer cents", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, {
            displayName: "Record person Theodore",
            lifetimeGiving: 241_000,
          }),
        ],
      }),
    );
    renderWorkspace();
    expect(await screen.findByText("$2,410.00")).toBeTruthy();
    expect(screen.queryByText("$241,000.00")).toBeNull();
  });

  it("opens a record from its row primary through the donor URL contract", async () => {
    renderWorkspace();
    const [first] = await waitFor(() => recordButtons());
    fireEvent.click(first!);
    expect(route.replace).toHaveBeenLastCalledWith("/crm?donor=record-01", {
      scroll: false,
    });
    expect(
      screen.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toContain("Record person 01");
  });

  it("offers no dead record controls and exports the donor report", async () => {
    renderWorkspace();
    await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
    expect(screen.queryByRole("button", { name: /new record/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /archive/i })).toBeNull();
    // The report ignores the grid search and filters, so its label names the
    // report rather than reading as "export this view".
    const exportLink = screen.getByRole("link", { name: /export/i });
    expect(exportLink.textContent).toBe("Export donor report");
    expect(exportLink.getAttribute("href")).toBe(
      "/api/admin/crm/reports/export?slice=donors",
    );
  });

  it("does not repeat an organization's name as its own subline", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, {
            displayName: "Record person 01 Bank",
            primaryOrganization: "Record person 01 Bank",
            recordType: "Organization",
          }),
        ],
      }),
    );
    renderWorkspace();
    // The row primary's name is the record name alone, with no repeated
    // organization subline.
    expect(
      await screen.findByRole("button", { name: "Record person 01 Bank" }),
    ).toBeTruthy();
  });

  it("replaces the generic load failure with a cause-neutral next step", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [],
        tableError: new Error("Failed to load CRM records (500)"),
      }),
    );
    renderWorkspace();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Couldn't load CRM records");
    // A 500 or a failed query is not a connection problem; never guess one.
    expect(alert.textContent).toContain(
      "Something went wrong while loading. Retry, or try again in a few minutes.",
    );
    expect(alert.textContent).not.toMatch(/connection/i);
    expect(alert.textContent).not.toContain("Failed to load CRM records");
  });

  function describedText(element: HTMLElement) {
    return (element.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
  }

  it("disables the donor report while records cannot load, and says why", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [],
        tableError: new Error("Failed to load CRM records (500)"),
      }),
    );
    renderWorkspace();
    await screen.findByRole("alert");
    expect(screen.queryByRole("link", { name: /export/i })).toBeNull();
    const report = screen.getByRole("button", { name: "Export donor report" });
    expect(report.getAttribute("aria-disabled")).toBe("true");
    expect(describedText(report)).toContain(
      "Unavailable while CRM records can't load.",
    );
  });

  it("keeps the donor report when the CRM list is empty", async () => {
    // The report is built on the server from donations, including ones with
    // no donor record, so an empty CRM list does not mean an empty report.
    grid.hook.mockReturnValue(gridState({ rows: [] }));
    renderWorkspace();
    await screen.findByText("No CRM records");
    expect(
      screen.getByRole("link", { name: "Export donor report" }),
    ).toBeTruthy();
  });

  it("keeps the donor report when a later page fails but records are loaded", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [makeRow(0)],
        tableError: new Error("Failed to load CRM records (500)"),
      }),
    );
    renderWorkspace();
    expect(
      screen.getByRole("link", { name: "Export donor report" }),
    ).toBeTruthy();
  });

  it("keeps the donor report when only a search or filter is empty", async () => {
    // The report ignores search and filters, so it still has rows to export.
    grid.hook.mockReturnValue(
      gridState({
        rows: [],
        columnFilters: [{ id: "displayName", value: "nobody" }],
      }),
    );
    renderWorkspace();
    const report = await screen.findByRole("link", {
      name: "Export donor report",
    });
    expect(report.getAttribute("href")).toBe(
      "/api/admin/crm/reports/export?slice=donors",
    );
  });

  it("names a dropped connection only when the browser reports one", async () => {
    grid.hook.mockReturnValue(
      gridState({ rows: [], tableError: new TypeError("Failed to fetch") }),
    );
    renderWorkspace();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Check your connection, then retry.");
    expect(alert.textContent).not.toContain("Failed to fetch");
  });

  it("keeps a row menu press from reaching the row's own click handler", async () => {
    const { CrmRecordActions } =
      await import("../../../../../apps/admin/app/(app)/crm/columns");
    const rowClick = vi.fn();
    const openRecord = vi.fn();
    render(
      // The grid row opens the record on click (ReUI onRowClick).
      <div role="row" onClick={rowClick}>
        <CrmRecordActions record={makeRow(0)} onViewRecord={openRecord} />
      </div>,
    );
    const trigger = screen.getByRole("button", {
      name: "CRM actions for Record person 01",
    });
    fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
    fireEvent.mouseDown(trigger, { button: 0 });
    fireEvent.mouseUp(trigger, { button: 0 });
    fireEvent.click(trigger, { detail: 1, button: 0 });
    // Enter on a focused button dispatches a click with detail 0.
    fireEvent.click(trigger, { detail: 0 });
    expect(rowClick).not.toHaveBeenCalled();
    expect(openRecord).not.toHaveBeenCalled();
  });

  it("opens the row menu without opening the record behind it", async () => {
    renderWorkspace();
    await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
    const trigger = within(screen.getByRole("table")).getByRole("button", {
      name: "CRM actions for Record person 01",
    });
    // A mouse press as a browser dispatches it (the menu opens on mousedown,
    // then the click bubbles to the row), then a keyboard Enter's click.
    const mousePress = () => {
      fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
      fireEvent.mouseDown(trigger, { button: 0 });
      fireEvent.pointerUp(trigger, { pointerType: "mouse", button: 0 });
      fireEvent.mouseUp(trigger, { button: 0 });
      fireEvent.click(trigger, { detail: 1, button: 0 });
    };
    const keyboardPress = () => {
      fireEvent.keyDown(trigger, { key: "Enter" });
      fireEvent.click(trigger, { detail: 0 });
      fireEvent.keyUp(trigger, { key: "Enter" });
    };
    for (const press of [mousePress, keyboardPress]) {
      press();
      const menu = await screen.findByRole("menu");
      const group = within(menu).getByRole("group", { name: "Actions" });
      expect(
        within(group).getByRole("menuitem", { name: "Copy email" }),
      ).toBeTruthy();
      expect(
        within(group).getByRole("menuitem", { name: "Open details" }),
      ).toBeTruthy();
      expect(route.replace).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("dialog", { name: "Donor details" }),
      ).toBeNull();
      fireEvent.keyDown(menu, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    }
  });

  describe("below the md breakpoint", () => {
    const innerWidth = window.innerWidth;
    beforeEach(() => {
      window.innerWidth = 390;
    });
    afterEach(() => {
      window.innerWidth = innerWidth;
    });

    it("gives a long record name its own line, apart from the status badge", async () => {
      grid.hook.mockReturnValue(
        gridState({
          rows: [
            makeRow(0, {
              displayName: "St. Andrew's Presbyterian Church of the Lakes",
              recordType: "Church",
              lifecycleStatus: "active",
            }),
          ],
        }),
      );
      renderWorkspace();
      const list = await screen.findByRole("list", { name: "CRM records" });
      const [card] = within(list).getAllByRole("listitem");
      const primary = within(card!).getByRole("button", {
        name: "St. Andrew's Presbyterian Church of the Lakes",
      });
      // The name's line holds the name alone; the badge sits on the next line.
      expect(primary.parentElement!.textContent).toBe(
        "St. Andrew's Presbyterian Church of the Lakes",
      );
      expect(within(card!).getByText("Active")).toBeTruthy();
    });

    it("orders the card's line as the table does: type, owner, then the title", async () => {
      grid.hook.mockReturnValue(
        gridState({
          rows: [
            makeRow(0, {
              displayName: "Theodore Lindqvist",
              primaryOrganization: null,
              title: "High school chemistry teacher and robotics club advisor",
              recordType: "Individual",
              assignedMissionaryName: "Priya Nair",
            }),
          ],
        }),
      );
      renderWorkspace();
      const list = await screen.findByRole("list", { name: "CRM records" });
      const [card] = within(list).getAllByRole("listitem");
      const title = within(card!).getByTitle(
        "High school chemistry teacher and robotics club advisor",
      );
      const line = title.parentElement!;
      // The table's order, but on a phone the title takes its own line
      // (up to two) so neither it nor the owner is cut to a few letters.
      expect(line.textContent).toMatch(
        /^Individual.*Owner: Priya Nair.*High school chemistry/,
      );
      expect(line.lastElementChild).toBe(title);
      const owner = within(line).getByText("Priya Nair", { exact: false });
      expect(
        owner.closest("span[data-slot='crm-subline-meta']"),
      ).not.toBeNull();
      expect(title.className).toMatch(/(^|\s)line-clamp-2(\s|$)/);
      expect(title.className).not.toMatch(/(^|\s)truncate(\s|$)/);
      // The date has its own line, apart from the owner.
      expect(line.textContent).not.toContain("Updated");
      expect(card!.textContent).toContain("Updated Oct 2, 2026");
    });

    it("offers server sorting on phones, where the table headers are gone", async () => {
      const state = gridState();
      grid.hook.mockReturnValue(state);
      renderWorkspace();
      const sort = await screen.findByRole("combobox", {
        name: "Sort records",
      });
      expect(sort.textContent).toContain("Updated: newest");
      fireEvent.click(sort);
      fireEvent.pointerDown(screen.getByRole("option", { name: "Name: A–Z" }), {
        pointerType: "mouse",
      });
      fireEvent.click(screen.getByRole("option", { name: "Name: A–Z" }));
      await waitFor(() =>
        expect(state.onSortingChange).toHaveBeenCalledWith([
          { id: "displayName", desc: false },
        ]),
      );
    });

    it("shows the active sort's date and the owner on each card", async () => {
      const row = makeRow(0, {
        assignedMissionaryName: "Priya Nair",
        lastGiftAt: "2026-10-25T12:00:00.000Z",
        lastTouchAt: "2026-10-31T12:00:00.000Z",
      });
      grid.hook.mockReturnValue(gridState({ rows: [row] }));
      const view = renderWorkspace();
      let card = within(
        await screen.findByRole("list", { name: "CRM records" }),
      ).getAllByRole("listitem")[0]!;
      // Default order is last updated, newest first: the card says when.
      expect(card.textContent).toContain("Updated Oct 31, 2026");
      expect(card.textContent).toContain("Owner: Priya Nair");

      grid.hook.mockReturnValue(
        gridState({
          rows: [row],
          sorting: [{ id: "lastGiftAt", desc: true }],
        }),
      );
      view.rerender(
        <QueryProvider>
          <CrmWorkspace />
        </QueryProvider>,
      );
      card = within(
        screen.getByRole("list", { name: "CRM records" }),
      ).getAllByRole("listitem")[0]!;
      expect(card.textContent).toContain("Last gift Oct 25, 2026");
      expect(card.textContent).not.toContain("Updated");
    });

    it("says a record has no gift yet when sorted by last gift", async () => {
      grid.hook.mockReturnValue(
        gridState({
          rows: [makeRow(0, { lastGiftAt: null })],
          sorting: [{ id: "lastGiftAt", desc: true }],
        }),
      );
      renderWorkspace();
      const card = within(
        await screen.findByRole("list", { name: "CRM records" }),
      ).getAllByRole("listitem")[0]!;
      expect(card.textContent).toContain("No gift yet");
      expect(card.textContent).not.toContain("Owner:");
    });

    it("keeps refresh and the donor report on phones as named icon buttons", async () => {
      const state = gridState();
      grid.hook.mockReturnValue(state);
      renderWorkspace();
      const refresh = await screen.findByRole("button", { name: "Refresh" });
      fireEvent.click(refresh);
      expect(state.onRefresh).toHaveBeenCalledTimes(1);
      const report = screen.getByRole("link", { name: "Export donor report" });
      expect(report.getAttribute("href")).toBe(
        "/api/admin/crm/reports/export?slice=donors",
      );
    });

    it("says how many records are listed on phones too", async () => {
      renderWorkspace();
      const region = await screen.findByRole("region", {
        name: "CRM records",
      });
      const toolbar = region.querySelector(
        "[data-slot='data-grid-panel-toolbar']",
      )!;
      await waitFor(() => expect(toolbar.textContent).toContain("60 records"));
    });

    it("keeps each card's row actions reachable", async () => {
      renderWorkspace();
      const list = await screen.findByRole("list", { name: "CRM records" });
      const [firstCard] = within(list).getAllByRole("listitem");
      expect(
        within(firstCard!).getByRole("button", { name: /^Record person 01/ }),
      ).toBeTruthy();
      expect(
        within(firstCard!).getByRole("button", {
          name: "CRM actions for Record person 01",
        }),
      ).toBeTruthy();
    });
  });

  describe("on a 1024px-wide viewport", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      // The panel measures 760px: too narrow for every default column.
      Element.prototype.getBoundingClientRect = function () {
        return { ...getBoundingClientRect.call(this), width: 760 };
      };
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    function headers() {
      return within(screen.getByRole("table"))
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim())
        .filter(Boolean);
    }

    it("keeps the sorted column visible", async () => {
      renderWorkspace();
      await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
      // Sorted by last update (the default), so Updated stays on screen.
      expect(headers()).toContain("Updated");
      expect(headers()).not.toContain("Tags");
    });

    it("moves the hidden type and owner under the record name", async () => {
      grid.hook.mockReturnValue(
        gridState({
          rows: [
            makeRow(0, {
              recordType: "Church",
              title: "Mission partner",
              assignedMissionaryName: "Priya Nair",
            }),
          ],
        }),
      );
      renderWorkspace();
      const [primary] = await waitFor(() => recordButtons());
      expect(headers()).not.toContain("Type");
      expect(headers()).not.toContain("Owner");
      expect(primary!.textContent).toContain("Mission partner");
      expect(primary!.textContent).toContain("Church");
      expect(primary!.textContent).toContain("Owner: Priya Nair");
      // On a tight line the title yields first, so the owner keeps room. A
      // finite shrink weight is not enough: flex weights shrink by basis, so
      // the owner would still give up a sliver and show an ellipsis. The
      // title starts from a zero basis and grows only into spare room, up to
      // its own width, so it takes none of the overflow.
      // A truncated title keeps its full text on hover, and it ends the
      // line, so its ellipsis never leaves a gap before the type or owner.
      const title = primary!.querySelector<HTMLElement>(
        '[title="Mission partner"]',
      )!;
      expect(title).toBeTruthy();
      expect(title.textContent).toContain("Mission partner");
      expect(title.parentElement!.lastElementChild).toBe(title);
      expect(title.parentElement!.className).not.toMatch(/(^|\s)gap-/);
      expect(primary!.textContent).toMatch(
        /Church.*Priya Nair.*Mission partner/,
      );
      expect(title.className).toMatch(/(^|\s)basis-0(\s|$)/);
      expect(title.className).toMatch(/(^|\s)grow(\s|$)/);
      expect(title.className).toMatch(/(^|\s)max-w-fit(\s|$)/);
      expect(title.className).not.toMatch(/(^|\s)shrink-[1-9]\d*(\s|$)/);
      const owner = within(primary!).getByText("Priya Nair", {
        exact: false,
      }).parentElement!;
      expect(owner.className).not.toMatch(/(^|\s)shrink-[1-9]\d*(\s|$)/);
    });

    it("does not repeat a type kept in its column for sorting", async () => {
      grid.hook.mockReturnValue(
        gridState({
          rows: [makeRow(0, { recordType: "Church" })],
          sorting: [{ id: "recordType", desc: false }],
        }),
      );
      renderWorkspace();
      const [primary] = await waitFor(() => recordButtons());
      expect(headers()).toContain("Type");
      expect(primary!.textContent).not.toContain("Church");
    });

    it("shows a filtered column, so filtered rows carry their cue", async () => {
      grid.hook.mockReturnValue(
        gridState({
          columnFilters: [{ id: "portalAccessLabel", value: ["linked"] }],
          rows: [makeRow(0, { portalAccessLabel: "linked" })],
        }),
      );
      renderWorkspace();
      await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
      expect(headers()).toContain("Portal");
      expect(
        within(screen.getByRole("table")).getByText("Linked"),
      ).toBeTruthy();
    });
  });

  it("offers a skip link that lands on the first record", async () => {
    renderWorkspace();
    await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
    const link = screen.getByRole("link", { name: "Skip to records" });
    expect(link.className.split(" ")).toEqual(
      expect.arrayContaining([
        "opacity-0",
        "focus:opacity-100",
        "focus:ring-2",
        "focus:ring-ring",
      ]),
    );
    fireEvent.click(link);
    expect(document.activeElement).toBe(recordButtons()[0]);
  });

  it("skips past the board's search and filters to its first card", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, {
            displayName: "Record person Theodore",
            lifecycleStatus: "active",
          }),
          makeRow(1, { lifecycleStatus: "inactive" }),
        ],
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    fireEvent.click(screen.getByRole("link", { name: "Skip to records" }));
    // The board's search is already the next Tab stop: skipping must land
    // past it, on the first card's open control.
    expect(document.activeElement).toBe(
      within(board).getByRole("button", { name: /Record person Theodore/ }),
    );
    expect(document.activeElement?.className.split(" ")).toEqual(
      expect.arrayContaining([
        "focus-visible:after:ring-3",
        "focus-visible:after:ring-ring/50",
      ]),
    );
    expect(document.activeElement?.className.split(" ")).not.toContain(
      "outline-none",
    );
  });

  it("keeps the filtered desktop toolbar to one row, with no spacer gap", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [makeRow(0)],
        columnFilters: [{ id: "displayName", value: "Record" }],
      }),
    );
    renderWorkspace();
    const region = await screen.findByRole("region", { name: "CRM records" });
    const toolbar = region.querySelector<HTMLElement>(
      "[data-slot='data-grid-panel-toolbar']",
    )!;
    // The actions push right with ms-auto; an empty grow spacer between
    // them and the filters only costs a gap and wraps the row at 1440.
    expect(toolbar.querySelector(".grow[aria-hidden='true']")).toBeNull();
    const search = within(toolbar).getByRole("searchbox", {
      name: "Search CRM records",
    });
    // A slightly narrower box leaves room for the filters and actions.
    expect(search.closest('[class~="sm:w-60"]')).toBeTruthy();
  });

  it("says what the donor report covers to keyboard and screen-reader users", async () => {
    renderWorkspace();
    await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
    const exportLink = screen.getByRole("link", { name: /export/i });
    const describedBy = exportLink.getAttribute("aria-describedby") ?? "";
    const description = describedBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(description).toContain("Search and filters don't apply");
  });

  it("applies a Support Hub ?email= link as the record search", async () => {
    route.search = "email=alice%40example.org";
    const state = gridState();
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    await waitFor(() => expect(state.onFiltersChange).toHaveBeenCalled());
    const update = state.onFiltersChange.mock.calls[0]![0] as
      unknown[] | ((current: unknown[]) => unknown[]);
    const next = typeof update === "function" ? update([]) : update;
    expect(next).toEqual([{ id: "displayName", value: "alice@example.org" }]);
  });

  describe("list state in the address", () => {
    function followReplaceState() {
      return vi
        .spyOn(window.history, "replaceState")
        .mockImplementation((_data, _unused, url) => {
          route.search = String(url ?? "").split("?")[1] ?? "";
          for (const listener of route.listeners) listener();
        });
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("restores search, filters, sort and the board view from the address", async () => {
      route.search =
        "q=hale&status=at_risk&sort=displayName&dir=asc&view=board";
      renderWorkspace();

      expect(grid.hook).toHaveBeenCalledWith({
        initialColumnFilters: [
          { id: "displayName", value: "hale" },
          { id: "lifecycleStatus", value: ["at_risk"] },
        ],
        initialSorting: [{ id: "displayName", desc: false }],
      });
      expect(
        await screen.findByRole("region", { name: /^Active/ }),
      ).toBeTruthy();
    });

    it("writes list changes to the address and keeps the open donor", async () => {
      const replaceState = followReplaceState();
      route.search = "donor=record-01";
      grid.hook.mockReturnValue(
        gridState({
          columnFilters: [{ id: "displayName", value: "hale" }],
          sorting: [{ id: "lifetimeGiving", desc: true }],
        }),
      );
      renderWorkspace();

      await waitFor(() =>
        expect(replaceState).toHaveBeenLastCalledWith(
          null,
          "",
          "/crm?donor=record-01&q=hale&sort=lifetimeGiving&dir=desc",
        ),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Show CRM kanban view" }),
      );
      await waitFor(() => expect(route.search).toContain("view=board"));
      // Writing the address does not echo back into the list state.
      expect(
        (grid.hook.mock.results.at(-1)?.value as ReturnType<typeof gridState>)
          .onFiltersChange,
      ).not.toHaveBeenCalled();
    });

    it("follows Back and Forward to another list state", async () => {
      const state = gridState();
      grid.hook.mockReturnValue(state);
      renderWorkspace();
      await screen.findByRole("searchbox", { name: "Search CRM records" });

      act(() => {
        route.search = "q=back&sort=lastGiftAt&dir=asc&view=board";
        for (const listener of route.listeners) listener();
      });

      await waitFor(() =>
        expect(state.onFiltersChange).toHaveBeenLastCalledWith([
          { id: "displayName", value: "back" },
        ]),
      );
      expect(state.onSortingChange).toHaveBeenLastCalledWith([
        { id: "lastGiftAt", desc: false },
      ]);
      expect(
        await screen.findByRole("region", { name: /^Active/ }),
      ).toBeTruthy();
    });
  });

  describe("a linked record that can't be loaded", () => {
    function failedDetail(status: number) {
      return {
        data: undefined,
        dataUpdatedAt: 0,
        isError: true,
        error: Object.assign(new Error("Failed"), { status }),
        isFetching: false,
        refetch: vi.fn(),
      };
    }

    it("says so, without naming a cause it can't know, and Dismiss clears the link", async () => {
      route.search = "donor=gone&q=hale";
      detail.hook.mockReturnValue(failedDetail(404));
      renderWorkspace();

      const alert = await screen.findByRole("alert");
      expect(within(alert).getByText("Couldn't open that record")).toBeTruthy();
      expect(alert.textContent).toMatch(/may have been removed/);
      // Trying again can't bring back a record that isn't there.
      expect(within(alert).queryByRole("button", { name: "Retry" })).toBeNull();

      fireEvent.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(route.replace).toHaveBeenLastCalledWith("/crm?q=hale", {
        scroll: false,
      });
      await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    });

    it("offers Retry when the read failed for another reason", async () => {
      route.search = "donor=d-1";
      const failed = failedDetail(500);
      detail.hook.mockReturnValue(failed);
      renderWorkspace();

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).not.toMatch(/removed/);
      fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
      expect(failed.refetch).toHaveBeenCalled();
    });

    it("keeps showing a loaded record when only its refresh fails", async () => {
      route.search = "donor=record-01";
      detail.hook.mockReturnValue(failedDetail(500));
      renderWorkspace();

      expect(
        await screen.findByRole("dialog", { name: "Donor details" }),
      ).toBeTruthy();
      expect(screen.queryByText("Couldn't open that record")).toBeNull();
    });
  });

  it("keeps the record drawer mounted while it animates closed", async () => {
    route.search = "donor=record-01";
    renderWorkspace();
    const drawer = await screen.findByRole("dialog", { name: "Donor details" });
    expect(drawer.dataset.open).toBe("true");

    fireEvent.click(
      within(drawer).getByRole("button", { name: "Close drawer" }),
    );
    expect(route.replace).toHaveBeenLastCalledWith("/crm", { scroll: false });
    // Still on screen, closed, with the record it showed.
    const closing = screen.getByRole("dialog", { name: "Donor details" });
    expect(closing.dataset.open).toBe("false");
    expect(closing.textContent).toContain("Record person 01");

    fireEvent.click(
      within(closing).getByRole("button", { name: "Finish closing" }),
    );
    expect(screen.queryByRole("dialog", { name: "Donor details" })).toBeNull();
  });

  it("opens a record chosen while another is still closing", async () => {
    route.search = "donor=record-01";
    renderWorkspace();
    const drawer = await screen.findByRole("dialog", { name: "Donor details" });
    fireEvent.click(
      within(drawer).getByRole("button", { name: "Close drawer" }),
    );

    act(() => {
      route.search = "donor=record-02";
      for (const listener of route.listeners) listener();
    });
    const reopened = screen.getByRole("dialog", { name: "Donor details" });
    expect(reopened.dataset.open).toBe("true");
    expect(reopened.textContent).toContain("Record person 02");
    // A late completion from the first close changes nothing.
    fireEvent.click(
      within(reopened).getByRole("button", { name: "Finish closing" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Donor details" }).dataset.open,
    ).toBe("true");
  });

  it("shows the active server search in the search box", async () => {
    grid.hook.mockReturnValue(
      gridState({
        columnFilters: [{ id: "displayName", value: "alice@example.org" }],
      }),
    );
    renderWorkspace();
    const search = (await screen.findByRole("searchbox", {
      name: "Search CRM records",
    })) as HTMLInputElement;
    expect(search.value).toBe("alice@example.org");
  });

  it("only offers sorting on fields the records API can sort", async () => {
    const state = gridState();
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    await waitFor(() => expect(recordButtons().length).toBeGreaterThan(0));
    const table = screen.getByRole("table");
    expect(within(table).getByText("Owner")).toBeTruthy();
    expect(within(table).queryByRole("button", { name: /^Owner/ })).toBeNull();
    expect(within(table).queryByRole("button", { name: /^Tags/ })).toBeNull();
    fireEvent.click(
      within(table).getByRole("button", { name: /^Lifetime giving/ }),
    );
    expect(state.onSortingChange).toHaveBeenCalled();
  });

  it("shows an inline error with a working Retry", async () => {
    const state = gridState({
      rows: [],
      tableError: new Error("CRM records are unavailable."),
    });
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("CRM records are unavailable.");
    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(state.onRefresh).toHaveBeenCalledTimes(1);
    // Retry is the one way to try again; no Refresh beside it.
    expect(screen.queryByRole("button", { name: "Refresh" })).toBeNull();
  });

  it("gives the board the table's Refresh and donor report", async () => {
    const state = gridState();
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    fireEvent.click(within(board).getByRole("button", { name: "Refresh" }));
    expect(state.onRefresh).toHaveBeenCalledTimes(1);
    expect(
      within(board)
        .getByRole("link", { name: "Export donor report" })
        .getAttribute("href"),
    ).toBe("/api/admin/crm/reports/export?slice=donors");
  });

  it("keeps the board's count, Load more, Refresh and report together at the row's end", async () => {
    grid.hook.mockReturnValue(gridState({ hasMore: true }));
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    // The table's short count, so the actions fit beside the filters.
    const count = within(board).getByText("60 loaded");
    const actions = count.parentElement!;
    expect(actions.className.split(" ")).toContain("ms-auto");
    for (const control of [
      within(board).getByRole("button", { name: "Load more" }),
      within(board).getByRole("button", { name: "Refresh" }),
      within(board).getByRole("link", { name: "Export donor report" }),
    ]) {
      expect(actions.contains(control)).toBe(true);
    }
  });

  it("leaves only Retry on the board when records can't load", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [],
        tableError: new Error("CRM records are unavailable."),
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    expect(within(board).getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(within(board).queryByRole("button", { name: "Refresh" })).toBeNull();
  });

  it("shows an honest empty state", async () => {
    grid.hook.mockReturnValue(gridState({ rows: [] }));
    renderWorkspace();
    expect(await screen.findByText("No CRM records")).toBeTruthy();
  });

  it("groups loaded records by status on the kanban board and opens them", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, {
            displayName: "Record person Theodore",
            lifecycleStatus: "active",
            lifetimeGiving: 241_000,
          }),
          makeRow(1, { lifecycleStatus: "inactive" }),
          makeRow(2, { lifecycleStatus: "active" }),
        ],
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const active = await screen.findByRole("region", { name: /^Active/ });
    expect(within(active).getAllByRole("listitem")).toHaveLength(2);
    expect(within(active).getByText("$2,410.00")).toBeTruthy();
    const inactive = screen.getByRole("region", { name: /^Inactive/ });
    expect(within(inactive).getAllByRole("listitem")).toHaveLength(1);
    act(() => {
      fireEvent.click(
        within(active).getByRole("button", { name: /Record person Theodore/ }),
      );
    });
    expect(route.replace).toHaveBeenLastCalledWith("/crm?donor=record-01", {
      scroll: false,
    });
  });

  it("puts every spelling of a status in one board lane", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, { lifecycleStatus: "at_risk" }),
          makeRow(1, { lifecycleStatus: "At Risk" }),
          makeRow(2, { lifecycleStatus: "at-risk" }),
          makeRow(3, { lifecycleStatus: "Active" }),
        ],
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const atRisk = await screen.findByRole("region", { name: /^At risk/ });
    expect(within(atRisk).getAllByRole("listitem")).toHaveLength(3);
    const board = screen.getByRole("region", { name: "CRM board" });
    const laneNames = within(board)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.firstChild?.textContent);
    expect(laneNames).toEqual(["Active", "At risk"]);
  });

  it("tells phone viewers which board lanes are off to the side", async () => {
    grid.hook.mockReturnValue(
      gridState({
        rows: [
          makeRow(0, { lifecycleStatus: "active" }),
          makeRow(1, { lifecycleStatus: "prospect" }),
          makeRow(2, { lifecycleStatus: "inactive" }),
        ],
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    const cue = within(board).getByText(
      "Scroll sideways for Prospect and Inactive",
    );
    // Phones and small tablets only; wider boards show the lanes side by side.
    expect(cue.closest("p")!.className.split(" ")).toContain("md:hidden");
  });

  it("gives a one-lane board no sideways cue", async () => {
    grid.hook.mockReturnValue(
      gridState({ rows: [makeRow(0, { lifecycleStatus: "active" })] }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    expect(within(board).queryByText(/Scroll sideways/)).toBeNull();
  });

  it("filters the board with the table's own controls and server filters", async () => {
    const state = gridState({
      columnFilters: [
        { id: "recordType", value: ["Organization", "Church"] },
        { id: "displayName", value: "bank" },
      ],
    });
    grid.hook.mockReturnValue(state);
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    // The same faceted filters as the table, so filters can be added here.
    for (const name of [/^Type/, /^Status/, /^Portal/]) {
      expect(within(board).getByRole("button", { name })).toBeTruthy();
    }
    fireEvent.click(within(board).getByRole("button", { name: /^Status/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Inactive/ }));
    const update = state.onFiltersChange.mock.calls.at(-1)![0] as
      unknown[] | ((current: unknown[]) => unknown[]);
    const next =
      typeof update === "function" ? update(state.columnFilters) : update;
    expect(next).toEqual(
      expect.arrayContaining([
        { id: "recordType", value: ["Organization", "Church"] },
        { id: "displayName", value: "bank" },
        { id: "lifecycleStatus", value: ["inactive"] },
      ]),
    );
    fireEvent.click(
      within(board).getByRole("button", { name: "Clear search and filters" }),
    );
    expect(state.onFiltersChange).toHaveBeenLastCalledWith([]);
  });

  it("titles the board under the page heading before its status columns", async () => {
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    const board = await screen.findByRole("region", { name: "CRM board" });
    expect(within(board).getByRole("heading", { level: 2 }).textContent).toBe(
      "CRM board",
    );
    const columnHeadings = within(board).getAllByRole("heading", { level: 3 });
    expect(columnHeadings.length).toBeGreaterThan(0);
  });

  it("says board column counts cover loaded records while more pages exist", async () => {
    grid.hook.mockReturnValue(
      gridState({
        hasMore: true,
        rows: [
          makeRow(0, { lifecycleStatus: "active" }),
          makeRow(1, { lifecycleStatus: "active" }),
        ],
      }),
    );
    renderWorkspace();
    fireEvent.click(
      await screen.findByRole("button", { name: "Show CRM kanban view" }),
    );
    expect(
      await screen.findByRole("region", { name: "Active, 2 loaded records" }),
    ).toBeTruthy();
  });
});
