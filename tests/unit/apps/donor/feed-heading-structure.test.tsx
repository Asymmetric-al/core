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
  hasMore: false,
  isLoadingMore: false,
  loadMore: vi.fn(),
  retry: vi.fn(),
  accessDenied: false,
  isNextPageError: false,
}));
vi.mock("@asym/database/hooks", () => ({
  useDonorFeedPostPages: () => ({ ...feed, isLoading: false }),
  postAuthorName: (post: { author_name?: string }) =>
    post.author_name ?? "Anna",
  formatPostRelativeTime: () => "Today",
  postTitle: (post: { title: string }) => post.title,
  postReadTime: () => "1 min read",
  postCategory: (post: { post_type?: string }) => post.post_type,
  postImages: (post: { images?: string[] }) => post.images ?? [],
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
  feed.hasMore = false;
  feed.isLoadingMore = false;
  feed.loadMore = vi.fn();
  feed.retry = vi.fn();
  feed.accessDenied = false;
  feed.isNextPageError = false;
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
    expect(headings[0].textContent).toBe("Updates");
    expect(headings[1].textContent).toBe(
      state === "error"
        ? "Couldn’t load updates"
        : state === "empty"
          ? "No updates yet"
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
  // Bookmarks were never saved anywhere, so the feed doesn't offer them.
  expect(
    screen.queryAllByRole("button", { name: "Save this post" }),
  ).toHaveLength(0);
  expect(screen.getByText("Field news")).toBeTruthy();
  expect(screen.getByText("Other news")).toBeTruthy();
});

function mixedPosts() {
  const [anna, other] = twoPosts();
  return [
    { ...anna, post_type: "Story" },
    { ...other, post_type: "Prayer Request" },
    {
      ...anna,
      id: "capability-ben",
      title: "Ben’s update",
      content: "Ben news",
      missionary_id: "missionary-ben",
      author_name: "Ben",
      post_type: "Story",
    },
  ];
}

it("filters by the update types that exist, in sentence case", async () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  const all = within(group).getByRole("button", { name: "All", exact: true });
  const story = within(group).getByRole("button", {
    name: "Story",
    exact: true,
  });
  const prayer = within(group).getByRole("button", {
    name: "Prayer request",
    exact: true,
  });
  expect(all.getAttribute("aria-pressed")).toBe("true");
  expect(within(group).queryByRole("button", { name: "Video" })).toBeNull();

  fireEvent.click(prayer);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(prayer.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("heading", { name: "Second update" })).toBeTruthy();

  fireEvent.click(story);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
  fireEvent.click(all);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
});

it("keeps the type chips on one row that scrolls sideways, so none sits alone", () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  // One unwrapped row as wide as its chips, inside the shared scroll area
  // (no native scrollbar; the edges fade while chips are hidden past them).
  expect(group.className).not.toMatch(/\bflex-wrap\b/);
  expect(group.className).toMatch(/\bw-max\b/);
  const scrollArea = group.closest<HTMLElement>('[data-slot="scroll-area"]');
  expect(scrollArea).not.toBeNull();
  // Room inside the scroller for the focus ring, offset outside it so the
  // chips stay aligned with the page column.
  expect(group.className).toMatch(/\bp-1\b/);
  expect(scrollArea!.className).toMatch(/(^|\s)-m-1(\s|$)/);
});

it("scrolls a focused chip clear of the faded edge so its focus ring shows", () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  const rail = group.closest<HTMLElement>(
    '[data-slot="scroll-area-viewport"]',
  )!;
  let scrollLeft = 0;
  Object.defineProperty(rail, "scrollLeft", {
    configurable: true,
    get: () => scrollLeft,
    set: (value: number) => {
      scrollLeft = value;
    },
  });
  const bounds = (left: number, right: number) =>
    ({ left, right, top: 0, bottom: 32, width: right - left }) as DOMRect;
  rail.getBoundingClientRect = () => bounds(0, 300);
  // jsdom has no input modality, so each focus says whether it came from
  // the keyboard (:focus-visible) or a pointer.
  const focusFrom = (chip: HTMLElement, keyboard: boolean) => {
    const matches = Element.prototype.matches.bind(chip);
    chip.matches = (selector: string) =>
      selector === ":focus-visible" ? keyboard : matches(selector);
    chip.focus();
  };

  const story = within(group).getByRole("button", {
    name: "Story",
    exact: true,
  });
  story.getBoundingClientRect = () => bounds(260, 320);
  focusFrom(story, true);
  // Past the right edge by 20px, plus the 24px edge fade.
  expect(scrollLeft).toBe(44);

  scrollLeft = 100;
  const all = within(group).getByRole("button", { name: "All", exact: true });
  all.getBoundingClientRect = () => bounds(-50, -10);
  focusFrom(all, true);
  // Back past the left edge by 50px, plus the 24px edge fade.
  expect(scrollLeft).toBe(26);

  // A tap or click focuses the chip too, but moving the row under the
  // pointer then would make the press land on a different chip.
  scrollLeft = 100;
  focusFrom(story, false);
  expect(scrollLeft).toBe(100);
});

it("offers a missionary filter only when updates come from more than one", () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  expect(screen.queryByRole("combobox", { name: "Missionary" })).toBeNull();
  cleanup();
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  expect(screen.getByRole("combobox", { name: "Missionary" })).toBeTruthy();
});

it("shows every photo in an update, not only the first", () => {
  const [anna] = twoPosts();
  feed.data = [
    {
      ...anna,
      images: [
        "https://images.unsplash.com/photo-a",
        "https://images.unsplash.com/photo-b",
      ],
    },
  ];
  // Embla (the carousel) reads media queries and observes its size.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  render(<DonorFeedPage />);
  expect(screen.getByAltText("Field update (1 of 2)")).toBeTruthy();
  expect(screen.getByAltText("Field update (2 of 2)")).toBeTruthy();
});

it("puts an update’s photo between its title and its text", () => {
  const [anna] = twoPosts();
  feed.data = [{ ...anna, images: ["https://images.unsplash.com/photo-a"] }];
  render(<DonorFeedPage />);
  const title = screen.getByRole("heading", { name: "Field update" });
  const photo = screen.getByAltText("Field update");
  const text = screen.getByText("Field news");
  const following = Node.DOCUMENT_POSITION_FOLLOWING;
  // The missionary’s own feed previews this same order.
  expect(title.compareDocumentPosition(photo) & following).toBeTruthy();
  expect(photo.compareDocumentPosition(text) & following).toBeTruthy();
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

it("opens on the update a link points to", async () => {
  feed.data = mixedPosts();
  window.history.replaceState(null, "", "#update-capability-ben");
  const scrolled = vi.fn();
  Element.prototype.scrollIntoView = scrolled;
  render(<DonorFeedPage />);

  const target = document.getElementById("update-capability-ben");
  await waitFor(() => expect(document.activeElement).toBe(target));
  expect(scrolled).toHaveBeenCalled();
  window.history.replaceState(null, "", " ");
});

// The feed loads a page at a time, so the end of what's loaded is not the
// end of the feed while the server says there is more.
it("offers more updates instead of claiming the end while more remain", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  render(<DonorFeedPage />);
  expect(screen.queryByText("You’re all caught up.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Load more updates" }));
  expect(feed.loadMore).toHaveBeenCalledTimes(1);
});

it("hides loaded articles after access is denied", () => {
  feed.data = twoPosts();
  feed.error = Object.assign(new Error("Denied"), { status: 403 });
  feed.accessDenied = true;
  render(<DonorFeedPage />);
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(
    screen.getByRole("heading", { name: "Couldn’t load updates" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(feed.retry).toHaveBeenCalledTimes(1);
});

it("says the donor is caught up only at the real end of the feed", () => {
  feed.data = twoPosts();
  render(<DonorFeedPage />);
  expect(screen.getByText("You’re all caught up.")).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Load more updates" }),
  ).toBeNull();
});

it("keeps loaded updates and offers a retry when a later page fails", () => {
  feed.data = twoPosts();
  feed.error = new Error("Offline fixture");
  feed.hasMore = true;
  feed.isNextPageError = true;
  render(<DonorFeedPage />);
  // The updates already read stay on screen.
  expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
  expect(
    screen.queryByRole("heading", { name: "Couldn’t load updates" }),
  ).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain(
    "Couldn’t load more updates.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(feed.retry).toHaveBeenCalledTimes(1);
});
