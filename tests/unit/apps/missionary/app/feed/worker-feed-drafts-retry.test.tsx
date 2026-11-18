/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { renderWithDrafts } from "../../../../fixtures/retained-drafts";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));
vi.mock("@asym/database/hooks", () => ({
  refreshPendingFollowRequestCount: vi.fn(),
}));
// The editor loads lazily and is not what these tests are about.
vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicPlaceholder() {
      return null;
    },
}));
vi.mock(
  "../../../../../../apps/missionary/app/feed/feed-follow-requests",
  () => ({ FollowerRequestsCard: () => null }),
);

const { default: WorkerFeed } =
  await import("../../../../../../apps/missionary/app/feed/worker-feed-page-client");

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const draft = {
  id: "draft-1",
  post_type: "Update",
  title: "Harvest plans",
  content: "<p>Harvest plans</p>",
  created_at: "2026-11-01T10:00:00.000Z",
  visibility: "public",
  status: "draft",
  media: [],
};

const fetchMock = vi.fn<typeof fetch>();
// The first drafts load fails; each later one waits for the test to answer.
let draftLoads = 0;
let answerDrafts: (response: Response) => void = () => {};

beforeEach(() => {
  vi.clearAllMocks();
  // The page logs each failed load; these tests fail loads on purpose.
  vi.spyOn(console, "error").mockImplementation(() => {});
  draftLoads = 0;
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  }));
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    if (url.startsWith("/api/posts?status=published"))
      return json(200, { posts: [] });
    if (url.startsWith("/api/posts?status=draft")) {
      draftLoads += 1;
      if (draftLoads === 1) return json(500, { error: "unavailable" });
      return new Promise<Response>((resolve) => {
        answerDrafts = resolve;
      });
    }
    if (url.startsWith("/api/follower-requests?"))
      return json(200, { requests: [] });
    throw new Error(`unexpected ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Opens Drafts after its load failed, then presses Try again by keyboard focus. */
async function retryDrafts() {
  renderWithDrafts(<WorkerFeed />);
  fireEvent.click(screen.getByRole("tab", { name: /Drafts/ }));
  const firstAlert = await screen.findByRole("alert");
  expect(firstAlert.textContent).toBe("We couldn’t load your drafts.");
  const button = screen.getByRole("button", { name: "Try again" });
  act(() => button.focus());
  fireEvent.click(button);
  await waitFor(() => expect(draftLoads).toBe(2));
  return { button, firstAlert };
}

it("keeps focus on Try again while the drafts reload, then lands on the drafts panel", async () => {
  const { button } = await retryDrafts();
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.textContent).toBe("Trying again…");
  expect(screen.queryByRole("status", { name: "Loading drafts" })).toBeNull();

  await act(async () => answerDrafts(json(200, { posts: [draft] })));
  await screen.findByRole("button", {
    name: "Update actions for Harvest plans",
  });
  expect(button.isConnected).toBe(false);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("tabpanel")),
  );
});

it("leaves focus on Try again and announces again when the drafts still can't load", async () => {
  const { button, firstAlert } = await retryDrafts();

  await act(async () => answerDrafts(json(500, { error: "unavailable" })));
  await waitFor(() =>
    expect(button.getAttribute("aria-disabled")).not.toBe("true"),
  );
  expect(button.textContent).toBe("Try again");
  expect(document.activeElement).toBe(button);
  // A new alert node, so the unchanged message is read out again.
  const alert = screen.getByRole("alert");
  expect(alert).not.toBe(firstAlert);
  expect(alert.textContent).toBe("We couldn’t load your drafts.");
});
