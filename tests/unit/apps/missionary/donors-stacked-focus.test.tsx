/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";
import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
import { DonorsPageViewProvider } from "../../../../apps/missionary/app/donors/use-donors-page-view";

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
  useAuth: () => ({ profile: { id: "focus-missionary" }, loading: false }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function partner(id: string, name: string): Donor {
  return {
    id,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    type: "Individual",
    status: "Active",
    total_given: 20400,
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
  } as unknown as Donor;
}

beforeEach(() => {
  fixture.rows = [
    partner("focus-a", "Focus Partner A"),
    partner("focus-b", "Focus Partner B"),
  ];
  // Stacked phone layout (390px): the roster steps aside for the detail.
  // (Wider stacked widths use the virtualized table, which jsdom cannot lay
  // out, so the phone cards carry the same focus contract here.)
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matchesWidth(query, 390),
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

function matchesWidth(query: string, width: number) {
  const min = /min-width:\s*(\d+)px/.exec(query);
  const max = /max-width:\s*(\d+)px/.exec(query);
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
}

function rowFor(name: string) {
  return screen.getByText(name).closest<HTMLElement>('button, [tabindex="0"]')!;
}

// Below 1024px opening a partner hides the list (and the row that had focus);
// focus must follow to the detail, and return to that row on "Back".
it("moves focus into the opened partner and back to its row", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <DonorsPageRoster />
        <DonorsPageDetail />
      </DonorsPageViewProvider>
    </QueryClientProvider>,
  );

  const row = rowFor("Focus Partner B");
  act(() => row.focus());
  // Rows are native buttons: the browser turns Enter into a click.
  expect(row.tagName).toBe("BUTTON");
  fireEvent.click(row);

  const back = await screen.findByRole("button", {
    name: "Back to partner list",
  });
  await waitFor(() => expect(document.activeElement).toBe(back));

  fireEvent.click(back);
  await waitFor(() =>
    expect(document.activeElement).toBe(rowFor("Focus Partner B")),
  );
});

it("shows each partner's photo, giving and monthly status on phone rows", () => {
  fixture.rows = [
    { ...partner("focus-a", "Focus Partner A"), has_active_pledge: true },
    partner("focus-b", "Focus Partner B"),
  ];
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <DonorsPageRoster />
      </DonorsPageViewProvider>
    </QueryClientProvider>,
  );
  const monthly = rowFor("Focus Partner A");
  expect(monthly.textContent).toContain("Monthly");
  expect(monthly.textContent).toContain("Unavailable given");
  expect(monthly.textContent).not.toContain("$204.00");
  expect(monthly.textContent).toContain("FO");
  expect(rowFor("Focus Partner B").textContent).not.toContain("Monthly");
});
