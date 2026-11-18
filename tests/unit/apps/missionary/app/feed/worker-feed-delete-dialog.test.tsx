/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { renderWithDrafts } from "../../../../fixtures/retained-drafts";

const mocks = vi.hoisted(() => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));
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

function post(id: string, title: string, status = "published") {
  return {
    id,
    post_type: "Update",
    title,
    content: `<p>${title}</p>`,
    created_at: "2026-11-01T10:00:00.000Z",
    visibility: "public",
    status,
    media: [],
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();
const published = [
  post("post-1", "New classroom"),
  post("post-2", "Clean water"),
];
const drafts = [
  post("draft-1", "Harvest plans", "draft"),
  post("draft-2", "Prayer for rain", "draft"),
];
let deleteResponse: () => Promise<Response> = async () => json(200, {});

beforeEach(() => {
  vi.clearAllMocks();
  deleteResponse = async () => json(200, {});
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
  fetchMock.mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.startsWith("/api/posts?status=published"))
      return json(200, { posts: published });
    if (url.startsWith("/api/posts?status=draft"))
      return json(200, { posts: drafts });
    if (url.startsWith("/api/follower-requests?"))
      return json(200, { requests: [] });
    if (url.startsWith("/api/posts/") && method === "DELETE")
      return deleteResponse();
    throw new Error(`unexpected ${method} ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function actionsFor(title: string) {
  return screen.getByRole("button", { name: `Update actions for ${title}` });
}

async function openDeleteFor(title: string) {
  const trigger = await screen.findByRole("button", {
    name: `Update actions for ${title}`,
  });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
  const dialog = await screen.findByRole("alertdialog", {
    name: `Delete ${title}?`,
  });
  return { dialog, trigger };
}

it("keeps the dialog open while deleting, then focuses the next update’s actions", async () => {
  let respond = (_response: Response) => {};
  deleteResponse = () =>
    new Promise<Response>((resolve) => {
      respond = resolve;
    });
  renderWithDrafts(<WorkerFeed />);
  const { dialog } = await openDeleteFor("New classroom");

  const confirm = within(dialog).getByRole("button", { name: "Delete" });
  fireEvent.click(confirm);
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(confirm.textContent).toBe("Deleting…");
  expect(confirm.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(confirm);
  expect(within(dialog).getByRole("status").textContent).toBe(
    "Deleting New classroom…",
  );
  expect(
    within(dialog).getByRole("button", { name: "Keep it" }),
  ).toHaveProperty("disabled", true);

  // Neither a second press nor Escape abandons the delete under way.
  fireEvent.click(confirm);
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(
    fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE"),
  ).toHaveLength(1);

  await act(async () => respond(json(200, {})));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(
    screen.queryByRole("button", { name: "Update actions for New classroom" }),
  ).toBeNull();
  await waitFor(() =>
    expect(document.activeElement).toBe(actionsFor("Clean water")),
  );
});

it("reports a failed delete inside the dialog and deletes on retry", async () => {
  deleteResponse = async () => json(500, {});
  renderWithDrafts(<WorkerFeed />);
  const { dialog } = await openDeleteFor("New classroom");

  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  expect((await within(dialog).findByRole("alert")).textContent).toBe(
    "Couldn’t delete that update. Try again.",
  );
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(within(dialog).queryByRole("status")?.textContent ?? "").toBe("");
  expect(mocks.toast.error).not.toHaveBeenCalled();

  deleteResponse = async () => json(200, {});
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(mocks.toast.success).toHaveBeenCalledWith("Update deleted");
});

it("returns focus to the update’s own actions when the delete is kept", async () => {
  renderWithDrafts(<WorkerFeed />);
  const { dialog, trigger } = await openDeleteFor("Clean water");
  fireEvent.click(within(dialog).getByRole("button", { name: "Keep it" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("focuses the previous update after deleting the last, then the composer once none are left", async () => {
  renderWithDrafts(<WorkerFeed />);
  let { dialog } = await openDeleteFor("Clean water");
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(actionsFor("New classroom")),
  );

  ({ dialog } = await openDeleteFor("New classroom"));
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Share an update" }),
    ),
  );
});

it("focuses the next draft’s actions after deleting a draft", async () => {
  renderWithDrafts(<WorkerFeed />);
  fireEvent.click(await screen.findByRole("tab", { name: /Drafts/ }));
  const { dialog } = await openDeleteFor("Harvest plans");
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(actionsFor("Prayer for rain")),
  );
});
