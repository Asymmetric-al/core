/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
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
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({
    profile: { id: "roster-menu-missionary" },
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
    partner("menu-a", "Avery Stone", { has_active_pledge: true }),
    partner("menu-b", "Blake Moore", { status: "Lapsed" }),
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

function renderRoster() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
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

/** A labelled group in the menu behind `trigger`; menus stay open after a choice. */
async function menuGroup(trigger: string, name: string) {
  if (!screen.queryByRole("menu")) {
    fireEvent.click(screen.getByRole("button", { name: trigger }));
  }
  return screen.findByRole("group", { name });
}

function choiceNames(group: HTMLElement) {
  return within(group)
    .getAllByRole("menuitemradio")
    .map((choice) => choice.textContent);
}

function checkedChoiceNames(group: HTMLElement) {
  return within(group)
    .getAllByRole("menuitemradio", { checked: true })
    .map((choice) => choice.textContent);
}

function choose(group: HTMLElement, name: string) {
  fireEvent.click(within(group).getByRole("menuitemradio", { name }));
}

it("sorts by one field at a time, with direction as its own on/off choice", async () => {
  renderRoster();
  expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]);

  const sort = await menuGroup("Sort partners", "Sort by");
  expect(choiceNames(sort)).toEqual([
    "Last gift",
    "Total given",
    "Name",
    "Partner since",
  ]);
  expect(checkedChoiceNames(sort)).toEqual(["Last gift"]);

  choose(sort, "Name");
  expect(checkedChoiceNames(sort)).toEqual(["Name"]);
  await waitFor(() =>
    expect(shownPartners()).toEqual(["Blake Moore", "Avery Stone"]),
  );

  // Direction is independent of the field, so it stays a checkbox.
  const ascending = screen.getByRole("menuitemcheckbox", { name: "Ascending" });
  expect(ascending.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(ascending);
  expect(ascending.getAttribute("aria-checked")).toBe("true");
  expect(checkedChoiceNames(sort)).toEqual(["Name"]);
  await waitFor(() =>
    expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]),
  );
});

it("filters by one status at a time and clears from its All choice", async () => {
  renderRoster();
  const status = await menuGroup("Filter partners", "Status");
  expect(choiceNames(status)).toEqual([
    "All",
    "Active",
    "New",
    "Lapsed",
    "At Risk",
    "Needs Attention",
  ]);
  expect(checkedChoiceNames(status)).toEqual(["All"]);

  choose(status, "Lapsed");
  expect(checkedChoiceNames(status)).toEqual(["Lapsed"]);
  await waitFor(() => expect(shownPartners()).toEqual(["Blake Moore"]));

  choose(status, "All");
  expect(checkedChoiceNames(status)).toEqual(["All"]);
  await waitFor(() =>
    expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]),
  );
});

it("filters by monthly giving as one choice and clears from its All choice", async () => {
  renderRoster();
  const monthly = await menuGroup("Filter partners", "Monthly giving");
  expect(choiceNames(monthly)).toEqual([
    "All",
    "Gives monthly",
    "Doesn’t give monthly",
  ]);
  expect(checkedChoiceNames(monthly)).toEqual(["All"]);

  choose(monthly, "Gives monthly");
  expect(checkedChoiceNames(monthly)).toEqual(["Gives monthly"]);
  await waitFor(() => expect(shownPartners()).toEqual(["Avery Stone"]));

  choose(monthly, "Doesn’t give monthly");
  expect(checkedChoiceNames(monthly)).toEqual(["Doesn’t give monthly"]);
  await waitFor(() => expect(shownPartners()).toEqual(["Blake Moore"]));

  choose(monthly, "All");
  expect(checkedChoiceNames(monthly)).toEqual(["All"]);
  await waitFor(() =>
    expect(shownPartners()).toEqual(["Avery Stone", "Blake Moore"]),
  );
});

// A partner can carry several tags, so tags stay independent checkboxes.
it("keeps tags as independent checkboxes beside the single-choice filters", async () => {
  renderRoster();
  const tags = await menuGroup("Filter partners", "Tags");

  const tagChoices = within(tags).getAllByRole("menuitemcheckbox");
  expect(tagChoices.length).toBeGreaterThan(1);
  expect(within(tags).queryAllByRole("menuitemradio")).toEqual([]);
  fireEvent.click(tagChoices[0]!);
  fireEvent.click(tagChoices[1]!);
  expect(
    tagChoices.slice(0, 2).map((tag) => tag.getAttribute("aria-checked")),
  ).toEqual(["true", "true"]);
});
