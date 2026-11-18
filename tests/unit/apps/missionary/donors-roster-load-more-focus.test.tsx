/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// Partner rows as the donor rows hook returns them.
type Donor = Record<string, unknown>;

const fixture = vi.hoisted(() => ({
  rows: [] as Donor[],
  hasMore: true,
  isLoadingMore: false,
  error: null as Error | null,
  loadMore: vi.fn(async () => {}),
  // Phone width unless a test widens the screen.
  wide: false,
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: fixture.rows,
    isLoading: false,
    error: fixture.error,
    hasMore: fixture.hasMore,
    isLoadingMore: fixture.isLoadingMore,
    loadMore: fixture.loadMore,
  }),
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "load-more-missionary" }, loading: false }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));

const { DonorsPageRoster } =
  await import("../../../../apps/missionary/app/donors/donors-page-roster");
const { DonorsPageViewProvider } =
  await import("../../../../apps/missionary/app/donors/use-donors-page-view");
// The app's own copy, so the page's hooks read this client.
const { QueryClient, QueryClientProvider } =
  await import("../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js");

function partner(id: string, name: string, lastGift: string | null): Donor {
  return {
    id,
    name,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join(""),
    type: "Individual",
    status: "Active",
    total_given: 100,
    last_gift_date: lastGift,
    last_gift_amount: null,
    frequency: "One-time",
    email: `${id}@example.test`,
    phone: "555-0100",
    preferred_contact: "email",
    location: "Fixture City",
    address: {},
    joined_date: "2026-01-01T12:00:00Z",
    tags: [],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
  };
}

const avery = partner("load-a", "Avery Stone", null);
const blake = partner("load-b", "Blake Rowe", null);
// The roster lists the most recent gift first, so Casey sorts above Avery.
const casey = partner("load-c", "Casey Reed", "2026-10-01");

beforeEach(() => {
  fixture.rows = [avery];
  fixture.hasMore = true;
  fixture.isLoadingMore = false;
  fixture.error = null;
  fixture.wide = false;
  fixture.loadMore.mockClear();
  // Phone width: the roster lists partner cards without a measured scroll box.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width") !== fixture.wide,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const client = new QueryClient();
const page = () => (
  <QueryClientProvider client={client}>
    <DonorsPageViewProvider>
      <DonorsPageRoster />
    </DonorsPageViewProvider>
  </QueryClientProvider>
);

/** Presses Load more and holds it busy, as the next page is fetched. */
function startLoadingMore() {
  const view = render(page());
  const button = screen.getByRole("button", { name: "Load more partners" });
  button.focus();
  fireEvent.click(button);
  expect(fixture.loadMore).toHaveBeenCalledOnce();
  fixture.isLoadingMore = true;
  view.rerender(page());
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  return { view, button };
}

function arrive(
  view: ReturnType<typeof render>,
  rows: Donor[],
  hasMore: boolean,
) {
  fixture.rows = rows;
  fixture.isLoadingMore = false;
  fixture.hasMore = hasMore;
  view.rerender(page());
}

it("moves focus to the first newly loaded partner in roster order", () => {
  const { view } = startLoadingMore();
  arrive(view, [avery, blake, casey], true);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: /Casey Reed/ }),
  );
});

it("moves focus to the first new partner when the last page removes the button", () => {
  const { view, button } = startLoadingMore();
  arrive(view, [avery, blake, casey], false);
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: /Casey Reed/ }),
  );
});

it("lands on the list heading when the last page brings no partner the filters show", () => {
  const { view, button } = startLoadingMore();
  fireEvent.change(screen.getByLabelText("Search partners"), {
    target: { value: "Avery" },
  });
  button.focus();
  arrive(view, [avery, blake, casey], false);
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: /All partners/ }),
  );
});

it("leaves focus on Load more when the new page shows nothing under the filters", () => {
  const { view, button } = startLoadingMore();
  fireEvent.change(screen.getByLabelText("Search partners"), {
    target: { value: "Avery" },
  });
  button.focus();
  arrive(view, [avery, blake, casey], true);
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
});

it("does not count a partner the filters hid before Load more as newly loaded", () => {
  fixture.rows = [avery, blake];
  const view = render(page());
  const search = screen.getByLabelText("Search partners");
  fireEvent.change(search, { target: { value: "Avery" } });
  const button = screen.getByRole("button", { name: "Load more partners" });
  button.focus();
  fireEvent.click(button);
  fixture.isLoadingMore = true;
  view.rerender(page());
  // Blake was loaded already; clearing the search shows him again.
  fireEvent.change(search, { target: { value: "" } });
  button.focus();
  arrive(view, [avery, blake, partner("load-d", "Dana Fox", null)], true);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: /Dana Fox/ }),
  );
});

it("moves focus to Try again when the next page fails to load", () => {
  const { view, button } = startLoadingMore();
  // The failed page puts the list in error: the error view replaces the
  // partners and Load more, so focus would otherwise drop to the page.
  fixture.error = new Error("Partners could not be loaded");
  arrive(view, [avery], true);
  expect(button.isConnected).toBe(false);
  expect(screen.getByRole("alert").textContent).toContain(
    "Partners could not be loaded",
  );
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Try again" }),
  );
});

it("hands focus to the new partner's row in the wide table", () => {
  fixture.wide = true;
  // The virtualized table renders rows only into a measured scroll box.
  vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(640);
  vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(560);
  const { view } = startLoadingMore();
  expect(screen.getByRole("table")).toBeTruthy();
  arrive(view, [avery, blake, casey], true);
  const focused = document.activeElement as HTMLElement;
  // The row's own partner button, found by the id the hand-off looks up.
  expect(focused.getAttribute("data-partner-id")).toBe("load-c");
  expect(focused.closest("tr")).not.toBeNull();
  expect(within(focused).getByText("Casey Reed")).toBeTruthy();
});

/** The partner ids the table has in the DOM, top to bottom. */
function renderedPartnerIds() {
  return Array.from(
    document.querySelectorAll<HTMLElement>("tr [data-partner-id]"),
    (element) => element.dataset.partnerId,
  );
}

it.each([
  ["more pages are left", true],
  ["the last page removes the button", false],
])(
  "hands focus to a rendered new partner when the long table was scrolled to Load more and %s",
  (_case, hasMore) => {
    fixture.wide = true;
    vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(640);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(560);
    // 100 partners, one gift a day apart, newest first. The first page holds
    // the odd places and the next page the even ones, so new partners land
    // all through the list, including at the very top.
    const day = 24 * 60 * 60 * 1000;
    const start = Date.UTC(2026, 9, 1);
    const rows = Array.from({ length: 100 }, (_, place) =>
      partner(
        `${place % 2 === 0 ? "new" : "old"}-${place}`,
        `Partner ${place}`,
        new Date(start - place * day).toISOString().slice(0, 10),
      ),
    );
    const firstPage = rows.filter((_, place) => place % 2 === 1);
    fixture.rows = firstPage;
    const view = render(page());
    // The table's own scroll box, capped at the roster's 640px.
    let scrollBox = screen.getByRole("table").parentElement;
    while (scrollBox && !scrollBox.style.maxHeight) {
      scrollBox = scrollBox.parentElement;
    }
    if (!scrollBox) throw new Error("The table has no scroll box");
    // Tabbing down to Load more scrolls the box to the bottom: 50 rows of
    // 88px under a 640px window.
    Object.defineProperty(scrollBox, "scrollTop", {
      configurable: true,
      value: 50 * 88 - 640,
    });
    fireEvent.scroll(scrollBox);
    expect(renderedPartnerIds()).toContain("old-99");
    expect(renderedPartnerIds()).not.toContain("old-1");

    const button = screen.getByRole("button", { name: "Load more partners" });
    button.focus();
    fireEvent.click(button);
    fixture.isLoadingMore = true;
    view.rerender(page());
    expect(document.activeElement).toBe(button);
    arrive(view, rows, hasMore);

    // The newest new partner sorts to the top, outside the rendered window.
    const rendered = renderedPartnerIds();
    expect(rendered).not.toContain("new-0");
    const firstRenderedNew = rendered.find((id) => id?.startsWith("new-"));
    expect(firstRenderedNew).toBeDefined();
    expect(
      (document.activeElement as HTMLElement).getAttribute("data-partner-id"),
    ).toBe(firstRenderedNew);
  },
);
