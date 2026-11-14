// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeMobileContribution } from "./contribution-mobile-fixture";
// eslint-disable-next-line no-restricted-imports -- AL-1894: App grid regression test at its public UI boundary.
import { ContributionsMainBody } from "../../../../../apps/admin/app/(app)/contributions/main-body";

/**
 * jsdom never lays anything out, so a ResizeObserver stand-in records what
 * each observer watches and `resizePanels` reports a width for all of them,
 * as a browser would after layout.
 */
const resizeObservers = new Set<{
  callback: ResizeObserverCallback;
  targets: Set<Element>;
}>();

class StubResizeObserver {
  private readonly record: {
    callback: ResizeObserverCallback;
    targets: Set<Element>;
  };

  constructor(callback: ResizeObserverCallback) {
    this.record = { callback, targets: new Set() };
    resizeObservers.add(this.record);
  }

  observe(target: Element) {
    this.record.targets.add(target);
  }

  unobserve(target: Element) {
    this.record.targets.delete(target);
  }

  disconnect() {
    this.record.targets.clear();
    resizeObservers.delete(this.record);
  }
}

function resizePanels(width: number) {
  act(() => {
    for (const record of [...resizeObservers]) {
      const entries = [...record.targets].map((target) => ({
        target,
        contentRect: { width, height: 600 },
      }));
      if (entries.length > 0) {
        record.callback(
          entries as unknown as ResizeObserverEntry[],
          {} as ResizeObserver,
        );
      }
    }
  });
}

// The real ReUI DataGridPanel at desktop width; only browser seams adapted.
beforeEach(() => {
  vi.stubGlobal("innerWidth", 1440);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  resizeObservers.clear();
  vi.stubGlobal("ResizeObserver", StubResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const FUND_UUID = "a5cbf3d4-5798-4ed6-999f-103e02890c84";

const rows = [
  makeMobileContribution({
    id: "00000000-0000-4000-8000-000000000001",
    donorName: "Priscilla Adeyemi",
    donorEmail: "priscilla@example.org",
    fundCode: FUND_UUID,
  }),
  makeMobileContribution({
    id: "00000000-0000-4000-8000-000000000002",
    donorName: "Kenji Nakamura",
    donorEmail: "kenji@example.org",
    fundCode: FUND_UUID,
  }),
];

function renderHub(
  data = rows,
  props: Partial<Parameters<typeof ContributionsMainBody>[0]> = {},
) {
  return render(
    <ContributionsMainBody
      data={data}
      isLoading={false}
      onSelectContribution={vi.fn()}
      {...props}
    />,
  );
}

function search(value: string) {
  vi.useFakeTimers();
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search contributions" }),
    { target: { value } },
  );
  act(() => {
    vi.advanceTimersByTime(300);
  });
  vi.useRealTimers();
}

describe("Contributions hub grid", () => {
  it("renders every gift through the ReUI grid with one named primary per row", () => {
    renderHub();
    const grid = screen.getByRole("region", { name: "Gifts" });
    for (const name of ["Priscilla Adeyemi", "Kenji Nakamura"]) {
      expect(
        within(grid).getByRole("button", { name: new RegExp(`^${name}`) }),
      ).toBeTruthy();
    }
  });

  it("finds a gift by donor email, as the search promises", () => {
    renderHub();
    search("kenji@example");
    expect(screen.getByText("Kenji Nakamura")).toBeTruthy();
    expect(screen.queryByText("Priscilla Adeyemi")).toBeNull();
  });

  it("names the fund without printing its internal fund id", () => {
    renderHub();
    expect(screen.getAllByText("General Fund").length).toBeGreaterThan(0);
    expect(screen.queryByText(FUND_UUID)).toBeNull();
  });

  it("uses a search placeholder short enough for the narrow 1024 search box", () => {
    renderHub();
    const box = screen.getByRole("searchbox", { name: "Search contributions" });
    // lg:w-48 leaves about 150px of text: the old "Search donor, fund, ID…"
    // was clipped there.
    expect(box.getAttribute("placeholder")).toBe("Search gifts…");
  });

  it("names what the search covers once the box is wide again from xl", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: query === "(min-width: 1280px)",
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
    renderHub();
    const box = screen.getByRole("searchbox", { name: "Search contributions" });
    expect(box.getAttribute("placeholder")).toBe("Search donor, fund, ID…");
  });

  it("labels the summary with the gifts it covers", () => {
    renderHub();
    const summary = screen.getByRole("region", { name: "Summary" });
    expect(within(summary).getByText("All 2 gifts")).toBeTruthy();
    expect(within(summary).getByText("$200.00")).toBeTruthy();
    expect(within(summary).getByText("2 completed")).toBeTruthy();
  });

  it("shows the summary as the shared metric cards, compact until xl, one row of four from lg", () => {
    renderHub();
    const summary = screen.getByRole("region", { name: "Summary" });
    const cards = summary.querySelectorAll<HTMLElement>(
      '[data-slot="metric-card"]',
    );
    expect([...cards].map((card) => card.dataset.state)).toEqual([
      "ready",
      "ready",
      "ready",
      "ready",
    ]);
    // Compact through tablet and laptop widths, so the gifts stay in view.
    for (const card of cards) {
      expect(card.dataset.compact).toBe("until-xl");
    }
    for (const label of ["Received", "Pending", "Average gift", "Recurring"]) {
      expect(within(summary).getByText(label)).toBeTruthy();
    }
    // At 1024 the four metrics sit in one row instead of two.
    expect(cards[0]!.parentElement!.className.split(" ")).toEqual(
      expect.arrayContaining(["grid-cols-2", "lg:grid-cols-4"]),
    );
  });

  it("holds the totals as loading while older gifts arrive, so a climbing partial total is never shown", () => {
    renderHub(rows, { isLoadingOlder: true });
    const summary = screen.getByRole("region", { name: "Summary" });
    const cards = summary.querySelectorAll<HTMLElement>(
      '[data-slot="metric-card"]',
    );
    expect([...cards].every((card) => card.dataset.state === "loading")).toBe(
      true,
    );
    expect(within(summary).queryByText("$200.00")).toBeNull();
    expect(summary.getAttribute("aria-busy")).toBe("true");
    expect(
      within(summary).getByText("Loading all gifts · 2 so far"),
    ).toBeTruthy();
  });

  it("says there is no average yet instead of an average of $0.00", () => {
    renderHub([
      makeMobileContribution({
        id: "00000000-0000-4000-8000-000000000003",
        status: "pending",
        shared: {
          ...makeMobileContribution().shared,
          paymentStatus: "pending",
        },
      }),
    ]);
    const summary = screen.getByRole("region", { name: "Summary" });
    const average = within(summary)
      .getByText("Average gift")
      .closest<HTMLElement>('[data-slot="metric-card"]')!;
    expect(average.dataset.state).toBe("unavailable");
    expect(within(average).queryByText("$0.00")).toBeNull();
    expect(
      within(average).getByText("No completed gifts to average yet."),
    ).toBeTruthy();
  });

  it("names payment methods in sentence case in rows and the Payment filter, while filtering on the stored value", async () => {
    renderHub();
    expect(screen.getAllByText("Credit card").length).toBeGreaterThan(0);
    expect(screen.queryByText("Credit Card")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Payment/ }));
    expect(await screen.findByText("Bank transfer")).toBeTruthy();
    expect(screen.queryByText("Bank Transfer")).toBeNull();
  });

  it("offers only working bulk actions for selected gifts", () => {
    renderHub();
    const firstPrimary = screen.getByRole("button", {
      name: /^Priscilla Adeyemi/,
    });
    firstPrimary.focus();
    fireEvent.keyDown(firstPrimary, { key: " " });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    expect(within(bar).getByText("1 contribution selected")).toBeTruthy();
    expect(
      within(bar).getByRole("button", { name: "Send receipts…" }),
    ).toBeTruthy();
    // Bulk delete only toasted "coming soon"; it is not offered.
    expect(within(bar).queryByRole("button", { name: /delete/i })).toBeNull();
  });

  it("keeps the shared CRM/Hub filters one step away behind More filters", () => {
    renderHub();
    const toggle = screen.getByRole("button", { name: /^More filters/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("group", { name: "More filters" })).toBeNull();
    fireEvent.click(toggle);
    const group = screen.getByRole("group", { name: "More filters" });
    for (const label of [
      "Receipt affected",
      "Pending correction",
      "Approval state",
      "Refund state",
      "Historical CRM posting",
      "Recurring link",
    ]) {
      expect(within(group).getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("offers Source behind More filters while its column starts hidden", async () => {
    renderHub();
    // Not in the primary row: a facet for a hidden column reads as noise.
    expect(screen.queryByRole("button", { name: "Source" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^More filters/ }));
    const group = screen.getByRole("group", { name: "More filters" });
    fireEvent.click(within(group).getByRole("button", { name: "Source" }));
    const popup = await screen.findByRole("dialog", {
      name: "Filter by Source",
    });
    expect(within(popup).getByRole("button", { name: /online/i })).toBeTruthy();
  });

  it("names Source on the filter disclosure before it is opened", () => {
    renderHub();
    expect(
      screen.getByRole("button", { name: /^More filters/ }).textContent,
    ).toBe("More filters · Source");
  });

  it("keeps Type and Payment reachable behind More filters at 1024 and counts an applied hidden filter", async () => {
    vi.stubGlobal("innerWidth", 1024);
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: query === "(min-width: 1024px) and (max-width: 1279px)",
      addEventListener() {},
      removeEventListener() {},
    }));
    renderHub();
    const toolbar = document.querySelector<HTMLElement>(
      '[data-slot="data-grid-panel-toolbar"]',
    )!;
    expect(
      within(toolbar).getByRole("button", { name: "Status" }),
    ).toBeTruthy();
    expect(within(toolbar).queryByRole("button", { name: "Type" })).toBeNull();
    expect(
      within(toolbar).queryByRole("button", { name: "Payment" }),
    ).toBeNull();
    const toggle = screen.getByRole("button", { name: /^More filters/ });
    fireEvent.click(toggle);
    const group = screen.getByRole("group", { name: "More filters" });
    expect(within(group).getByRole("button", { name: "Type" })).toBeTruthy();
    fireEvent.click(within(group).getByRole("button", { name: "Payment" }));
    const popup = await screen.findByRole("dialog", {
      name: "Filter by Payment",
    });
    fireEvent.click(within(popup).getByRole("button", { name: /Credit card/ }));
    fireEvent.keyDown(popup, { key: "Escape" });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.textContent).toBe("More filters · Source1");
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
  });

  it("keeps the desktop table/cards switch, showing gift cards at desktop width", () => {
    renderHub();
    const grid = screen.getByRole("region", { name: "Gifts" });
    const tableView = within(grid).getByRole("button", { name: "Table view" });
    expect(tableView.getAttribute("aria-pressed")).toBe("true");
    expect(within(grid).getByRole("table")).toBeTruthy();

    fireEvent.click(within(grid).getByRole("button", { name: "Card view" }));

    expect(within(grid).queryByRole("table")).toBeNull();
    const list = within(grid).getByRole("list", { name: "Gifts" });
    expect(
      within(list).getByRole("button", {
        name: /^Kenji Nakamura.*General Fund/,
      }),
    ).toBeTruthy();
    expect(
      within(list).getByRole("checkbox", {
        name: `Select contribution ${rows[1]!.id} from Kenji Nakamura`,
      }),
    ).toBeTruthy();
    // Columns do not apply to cards, so the column menu steps aside.
    expect(within(grid).queryByRole("button", { name: "View" })).toBeNull();

    fireEvent.click(within(grid).getByRole("button", { name: "Table view" }));
    expect(within(grid).getByRole("table")).toBeTruthy();
    expect(within(grid).getByRole("button", { name: "View" })).toBeTruthy();
  });

  it("opts gift cards into three desktop columns with two balanced trailing pairs", () => {
    renderHub(
      Array.from({ length: 10 }, (_, index) =>
        makeMobileContribution({
          id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        }),
      ),
    );
    const grid = screen.getByRole("region", { name: "Gifts" });
    fireEvent.click(within(grid).getByRole("button", { name: "Card view" }));
    const list = within(grid).getByRole("list", { name: "Gifts" });
    expect(list.className.split(" ")).toEqual(
      expect.arrayContaining(["md:grid-cols-2", "xl:grid-cols-6"]),
    );
    const cards = within(list).getAllByRole("listitem");
    expect(cards).toHaveLength(10);
    expect(
      cards.map((card) =>
        Number(card.className.match(/xl:col-span-(\d+)/)?.[1]),
      ),
    ).toEqual([2, 2, 2, 2, 2, 2, 3, 3, 3, 3]);
  });

  it("top-aligns each gift card's content, so a wrapped name never shifts its row", () => {
    renderHub();
    const grid = screen.getByRole("region", { name: "Gifts" });
    fireEvent.click(within(grid).getByRole("button", { name: "Card view" }));
    const list = within(grid).getByRole("list", { name: "Gifts" });
    const primary = within(list).getByRole("button", {
      name: /^Kenji Nakamura.*General Fund/,
    });
    const content = primary.closest("[data-slot='item-content']");
    expect(content).not.toBeNull();
    expect(content!.className.split(" ")).toContain("self-start");
  });

  it("sorts gift cards from a sort control, since cards have no headers", async () => {
    const shared = makeMobileContribution().shared;
    renderHub([
      makeMobileContribution({
        id: "small",
        donorName: "Small Gift",
        amount: 2500,
        shared: { ...shared, amountCents: 2500 },
      }),
      makeMobileContribution({
        id: "large",
        donorName: "Large Gift",
        amount: 90000,
        shared: { ...shared, amountCents: 90000 },
      }),
    ]);
    const grid = screen.getByRole("region", { name: "Gifts" });
    fireEvent.click(within(grid).getByRole("button", { name: "Card view" }));
    const sort = within(grid).getByRole("combobox", {
      name: "Sort contributions",
    });
    expect(sort.textContent).toContain("Newest first");
    fireEvent.click(sort);
    const option = await screen.findByRole("option", {
      name: "Amount: high to low",
    });
    fireEvent.pointerDown(option, { pointerType: "mouse" });
    fireEvent.click(option);
    const names = within(within(grid).getByRole("list", { name: "Gifts" }))
      .getAllByRole("button", { name: /Gift/ })
      .map((button) => button.textContent ?? "");
    expect(names[0]).toContain("Large Gift");
    expect(names[1]).toContain("Small Gift");
  });

  it("names each desktop row checkbox after its gift", () => {
    renderHub();
    const grid = screen.getByRole("region", { name: "Gifts" });
    expect(
      within(grid).queryByRole("checkbox", { name: "Select row" }),
    ).toBeNull();
    const kenji = within(grid).getByRole("checkbox", {
      name: "Select Kenji Nakamura, $100.00",
    });
    expect(
      within(grid).getByRole("checkbox", {
        name: "Select Priscilla Adeyemi, $100.00",
      }),
    ).toBeTruthy();
    fireEvent.click(kenji);
    expect(screen.getByText("1 contribution selected")).toBeTruthy();
  });

  it("offers an honest way out of a filtered empty result", () => {
    renderHub();
    search("nobody-matches-this");
    expect(screen.getByText("No contributions found")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /add contribution/i }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Kenji Nakamura")).toBeTruthy();
  });

  it("offers a refresh, not a dead button, when there are no gifts yet", () => {
    const onRefresh = vi.fn();
    renderHub([], { onRefresh });
    // A new account is not a missed search: the unfiltered empty state says
    // nothing has arrived yet.
    expect(screen.getByText("No contributions yet")).toBeTruthy();
    expect(screen.queryByText("No contributions found")).toBeNull();
    // Offline gift entry is switched off, so the copy promises no way for
    // staff to record gifts here. It names no single channel either: card,
    // bank-transfer and phone gifts all arrive the same way.
    expect(
      screen.getByText("Gifts appear here as soon as they're received."),
    ).toBeTruthy();
    expect(screen.queryByText(/staff record|online/i)).toBeNull();
    expect(
      screen.queryByRole("button", { name: /add contribution/i }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("keeps an empty workspace to one empty state, with no totals, filters or pagination", () => {
    renderHub([]);
    // The grid's empty state already says there are no gifts; a Summary
    // heading over nothing would say it twice.
    expect(screen.queryByRole("region", { name: "Summary" })).toBeNull();
    expect(screen.queryByText("$0.00")).toBeNull();
    expect(screen.queryByText(/rows per page/i)).toBeNull();
    // Nothing to search or filter yet: no toolbar at all.
    expect(
      screen.queryByRole("searchbox", { name: "Search contributions" }),
    ).toBeNull();
    expect(
      document.querySelector('[data-slot="data-grid-panel-toolbar"]'),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /^More filters/ })).toBeNull();
    // Nor sortable column headers over no rows.
    expect(screen.queryAllByRole("columnheader")).toHaveLength(0);
    expect(screen.getByRole("region", { name: "Gifts" })).toBeTruthy();
  });

  it("drops empty pagination when filters match no gifts", () => {
    renderHub();
    expect(screen.getByText(/rows per page/i)).toBeTruthy();
    search("nobody-matches-this");
    expect(screen.queryByText(/rows per page/i)).toBeNull();
  });

  it("exposes the grid as one named region under its own heading", () => {
    renderHub();
    expect(screen.getAllByRole("region", { name: /gifts/i })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "Gifts" }),
    ).toBeTruthy();
  });

  it("says older gifts are still loading so partial totals are not read as final", () => {
    renderHub(rows, { isLoadingOlder: true });
    const summary = screen.getByRole("region", { name: "Summary" });
    expect(within(summary).getByText(/loading all gifts/i)).toBeTruthy();
    expect(within(summary).queryByText("All 2 gifts")).toBeNull();
  });

  it("keeps the loaded gifts and offers a retry when older gifts fail to load", () => {
    const onRetry = vi.fn();
    renderHub(rows, {
      loadIssue: { kind: "older", message: "Gateway timeout", onRetry },
    });
    // The newest gifts stay on screen and the totals say what they cover.
    expect(screen.getByText("Kenji Nakamura")).toBeTruthy();
    const summary = screen.getByRole("region", { name: "Summary" });
    expect(within(summary).getByText("Most recent 2 gifts")).toBeTruthy();
    expect(within(summary).queryByText("All 2 gifts")).toBeNull();
    const alert = within(summary).getByRole("alert");
    expect(within(alert).getByText(/couldn.t load older gifts/i)).toBeTruthy();
    fireEvent.click(within(alert).getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("keeps the last loaded gifts when a refresh fails", () => {
    const onRetry = vi.fn();
    renderHub(rows, {
      loadIssue: { kind: "refresh", message: "Gateway timeout", onRetry },
    });
    expect(screen.getByText("Kenji Nakamura")).toBeTruthy();
    const alert = within(
      screen.getByRole("region", { name: "Summary" }),
    ).getByRole("alert");
    expect(within(alert).getByText(/couldn.t refresh/i)).toBeTruthy();
    fireEvent.click(within(alert).getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("opens the row menu without also opening the gift", async () => {
    const onSelectContribution = vi.fn();
    renderHub(rows, { onSelectContribution });
    const trigger = screen.getByRole("button", {
      name: "Contribution actions for Kenji Nakamura",
    });
    // The menu trigger sits inside a clickable row; its click must stay with
    // the menu.
    fireEvent.click(trigger);
    expect(onSelectContribution).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "View details" }),
    );
    expect(onSelectContribution).toHaveBeenCalledTimes(1);
    expect(onSelectContribution.mock.calls[0]![0].donorName).toBe(
      "Kenji Nakamura",
    );
  });

  it("sends receipts only for selected gifts the current filters still show", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    renderHub();
    for (const name of [/^Priscilla Adeyemi/, /^Kenji Nakamura/]) {
      const primary = screen.getByRole("button", { name });
      primary.focus();
      fireEvent.keyDown(primary, { key: " " });
    }
    expect(screen.getByText("2 contributions selected")).toBeTruthy();

    search("kenji");

    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    // The bar counts what staff can see, and says what the filters hide.
    expect(within(bar).getByText("1 contribution selected")).toBeTruthy();
    expect(
      within(bar).getByText("1 hidden by filters won't be included"),
    ).toBeTruthy();

    fireEvent.click(
      within(bar).getByRole("button", { name: "Send receipts…" }),
    );
    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByText(/among 1 selected contribution\./),
    ).toBeTruthy();
    expect(
      within(dialog).getByText(
        "1 selected contribution hidden by the current filters is not included.",
      ),
    ).toBeTruthy();
  });

  it("drops the hidden-selection note once every selected gift is visible", () => {
    renderHub();
    const primary = screen.getByRole("button", { name: /^Kenji Nakamura/ });
    primary.focus();
    fireEvent.keyDown(primary, { key: " " });
    const bar = screen.getByRole("toolbar", {
      name: "Selected record actions",
    });
    expect(within(bar).queryByText(/hidden by filters/)).toBeNull();
  });

  it("collapses More filters on request even while a shared filter is applied", async () => {
    renderHub();
    const toggle = screen.getByRole("button", { name: /^More filters/ });
    fireEvent.click(toggle);
    const group = screen.getByRole("group", { name: "More filters" });
    fireEvent.click(
      within(group).getByRole("button", { name: "Pending correction" }),
    );
    // The ReUI filter popover is a dialog named after its filter.
    const popup = await within(document.body).findByRole("dialog", {
      name: "Filter by Pending correction",
    });
    const popupSearch = within(popup).getByRole("textbox", {
      name: "Search Pending correction options",
    });
    fireEvent.click(
      await within(popup).findByRole("button", { name: /^Pending correction/ }),
    );
    fireEvent.keyDown(popupSearch, { key: "Escape" });

    const moreFilters = screen.getByRole("button", { name: /^More filters/ });
    expect(within(moreFilters).getByText("1")).toBeTruthy();
    expect(moreFilters.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(moreFilters);
    expect(moreFilters.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("group", { name: "More filters" })).toBeNull();
    // The count badge keeps the applied filter visible while collapsed.
    expect(within(moreFilters).getByText("1")).toBeTruthy();

    fireEvent.click(moreFilters);
    expect(screen.getByRole("group", { name: "More filters" })).toBeTruthy();
  });
});

describe("Contributions hub grid column fit", () => {
  function grid() {
    return screen.getByRole("region", { name: "Gifts" });
  }

  function headerCell(columnId: string) {
    return grid().querySelector<HTMLElement>(`th[data-col-id="${columnId}"]`);
  }

  function donorCell(name: string) {
    return within(grid())
      .getByRole("button", { name: new RegExp(`^${name}`) })
      .closest("td") as HTMLElement;
  }

  it("names the fund under the donor on a laptop-width panel, as the mobile card does", () => {
    renderHub();
    resizePanels(760);

    // The Fund column moves into View, but the designation stays on screen
    // as the donor's second line, so it still ranks above Receipt.
    expect(headerCell("fundName")).toBeNull();
    expect(headerCell("receiptStatus")).toBeTruthy();
    expect(
      within(donorCell("Kenji Nakamura")).getByText("General Fund"),
    ).toBeTruthy();
    expect(
      within(donorCell("Kenji Nakamura")).queryByText("kenji@example.org"),
    ).toBeNull();
    expect(
      within(grid()).getAllByRole("button", {
        name: /^Contribution actions for/,
      }),
    ).toHaveLength(2);
    // Nothing overflows, so nothing needs pinning.
    expect(grid().querySelector("th[data-pinned]")).toBeNull();
  });

  it("spends the decorative avatar's width on the donor name when columns are tight", () => {
    renderHub();
    resizePanels(760);
    expect(grid().querySelector('tbody [data-slot="avatar"]')).toBeNull();
    resizePanels(1180);
    expect(grid().querySelectorAll('tbody [data-slot="avatar"]')).toHaveLength(
      2,
    );
  });

  it("shows Fund / designation as its own column whenever the panel is wide enough", () => {
    renderHub();
    resizePanels(760);
    expect(headerCell("fundName")).toBeNull();
    resizePanels(1180);
    expect(headerCell("fundName")).toBeTruthy();
    // With the fund in its own column, the donor's second line is contact
    // detail again.
    expect(
      within(donorCell("Kenji Nakamura")).getByText("kenji@example.org"),
    ).toBeTruthy();
  });

  it("keeps a View choice to show Fund / designation on a narrow panel", async () => {
    renderHub();
    resizePanels(760);
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const option = await screen.findByRole("menuitemcheckbox", {
      name: "Fund / designation",
    });
    // Core writes labels in sentence case, including the ReUI menu title.
    expect(screen.getByText("Toggle columns")).toBeTruthy();
    expect(screen.queryByText("Toggle Columns")).toBeNull();
    await act(async () => {
      fireEvent.click(option);
    });
    expect(headerCell("fundName")).toBeTruthy();
    resizePanels(800);
    expect(headerCell("fundName")).toBeTruthy();
  });

  it("shows only real donor type and entry method values, and never offers Net amount", async () => {
    renderHub([
      makeMobileContribution({
        id: "00000000-0000-4000-8000-000000000001",
        donorName: "Priscilla Adeyemi",
        donorType: null,
        entryMethod: "api",
      }),
      makeMobileContribution({
        id: "00000000-0000-4000-8000-000000000002",
        donorName: "Kenji Nakamura",
        donorType: "church",
        entryMethod: "manual",
      }),
    ]);

    async function showColumn(name: string) {
      // Checkbox items may keep the menu open; only open it when closed.
      if (!screen.queryByRole("menuitemcheckbox", { name })) {
        fireEvent.click(screen.getByRole("button", { name: "View" }));
      }
      const option = await screen.findByRole("menuitemcheckbox", { name });
      await act(async () => {
        fireEvent.click(option);
      });
      await waitFor(() => expect(headerCell(columnIdFor[name]!)).toBeTruthy());
    }
    const columnIdFor: Record<string, string> = {
      "Donor type": "donorType",
      "Entry method": "entryMethod",
    };

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    await screen.findByRole("menuitemcheckbox", { name: "Donor type" });
    // List rows never carry a net amount, so it is not a column to offer.
    expect(
      screen.queryByRole("menuitemcheckbox", { name: "Net amount" }),
    ).toBeNull();

    await showColumn("Donor type");
    await showColumn("Entry method");

    const cellFor = (donorName: string, columnId: string) => {
      const row = donorCell(donorName).closest("tr")!;
      const index = [...grid().querySelectorAll("th")].findIndex(
        (th) => th.getAttribute("data-col-id") === columnId,
      );
      return row.querySelectorAll("td")[index]!.textContent;
    };

    expect(cellFor("Priscilla Adeyemi", "donorType")).toBe("—");
    expect(cellFor("Kenji Nakamura", "donorType")).toBe("church");
    expect(cellFor("Priscilla Adeyemi", "entryMethod")).toBe("System");
    expect(cellFor("Kenji Nakamura", "entryMethod")).toBe("Manual entry");
    expect(grid().textContent).not.toMatch(/individual/i);
  });

  it("pins the donor and the row actions when the visible columns overflow", () => {
    renderHub();
    resizePanels(560);

    expect(headerCell("select")?.getAttribute("data-pinned")).toBe("start");
    expect(headerCell("donorName")?.getAttribute("data-pinned")).toBe("start");
    expect(headerCell("actions")?.getAttribute("data-pinned")).toBe("end");
    expect(headerCell("amount")?.hasAttribute("data-pinned")).toBe(false);
  });
});

function manyRows(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const day = String(28 - index).padStart(2, "0");
    const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    return makeMobileContribution({
      id,
      donorName: `Donor ${String(index + 1).padStart(2, "0")}`,
      donorEmail: `donor${index + 1}@example.org`,
      date: `2026-05-${day}T00:00:00.000Z`,
    });
  });
}

describe("Contributions hub grid pagination", () => {
  function goToPage(page: number) {
    fireEvent.click(screen.getByRole("button", { name: `Go to page ${page}` }));
  }

  /** Lets the table's deferred page-index bookkeeping run. */
  async function settle() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it("keeps staff on their page while older gifts arrive", async () => {
    const view = renderHub(manyRows(25));
    goToPage(2);
    expect(screen.getByText("Donor 11")).toBeTruthy();

    view.rerender(
      <ContributionsMainBody
        data={manyRows(28)}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );
    await settle();

    expect(screen.getByText("Donor 11")).toBeTruthy();
    expect(screen.queryByText("Donor 01")).toBeNull();
  });

  it("returns to the first page when the search changes", async () => {
    renderHub(manyRows(25));
    goToPage(3);
    expect(screen.getByText("Donor 21")).toBeTruthy();
    // Every gift still matches, so only a deliberate reset shows page 1.
    search("Donor");
    await settle();
    expect(screen.getByText("Donor 01")).toBeTruthy();
  });

  it("moves to the last page that still has gifts when the list shrinks", async () => {
    const view = renderHub(manyRows(25));
    goToPage(3);
    view.rerender(
      <ContributionsMainBody
        data={manyRows(15)}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );
    await settle();
    expect(screen.getByText("Donor 11")).toBeTruthy();
    expect(screen.queryByText("No contributions found")).toBeNull();
  });
});

describe("Contributions hub needs-attention filter", () => {
  const groups = [
    {
      key: "critical:receipt_failed",
      title: "Receipt",
      urgency: "critical" as const,
      count: 2,
      items: [
        {
          id: "item-1",
          taskId: null,
          issueType: "receipt_failed",
          issueLabel: "Receipt",
          urgency: "critical" as const,
          status: "open",
          summary: "Receipt email bounced for Priscilla Adeyemi.",
          contributionId: rows[0]!.id,
          donorId: null,
          firstSeenAt: "2026-10-21T12:00:00.000Z",
          lastSeenAt: "2026-10-31T08:00:00.000Z",
        },
        {
          id: "item-3",
          taskId: null,
          issueType: "receipt_failed",
          issueLabel: "Receipt",
          urgency: "critical" as const,
          status: "open",
          summary: "Receipt email failed for Lena Okafor.",
          contributionId: "00000000-0000-4000-8000-000000000003",
          donorId: null,
          firstSeenAt: "2026-10-21T12:00:00.000Z",
          lastSeenAt: "2026-10-31T08:00:00.000Z",
        },
      ],
    },
    {
      key: "high:crm_post_failed",
      title: "CRM post",
      urgency: "high" as const,
      count: 1,
      items: [
        {
          id: "item-2",
          taskId: null,
          issueType: "crm_post_failed",
          issueLabel: "CRM post",
          urgency: "high" as const,
          status: "open",
          summary: "CRM posting timed out for Kenji Nakamura.",
          contributionId: rows[1]!.id,
          donorId: null,
          firstSeenAt: "2026-10-21T12:00:00.000Z",
          lastSeenAt: "2026-10-31T08:00:00.000Z",
        },
      ],
    },
  ];

  const thirdRow = makeMobileContribution({
    id: "00000000-0000-4000-8000-000000000003",
    donorName: "Lena Okafor",
    donorEmail: "lena@example.org",
  });

  const fourthRow = makeMobileContribution({
    id: "00000000-0000-4000-8000-000000000004",
    donorName: "Omar Haddad",
    donorEmail: "omar@example.org",
  });

  it("filters the grid to every gift that needs attention", () => {
    renderHub([...rows, thirdRow, fourthRow], { needsAttentionGroups: groups });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    fireEvent.click(
      within(panel).getByRole("button", { name: "Show all in grid" }),
    );
    const grid = screen.getByRole("region", { name: "Gifts" });
    expect(within(grid).getByText("Priscilla Adeyemi")).toBeTruthy();
    expect(within(grid).getByText("Kenji Nakamura")).toBeTruthy();
    expect(within(grid).getByText("Lena Okafor")).toBeTruthy();
    expect(within(grid).queryByText("Omar Haddad")).toBeNull();
    // The applied filter stays visible and removable in the grid toolbar.
    const group = screen.getByRole("group", { name: "More filters" });
    expect(
      within(group).getByRole("button", { name: /^Needs attention/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(within(grid).getByText("Omar Haddad")).toBeTruthy();
  });

  it("hands focus to the applied Needs attention filter, a visible control", async () => {
    renderHub([...rows, thirdRow, fourthRow], { needsAttentionGroups: groups });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    fireEvent.click(
      within(panel).getByRole("button", { name: "Show in grid: Receipt" }),
    );
    const chip = within(
      screen.getByRole("group", { name: "More filters" }),
    ).getByRole("button", { name: /^Needs attention/ });
    await waitFor(() => expect(document.activeElement).toBe(chip));
    // The outline heading stays, but no longer takes focus out of sight.
    const heading = screen.getByRole("heading", { level: 2, name: "Gifts" });
    expect(heading.hasAttribute("tabindex")).toBe(false);
  });

  it("shows each group's whole issue summary, which staff triage from", () => {
    renderHub([...rows, thirdRow, fourthRow], { needsAttentionGroups: groups });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    const summary = within(panel).getByText(
      "Receipt email bounced for Priscilla Adeyemi.",
    );
    expect(summary.className).not.toMatch(/line-clamp/);
  });

  it("keeps phones to the most urgent group, with the rest one tap away", () => {
    const singleItemGroups = groups.map((group) => ({
      ...group,
      count: 1,
      items: group.items.slice(0, 1),
    }));
    renderHub([...rows, thirdRow, fourthRow], {
      needsAttentionGroups: singleItemGroups,
    });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    const cards = within(panel).getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    // Later groups step aside below the lg breakpoint (phones and tablets)...
    expect(cards[0]!.className.split(" ")).not.toContain("hidden");
    expect(cards[1]!.className.split(" ")).toContain("hidden");
    // ...so there Show all stays even though the cards reach every item at
    // lg widths.
    const showAll = within(panel).getByRole("button", {
      name: "Show all in grid",
    });
    expect(showAll.closest(".lg\\:hidden")).toBeTruthy();
  });

  it("reaches every item in a group, not just the first", () => {
    renderHub([...rows, thirdRow, fourthRow], { needsAttentionGroups: groups });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    fireEvent.click(
      within(panel).getByRole("button", { name: "Show in grid: Receipt" }),
    );
    const grid = screen.getByRole("region", { name: "Gifts" });
    expect(within(grid).getByText("Priscilla Adeyemi")).toBeTruthy();
    expect(within(grid).getByText("Lena Okafor")).toBeTruthy();
    expect(within(grid).queryByText("Kenji Nakamura")).toBeNull();
  });

  it("gives a single-item group the same two actions as the others", () => {
    renderHub([...rows, thirdRow, fourthRow], { needsAttentionGroups: groups });
    const panel = screen.getByRole("region", { name: /needs attention/i });
    // Every card's action row matches, so the columns line up; for one
    // gift, Show in grid lists it in the grid beside its filters.
    for (const card of within(panel).getAllByRole("listitem")) {
      expect(
        within(card)
          .getAllByRole("button")
          .map((button) => button.getAttribute("aria-label")?.split(":")[0]),
      ).toEqual(["Open contribution", "Show in grid"]);
    }
    fireEvent.click(
      within(panel).getByRole("button", { name: "Show in grid: CRM post" }),
    );
    const grid = screen.getByRole("region", { name: "Gifts" });
    expect(within(grid).getByText("Kenji Nakamura")).toBeTruthy();
    expect(within(grid).queryByText("Priscilla Adeyemi")).toBeNull();
  });
});
