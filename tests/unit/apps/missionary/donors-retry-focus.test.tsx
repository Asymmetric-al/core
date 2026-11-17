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

import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
import { DonorsPageViewProvider } from "../../../../apps/missionary/app/donors/use-donors-page-view";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const fixture = vi.hoisted(() => ({
  rows: [] as Donor[],
  isLoading: false,
  error: null as Error | null,
  invalidate: vi.fn(async () => {}),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: fixture.rows,
    isLoading: fixture.isLoading,
    error: fixture.error,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "retry-missionary" }, loading: false }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: fixture.invalidate,
}));

const partner = {
  id: "retry-a",
  name: "Avery Stone",
  initials: "AS",
  type: "Individual",
  status: "Active",
  total_given: 100,
  last_gift_date: null,
  last_gift_amount: null,
  frequency: "One-time",
  email: "retry-a@example.test",
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

beforeEach(() => {
  fixture.rows = [];
  fixture.isLoading = false;
  fixture.error = new Error("Fixture load failure");
  fixture.invalidate.mockReset();
  fixture.invalidate.mockImplementation(async () => {});
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

function startRetry() {
  const view = render(page());
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  expect(fixture.invalidate).toHaveBeenCalled();
  fixture.error = null;
  fixture.isLoading = true;
  view.rerender(page());
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(screen.queryByLabelText("Loading partners")).toBeNull();
  return { view, button };
}

it("keeps focus on Try again while partners reload, then lands on the list heading", () => {
  const { view, button } = startRetry();
  fixture.isLoading = false;
  fixture.rows = [partner];
  view.rerender(page());
  expect(button.isConnected).toBe(false);
  expect(screen.getByText("Avery Stone")).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: /All partners/ }),
  );
});

it("leaves focus on Try again when partners still can't load", () => {
  const { view, button } = startRetry();
  fixture.isLoading = false;
  fixture.error = new Error("Still failing");
  view.rerender(page());
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  expect(screen.getByRole("alert").textContent).toContain("Still failing");
});

it("frees Try again and announces again when a refetch over loaded partners fails with the same message", async () => {
  // A refetch over loaded data never turns isLoading on, and the view model
  // passes the error on as its message, so only the refresh settling ends it.
  let settle = () => {};
  const refetched = new Promise<void>((resolve) => (settle = resolve));
  fixture.invalidate.mockImplementation(() => refetched);
  fixture.rows = [partner];
  fixture.error = new Error("Failed to load donors (500)");
  const view = render(page());
  const firstAlert = screen.getByRole("alert");
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");

  fixture.error = new Error("Failed to load donors (500)");
  view.rerender(page());
  await act(async () => {
    settle();
  });
  // The retry ends a task after the refresh settles (a query store renders
  // its answer a task later), not on a fixed tick.
  await waitFor(() =>
    expect(button.getAttribute("aria-disabled")).not.toBe("true"),
  );

  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  expect(button.textContent).toContain("Try again");
  expect(button.textContent).not.toContain("Trying again");
  const alert = screen.getByRole("alert");
  expect(alert).not.toBe(firstAlert);
  expect(alert.textContent).toContain("Failed to load donors (500)");

  fixture.invalidate.mockClear();
  fireEvent.click(button);
  expect(fixture.invalidate).toHaveBeenCalled();
});

it("still lands on the list heading when the loaded partners render after the refresh settles", async () => {
  fixture.rows = [partner];
  fixture.error = new Error("Failed to load donors (500)");
  const view = render(page());
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(document.activeElement).toBe(button);

  fixture.error = null;
  view.rerender(page());
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: /All partners/ }),
  );
});
