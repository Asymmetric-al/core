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

import type * as EngagementModule from "@asym/ui/components/ministry-update";

const feed = vi.hoisted(() => ({
  data: [] as unknown[],
  error: null as Error | null,
}));
vi.mock("@asym/database/hooks", () => ({
  useDonorFeedPosts: () => ({ ...feed, isLoading: false }),
  postAuthorName: () => "Anna",
  formatPostRelativeTime: () => "Today",
  postTitle: (post: { title: string }) => post.title,
  postImages: () => [],
}));
const engagement = vi.hoisted(() => ({
  transport: null as ReturnType<
    typeof EngagementModule.createMemoryEngagementTransport
  > | null,
}));
// Keep the actual shared reaction UI/engine; inject only its public transport
// seam so these page tests never contact a service.
vi.mock("@asym/ui/components/ministry-update", async (importOriginal) => {
  const actual = await importOriginal<typeof EngagementModule>();
  engagement.transport = actual.createMemoryEngagementTransport();
  return {
    ...actual,
    ReactionBar: (props: EngagementModule.ReactionBarProps) => (
      <actual.ReactionBar {...props} transport={engagement.transport!} />
    ),
  };
});
// Use the real read-only renderer without loading the unrelated editor barrel.
vi.mock("@asym/ui/components/shadcn/rich-text-editor", async () => ({
  PostContent: (
    await import("../../../../packages/ui/components/shadcn/rich-text-editor/post-content")
  ).PostContent,
}));

const { default: DonorFeedPage } =
  await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/feed/page-client");

beforeEach(() => {
  feed.data = [];
  feed.error = null;
  vi.stubGlobal(
    "IntersectionObserver",
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

it.each(["error", "empty", "post"])(
  "keeps a coherent rendered heading outline in the %s state",
  (state) => {
    if (state === "error") feed.error = new Error("Offline fixture");
    if (state === "post")
      feed.data = [
        {
          id: "post-anna",
          title: "Field update",
          missionary_id: "missionary-anna",
          author: { avatar_url: "" },
          created_at: "2026-10-03T00:00:00.000Z",
          content: "Field news",
          like_count: 0,
          prayer_count: 0,
          comment_count: 0,
        },
      ];
    render(<DonorFeedPage />);

    const headings = screen.getAllByRole("heading");
    expect(headings.map((heading) => Number(heading.tagName.slice(1)))).toEqual(
      [1, 2],
    );
    expect(headings[0].textContent).toBe("Ministry Updates");
    expect(headings[1].textContent).toBe(
      state === "error"
        ? "Couldn't load updates"
        : state === "empty"
          ? "No posts found"
          : "Field update",
    );
    if (state === "post") expect(screen.getByText("Anna")).toBeTruthy();
  },
);

function twoPosts() {
  const shared = {
    missionary_id: "missionary-anna",
    author: { avatar_url: "" },
    created_at: "2026-10-03T00:00:00.000Z",
    prayer_count: 3,
    comment_count: 4,
  };
  return [
    {
      ...shared,
      id: "capability-anna",
      title: "Field update",
      content: "Field news",
      like_count: 2,
    },
    {
      ...shared,
      id: "capability-other",
      title: "Second update",
      content: "Other news",
      like_count: 9,
    },
  ];
}

it("shows supported feed capabilities without unfinished actions or mock sharing", () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  expect(screen.queryAllByRole("button", { name: "Follow" })).toHaveLength(0);
  expect(
    screen.queryAllByRole("button", { name: "Open post actions" }),
  ).toHaveLength(0);
  expect(screen.queryAllByRole("button", { name: "Share post" })).toHaveLength(
    0,
  );
  expect(
    screen.getAllByRole("button", { name: "Save this post" }),
  ).toHaveLength(2);
  expect(screen.getByText("Field news")).toBeTruthy();
  expect(screen.getByText("Other news")).toBeTruthy();
});

it("keeps bookmarks local, filters Saved, and restores all posts after removing a bookmark", async () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  const first = screen.getAllByRole("article")[0];
  fireEvent.click(
    within(first).getByRole("button", { name: "Save this post" }),
  );
  expect(
    within(first).getByRole("button", { name: "Remove from bookmarks" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Saved", exact: true }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(screen.getByRole("heading", { name: "Field update" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Second update" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Remove from bookmarks" }),
  );
  await screen.findByRole("heading", { name: "No posts found" });
  fireEvent.click(screen.getByRole("button", { name: "Browse All Updates" }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
  expect(
    screen.getAllByRole("button", { name: "Save this post" }),
  ).toHaveLength(2);
});

it("offers only filters supported by the current typed server post mapping", () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  expect(
    screen.queryByRole("button", { name: "Story", exact: true }),
  ).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Video", exact: true }),
  ).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Prayer", exact: true }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Update", exact: true }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "All", exact: true }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: "Saved", exact: true }),
  ).toBeTruthy();
});

it("exposes the active All, Update and Saved choice to assistive technology", () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  const all = screen.getByRole("button", { name: "All", exact: true });
  const updates = screen.getByRole("button", { name: "Update", exact: true });
  const saved = screen.getByRole("button", { name: "Saved", exact: true });
  expect(all.getAttribute("aria-pressed")).toBe("true");
  expect(updates.getAttribute("aria-pressed")).toBe("false");
  expect(saved.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(updates);
  expect(all.getAttribute("aria-pressed")).toBe("false");
  expect(updates.getAttribute("aria-pressed")).toBe("true");
  expect(saved.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(saved);
  expect(all.getAttribute("aria-pressed")).toBe("false");
  expect(updates.getAttribute("aria-pressed")).toBe("false");
  expect(saved.getAttribute("aria-pressed")).toBe("true");
});

it("retains the real reaction bar and targets the selected post relationship", async () => {
  feed.data = twoPosts().map((post) => ({
    ...post,
    id: `reaction-${post.id}`,
  }));
  render(<DonorFeedPage />);
  const cards = screen.getAllByRole("article");
  fireEvent.click(within(cards[0]).getByRole("button", { name: "Love 2" }));
  await within(cards[0]).findByRole("button", { name: "Love 3" });
  expect(within(cards[1]).getByRole("button", { name: "Love 9" })).toBeTruthy();
  expect(within(cards[0]).getByRole("button", { name: "Pray 3" })).toBeTruthy();
  expect(
    within(cards[0]).getByRole("button", { name: "Comments 4" }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(
      engagement.transport!.calls.some(
        (call) =>
          call.method === "setReaction" &&
          call.args[0] === "reaction-capability-anna" &&
          call.args[1] === "love" &&
          call.args[2] === true,
      ),
    ).toBe(true),
  );
});
