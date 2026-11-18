/** @vitest-environment jsdom */

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

import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
import { DonorsPageStats } from "../../../../apps/missionary/app/donors/donors-page-stats";
import { DonorsPageViewProvider } from "../../../../apps/missionary/app/donors/use-donors-page-view";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const fixture = vi.hoisted(() => ({ rows: [] as Donor[] }));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: fixture.rows,
    isLoading: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({
    profile: { id: "roster-filter-missionary" },
    loading: false,
  }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));

function partner(id: string, name: string, overrides: Partial<Donor>): Donor {
  return {
    id,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    type: "Individual",
    status: "Active",
    total_given: 100,
    last_gift_date: null,
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
    ...overrides,
  } as unknown as Donor;
}

beforeEach(() => {
  fixture.rows = [
    partner("filter-a", "Avery Stone", { has_active_pledge: true }),
    partner("filter-b", "Blake Moore", { status: "Lapsed" }),
  ];
  // Phone width: the roster lists partner cards without a measured scroll box.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: /max-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
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

function renderPartners() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <DonorsPageStats />
        <DonorsPageRoster />
      </DonorsPageViewProvider>
    </QueryClientProvider>,
  );
}

function shownPartners() {
  return screen
    .getAllByText(/^(Avery Stone|Blake Moore)$/)
    .map((name) => name.textContent);
}

/** Applies filters through the roster's filter menu, then closes it. */
async function applyFilters(choices: { radio?: string[]; tags?: string[] }) {
  fireEvent.click(screen.getByRole("button", { name: "Filter partners" }));
  const menu = await screen.findByRole("menu");
  for (const name of choices.radio ?? []) {
    fireEvent.click(within(menu).getByRole("menuitemradio", { name }));
  }
  for (const name of choices.tags ?? []) {
    fireEvent.click(within(menu).getByRole("menuitemcheckbox", { name }));
  }
  fireEvent.keyDown(menu, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

function chip(name: string) {
  return screen.getByRole("button", { name });
}

function searchBox() {
  return screen.getByRole("textbox", { name: "Search partners" });
}

describe("roster filter chips", () => {
  it("moves focus to the next chip as each is removed, then to the search box", async () => {
    renderPartners();
    await applyFilters({
      radio: ["Lapsed", "Gives monthly"],
      tags: ["Major Donor"],
    });

    const status = chip("Clear Lapsed status filter");
    act(() => status.focus());
    fireEvent.click(status);
    await waitFor(() =>
      expect(document.activeElement).toBe(chip("Clear recurring filter")),
    );

    fireEvent.click(chip("Clear recurring filter"));
    await waitFor(() =>
      expect(document.activeElement).toBe(chip("Clear Major Donor tag filter")),
    );

    fireEvent.click(chip("Clear Major Donor tag filter"));
    await waitFor(() => expect(document.activeElement).toBe(searchBox()));
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
  });

  it("moves focus back to the previous chip when the last chip is removed", async () => {
    renderPartners();
    await applyFilters({ radio: ["Lapsed"], tags: ["Major Donor"] });

    const tag = chip("Clear Major Donor tag filter");
    act(() => tag.focus());
    fireEvent.click(tag);

    await waitFor(() =>
      expect(document.activeElement).toBe(chip("Clear Lapsed status filter")),
    );
  });

  it("returns focus to the search box after Clear all", async () => {
    renderPartners();
    await applyFilters({ radio: ["Lapsed"], tags: ["Major Donor"] });

    const clearAll = chip("Clear all");
    act(() => clearAll.focus());
    fireEvent.click(clearAll);

    await waitFor(() => expect(document.activeElement).toBe(searchBox()));
    expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]);
  });

  it("returns focus to the search box after Clear filters in the empty results", async () => {
    renderPartners();
    fireEvent.change(searchBox(), { target: { value: "Nobody" } });
    const clear = await screen.findByRole("button", { name: "Clear filters" });
    act(() => clear.focus());
    fireEvent.click(clear);

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).toBeNull(),
    );
    expect(document.activeElement).toBe(searchBox());
    expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]);
  });

  it("moves focus to the search box when only a search is left", async () => {
    renderPartners();
    fireEvent.change(searchBox(), { target: { value: "Blake" } });
    await applyFilters({ radio: ["Lapsed"] });

    const status = chip("Clear Lapsed status filter");
    act(() => status.focus());
    fireEvent.click(status);

    await waitFor(() => expect(document.activeElement).toBe(searchBox()));
    expect(chip("Clear all")).toBeTruthy();
  });
});

describe("stat tiles that filter the roster", () => {
  function tile(label: string) {
    return screen.getByRole("button", { name: new RegExp(`^${label}`) });
  }

  it("turns the Monthly partners filter off when pressed again", async () => {
    renderPartners();
    const monthly = tile("Monthly partners");
    expect(monthly.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(monthly);
    expect(monthly.getAttribute("aria-pressed")).toBe("true");
    await waitFor(() => expect(shownPartners()).toEqual(["Avery Stone"]));

    fireEvent.click(monthly);
    expect(monthly.getAttribute("aria-pressed")).toBe("false");
    expect(
      screen.queryByRole("button", { name: "Clear recurring filter" }),
    ).toBeNull();
    await waitFor(() =>
      expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]),
    );
  });

  it("turns the Need attention filter off when pressed again", () => {
    renderPartners();
    const attention = tile("Need attention");

    fireEvent.click(attention);
    expect(attention.getAttribute("aria-pressed")).toBe("true");
    expect(chip("Clear Needs Attention status filter")).toBeTruthy();

    fireEvent.click(attention);
    expect(attention.getAttribute("aria-pressed")).toBe("false");
    expect(
      screen.queryByRole("button", {
        name: "Clear Needs Attention status filter",
      }),
    ).toBeNull();
  });

  it("clears only its own filter when turned off, keeping a later search", () => {
    renderPartners();
    const monthly = tile("Monthly partners");
    fireEvent.click(monthly);
    fireEvent.change(searchBox(), { target: { value: "Avery" } });

    fireEvent.click(monthly);

    expect(monthly.getAttribute("aria-pressed")).toBe("false");
    expect((searchBox() as HTMLInputElement).value).toBe("Avery");
  });
});
