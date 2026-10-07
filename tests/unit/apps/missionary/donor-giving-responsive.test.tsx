/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";
import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import {
  DonorsPageViewProvider,
  useDonorsPageViewFields,
} from "../../../../apps/missionary/app/donors/use-donors-page-view";

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
    profile: { id: "giving-fixture-missionary" },
    loading: false,
  }),
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));

function SelectPartner() {
  const view = useDonorsPageViewFields();
  return (
    <button onClick={() => view.donors.selectById("giving-fixture-partner")}>
      Select giving fixture partner
    </button>
  );
}

beforeEach(() => {
  fixture.rows = [
    {
      id: "giving-fixture-partner",
      name: "Giving Fixture Partner",
      initials: "GF",
      type: "Individual",
      status: "Active",
      total_given: 200.5,
      last_gift_date: null,
      last_gift_amount: null,
      frequency: "One-time",
      email: "giving-fixture@example.test",
      phone: "555-0100",
      preferred_contact: "email",
      location: "Fixture City",
      address: {},
      joined_date: "2026-01-01T12:00:00Z",
      tags: [],
      score: 0,
      activities: [
        {
          id: "giving-fixture-bank",
          type: "gift",
          title: "Bank gift fixture",
          date: "2026-03-11T12:00:00Z",
          gift_type: "Bank Transfer",
          amount: 125.5,
          status: "Failed",
        },
        {
          id: "giving-fixture-online",
          type: "gift",
          title: "Online gift fixture",
          date: "2026-02-05T12:00:00Z",
          amount: 75,
        },
        {
          id: "giving-fixture-note",
          type: "note",
          title: "Non-gift fixture must stay outside giving",
          date: "2026-01-02T12:00:00Z",
        },
      ],
      recurring_donations: [],
      has_active_pledge: false,
    },
  ];
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("max-width")
        ? window.innerWidth <= Number(query.match(/max-width:\s*(\d+)/)?.[1])
        : query.includes("min-width")
          ? window.innerWidth >= Number(query.match(/min-width:\s*(\d+)/)?.[1])
          : query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([1440, 390])(
  "keeps actual selected-partner gift records and actions visible at %ipx",
  async (width) => {
    vi.stubGlobal("innerWidth", width);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <SelectPartner />
          <DonorsPageDetail />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select giving fixture partner" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Giving" }));

    const giving = within(screen.getByRole("tabpanel", { name: "Giving" }));
    expect(await giving.findByText("Bank gift fixture")).toBeTruthy();
    expect(giving.getByText("Mar 11, 2026")).toBeTruthy();
    expect(giving.getByText("Bank Transfer")).toBeTruthy();
    expect(giving.getByText("$125.5")).toBeTruthy();
    expect(giving.getByText("Failed")).toBeTruthy();
    expect(giving.getByText("Online gift fixture")).toBeTruthy();
    expect(giving.getByText("Feb 5, 2026")).toBeTruthy();
    expect(giving.getByText("Online")).toBeTruthy();
    expect(giving.getByText("$75")).toBeTruthy();
    expect(giving.getByText("Succeeded")).toBeTruthy();
    expect(
      giving.queryByText("Non-gift fixture must stay outside giving"),
    ).toBeNull();

    await waitFor(() =>
      expect(screen.queryByRole("tabpanel", { name: "Overview" })).toBeNull(),
    );
    expect(
      screen.getByRole("button", { name: "Note", exact: true }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Call", exact: true })
        .getAttribute("href"),
    ).toBe("tel:555-0100");
    expect(
      screen
        .getByRole("link", { name: "Email", exact: true })
        .getAttribute("href"),
    ).toBe("mailto:giving-fixture@example.test");
    fireEvent.click(screen.getByRole("button", { name: "Partner actions" }));
    expect(
      await screen.findByRole("menuitem", { name: "Edit Profile" }),
    ).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Manage Tags" })).toBeTruthy();
  },
);

it("reveals keyboard-focused detail tabs within their horizontal rail without moving the page", async () => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("scrollY", 240);
  const pageScroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <SelectPartner />
        <DonorsPageDetail />
      </DonorsPageViewProvider>
    </QueryClientProvider>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Select giving fixture partner" }),
  );
  const giving = screen.getByRole("tab", { name: "Giving" });
  const recurring = screen.getByRole("tab", { name: "Recurring" });
  const overview = screen.getByRole("tab", { name: "Overview" });
  fireEvent.click(giving);
  const rail = screen.getByRole("tablist").parentElement!.parentElement!;
  // The browser-reproduced narrow rail clips 14px of Giving before focus.
  vi.spyOn(rail, "getBoundingClientRect").mockReturnValue(
    new DOMRect(17, 220, 356, 68),
  );
  vi.spyOn(giving, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(327.56 - rail.scrollLeft, 238, 59.8, 36),
  );
  vi.spyOn(recurring, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(250 - rail.scrollLeft, 238, 77.56, 36),
  );
  vi.spyOn(overview, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(45 - rail.scrollLeft, 238, 79, 36),
  );
  rail.scrollTop = 63;
  const verticalReveal = vi.fn();
  giving.scrollIntoView = verticalReveal;

  act(() => giving.focus());
  fireEvent.keyDown(giving, { key: "ArrowLeft" });
  await waitFor(() => expect(document.activeElement).toBe(recurring));
  fireEvent.keyDown(recurring, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(giving));

  expect(giving.getAttribute("aria-selected")).toBe("true");
  expect(giving.getBoundingClientRect().right).toBeLessThanOrEqual(373);
  expect(rail.scrollLeft).toBeGreaterThan(0);
  const gifts = within(screen.getByRole("tabpanel", { name: "Giving" }));
  expect(await gifts.findByText("Bank gift fixture")).toBeTruthy();
  expect(gifts.getByText("$125.5")).toBeTruthy();
  expect(gifts.getByText("Failed")).toBeTruthy();

  rail.scrollLeft = 41;
  fireEvent.keyDown(giving, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(overview));
  expect(overview.getAttribute("aria-selected")).toBe("false");
  expect(giving.getAttribute("aria-selected")).toBe("true");
  expect(overview.getBoundingClientRect().left).toBeGreaterThanOrEqual(17);
  fireEvent.click(overview);
  expect(overview.getAttribute("aria-selected")).toBe("true");
  expect(rail.scrollTop).toBe(63);
  expect(window.scrollY).toBe(240);
  expect(pageScroll).not.toHaveBeenCalled();
  expect(verticalReveal).not.toHaveBeenCalled();
});
