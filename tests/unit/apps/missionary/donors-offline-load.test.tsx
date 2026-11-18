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

// eslint-disable-next-line no-restricted-imports -- AL-2697: The partner roster is the unit under test.
import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
// eslint-disable-next-line no-restricted-imports -- AL-2697: The partner totals above the roster are under test too.
import { DonorsPageStats } from "../../../../apps/missionary/app/donors/donors-page-stats";
// eslint-disable-next-line no-restricted-imports -- AL-2697: The roster reads its partners through this page view.
import { DonorsPageViewProvider } from "../../../../apps/missionary/app/donors/use-donors-page-view";
import { onlineManager } from "../../../../packages/database/node_modules/@tanstack/react-query/build/modern/index.js";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

// Partners and the portal snapshot load through their real query hooks; only
// the signed-in user and the screen width are fixtures. The user is mocked as
// already known: this file covers a load that waits after sign-in resolved.
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "offline-missionary" }, loading: false }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));

const partner = {
  id: "offline-a",
  name: "Avery Stone",
  initials: "AS",
  type: "Individual",
  status: "Active",
  total_given: 100,
  last_gift_date: null,
  last_gift_amount: null,
  frequency: "One-time",
  email: "offline-a@example.test",
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

const portal = {
  support: {
    recurringMonthlyCents: 5000,
    recurringCurrency: "USD",
    monthlyPartnerCount: 1,
  },
};

/** Answers the partner list and the portal; the list fails while `failing`. */
function serve(state: { failing: boolean }) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.startsWith("/api/missionary/portal")) {
      return new Response(JSON.stringify({ portal }), { status: 200 });
    }
    return state.failing
      ? new Response(JSON.stringify({ error: "Fixture failure" }), {
          status: 500,
        })
      : new Response(
          JSON.stringify({
            donors: [partner],
            hasMore: false,
            nextOffset: null,
          }),
          { status: 200 },
        );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/**
 * The device's connection, set on TanStack Query's online manager itself, so
 * it holds even before a mounted provider listens for the browser's events.
 */
function setOnline(online: boolean) {
  act(() => {
    onlineManager.setOnline(online);
  });
}

beforeEach(() => {
  // Phone width: the roster lists partner cards without a measured scroll box.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width"),
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
  setOnline(true);
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

const page = () => (
  <QueryProvider>
    <DonorsPageViewProvider>
      <DonorsPageRoster />
    </DonorsPageViewProvider>
  </QueryProvider>
);

/** Long enough for a load that could run to answer. */
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)));

const TILES = ["Partners", "Given, all time", "Monthly partners"] as const;

/** A summary tile above the roster, found by its label. */
function tile(label: (typeof TILES)[number] | "Need attention") {
  return screen
    .getByText(label, { selector: '[data-slot="card-description"]' })
    .closest<HTMLElement>('[data-slot="card"]')!;
}

it("shows the loading list, not an empty one, while the first load waits offline", async () => {
  setOnline(false);
  const fetchMock = serve({ failing: false });
  render(page());
  await settle();

  // Waiting for the connection, not running and not failed.
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Loading partners")).toBeTruthy();
  expect(screen.queryByText("No partners found")).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();

  setOnline(true);
  expect(await screen.findByText("Avery Stone")).toBeTruthy();
  expect(screen.queryByLabelText("Loading partners")).toBeNull();
});

it("keeps Try again busy while the retry waits offline, then lands on the list heading", async () => {
  getQueryClient().setQueryDefaults(["donors"], { retry: false });
  const state = { failing: true };
  serve(state);
  render(page());
  const button = await screen.findByRole("button", { name: "Try again" });

  setOnline(false);
  state.failing = false;
  button.focus();
  fireEvent.click(button);
  await settle();

  // The retry has not answered, so the error view and its button stay.
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.textContent).toContain("Trying again…");
  expect(screen.queryByText("No partners found")).toBeNull();

  setOnline(true);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: /All partners/ }),
    ),
  );
  expect(button.isConnected).toBe(false);
  // The list switches to phone cards an effect after it first renders.
  expect(await screen.findByText("Avery Stone")).toBeTruthy();
});

it("shows the partner totals as loading, not as zeros, while the first load waits offline", async () => {
  setOnline(false);
  const fetchMock = serve({ failing: false });
  render(
    <QueryProvider>
      <DonorsPageViewProvider>
        <DonorsPageStats />
        <DonorsPageRoster />
      </DonorsPageViewProvider>
    </QueryProvider>,
  );
  await settle();

  expect(fetchMock).not.toHaveBeenCalled();
  // No totals have loaded, so no tile claims zero or "unavailable".
  expect(screen.queryByText(/0 active/)).toBeNull();
  expect(screen.queryByText(/at risk/)).toBeNull();
  expect(screen.queryByText(/unavailable/i)).toBeNull();
  for (const label of [...TILES, "Need attention"] as const) {
    expect(tile(label).getAttribute("aria-busy")).toBe("true");
  }

  setOnline(true);
  await waitFor(() =>
    expect(tile("Partners").textContent).toContain("1 active"),
  );
  expect(tile("Partners").hasAttribute("aria-busy")).toBe(false);
  expect(tile("Monthly partners").textContent).toContain(
    "$50.00 a month committed",
  );
});

it("keeps only the monthly tile loading while the portal waits offline", async () => {
  // The partners are cached and fresh; the portal snapshot is not.
  getQueryClient().setQueryData(
    ["donors", "missionary", "offline-missionary", "redacted"],
    {
      pages: [{ donors: [partner], hasMore: false, nextOffset: null }],
      pageParams: [0],
    },
  );
  setOnline(false);
  serve({ failing: false });
  render(
    <QueryProvider>
      <DonorsPageViewProvider>
        <DonorsPageStats />
      </DonorsPageViewProvider>
    </QueryProvider>,
  );
  await settle();

  expect(tile("Partners").textContent).toContain("1 active");
  expect(screen.queryByText(/Committed amount unavailable/)).toBeNull();
  expect(tile("Monthly partners").getAttribute("aria-busy")).toBe("true");

  setOnline(true);
  await waitFor(() =>
    expect(tile("Monthly partners").textContent).toContain(
      "$50.00 a month committed",
    ),
  );
  expect(tile("Monthly partners").hasAttribute("aria-busy")).toBe(false);
});
