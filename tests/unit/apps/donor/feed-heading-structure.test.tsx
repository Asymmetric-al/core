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
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type * as EngagementModule from "@asym/ui/components/ministry-update";

const feed = vi.hoisted(() => ({
  /** The loaded updates; undefined while nothing is cached. */
  data: undefined as unknown[] | undefined,
  error: null as Error | null,
  isLoading: false,
  isFetching: false,
  isPaused: false,
  hasMore: false,
  isLoadingMore: false,
  loadMore: vi.fn(),
  retry: vi.fn(),
  accessDenied: false,
  isNextPageError: false,
}));
vi.mock("@asym/database/hooks", () => ({
  // Like the real hook, which flattens the cached pages on every render and
  // hides them once access is denied, for which a first load and a page load
  // are fetches too, and which is pending while nothing has loaded or failed.
  useDonorFeedPostPages: () => ({
    ...feed,
    data: feed.accessDenied ? [] : [...(feed.data ?? [])],
    isPending: feed.data === undefined && !feed.error,
    isFetching: feed.isFetching || feed.isLoading || feed.isLoadingMore,
  }),
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
  // Nothing cached until a test loads something, as when the page opens.
  feed.data = undefined;
  feed.error = null;
  feed.isLoading = false;
  feed.isFetching = false;
  feed.isPaused = false;
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
    if (state === "empty") feed.data = [];
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
  expect(
    screen.getByRole("region", { name: "Photos from Field update" }),
  ).toBeTruthy();
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

it("offers the update types as one group with a single tab stop and arrow keys", async () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  const chips = within(group).getAllByRole("button");
  expect(group.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  expect(chips[0]!.tabIndex).toBe(0);

  chips[0]!.focus();
  fireEvent.keyDown(chips[0]!, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(chips[1]));
  // Moving focus does not filter; pressing a chip does.
  expect(screen.getAllByRole("article")).toHaveLength(3);
});

it("never leaves the update type filter without a choice", async () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  const all = within(group).getByRole("button", { name: "All", exact: true });
  const story = within(group).getByRole("button", {
    name: "Story",
    exact: true,
  });

  fireEvent.click(all);
  expect(all.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getAllByRole("article")).toHaveLength(3);

  fireEvent.click(story);
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
  fireEvent.click(story);
  expect(story.getAttribute("aria-pressed")).toBe("true");
  expect(all.getAttribute("aria-pressed")).toBe("false");
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

it("keeps the filled and outline button look on the update type chips", () => {
  feed.data = mixedPosts();
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  const [all, other] = within(group).getAllByRole("button");
  expect(all!.className).toMatch(/\bbg-primary\b/);
  expect(other!.className).toMatch(/\bbg-background\b/);
  for (const chip of [all!, other!]) {
    expect(chip.className).not.toMatch(/data-pressed:|hover:bg-muted/);
    expect(chip.className).toMatch(/\bh-8\b/);
  }
});

it("names each update after its title, or its author when it has none", () => {
  const [anna] = twoPosts();
  feed.data = [
    anna,
    {
      ...anna,
      id: "untitled-ben",
      title: undefined,
      author_name: "Ben",
      missionary_id: "missionary-ben",
    },
  ];
  render(<DonorFeedPage />);
  expect(screen.getByRole("article", { name: "Field update" })).toBeTruthy();
  expect(screen.getByRole("article", { name: "Ben" })).toBeTruthy();
});

it("ties each update's reaction buttons to that update", () => {
  const [anna, other] = twoPosts();
  feed.data = [
    anna,
    other,
    {
      ...anna,
      id: "untitled-ben",
      title: undefined,
      author_name: "Ben",
      missionary_id: "missionary-ben",
    },
  ];
  render(<DonorFeedPage />);
  const [first, second, untitled] = screen.getAllByRole("article");
  for (const name of ["Love 2", "Pray 3", "Comments 4"]) {
    expect(
      within(first!).getByRole("button", { name, description: "Field update" }),
    ).toBeTruthy();
  }
  expect(
    within(second!).getByRole("button", {
      name: "Love 9",
      description: "Second update",
    }),
  ).toBeTruthy();
  expect(
    within(untitled!).getByRole("button", {
      name: "Love 2",
      description: "Ben 1 min read · Today",
    }),
  ).toBeTruthy();
});

const nextPost = {
  ...twoPosts()[0],
  id: "capability-next",
  title: "Third update",
  content: "Next page news",
};

it("keeps focus on Load more while it loads, then moves it to the first new update", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  const view = render(<DonorFeedPage />);
  const loadMore = screen.getByRole("button", { name: "Load more updates" });
  act(() => loadMore.focus());
  fireEvent.click(loadMore);
  expect(feed.loadMore).toHaveBeenCalledTimes(1);

  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  const loading = screen.getByRole("button", { name: "Loading…" });
  expect(loading).toBe(loadMore);
  expect(loading.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(loading);

  // The last page arrives, so the button gives way to the end of the feed.
  feed.isLoadingMore = false;
  feed.hasMore = false;
  feed.data = [...twoPosts(), nextPost];
  view.rerender(<DonorFeedPage />);
  expect(screen.getByText("You’re all caught up.")).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Third update" }),
  );
});

it("moves focus to Try again when a page fails, and on to the new update once it loads", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  const view = render(<DonorFeedPage />);
  const loadMore = screen.getByRole("button", { name: "Load more updates" });
  act(() => loadMore.focus());
  fireEvent.click(loadMore);
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);

  feed.isLoadingMore = false;
  feed.error = new Error("Offline fixture");
  feed.isNextPageError = true;
  view.rerender(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  expect(document.activeElement).toBe(retry);

  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  expect(retry.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);

  feed.isLoadingMore = false;
  feed.error = null;
  feed.isNextPageError = false;
  feed.data = [...twoPosts(), nextPost];
  view.rerender(<DonorFeedPage />);
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Third update" }),
  );
});

it("keeps the keyboard place when Show all updates clears the filters", async () => {
  feed.data = mixedPosts();
  const view = render(<DonorFeedPage />);
  fireEvent.click(
    screen.getByRole("button", { name: "Prayer request", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  // A refresh takes away the only prayer request, so nothing matches.
  feed.data = mixedPosts().filter((post) => post.post_type === "Story");
  view.rerender(<DonorFeedPage />);
  const showAll = screen.getByRole("button", { name: "Show all updates" });
  act(() => showAll.focus());
  fireEvent.click(showAll);
  expect(screen.queryByRole("button", { name: "Show all updates" })).toBeNull();
  expect(document.activeElement).toBe(screen.getAllByRole("article")[0]);
});

it("moves focus to the first update when a retry loads the feed", () => {
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  feed.error = null;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

function failToLoadFeed() {
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

it("shows Try again as busy while a loaded empty feed reloads, and reloads once", () => {
  // The feed loaded with no updates, then a refresh failed.
  feed.data = [];
  const { view, retry } = failToLoadFeed();
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  // With a result cached, TanStack Query keeps the error while the reload
  // runs, and it is neither a first load nor a page load.
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);
  fireEvent.click(busy);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  feed.isFetching = false;
  feed.error = null;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("moves focus to the first update when a reload works after access was denied over cached pages", () => {
  // Pages are cached, yet the hook hides them once access is denied.
  feed.data = twoPosts();
  feed.error = Object.assign(new Error("Denied"), { status: 403 });
  feed.accessDenied = true;
  const view = render(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  // The press itself re-renders the page.
  fireEvent.click(retry);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(document.activeElement).toBe(retry);
  // With pages cached, the error stays while the reload runs.
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(document.activeElement).toBe(retry);

  feed.isFetching = false;
  feed.error = null;
  feed.accessDenied = false;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("keeps Try again in place while the feed loads afresh", () => {
  const { view, retry } = failToLoadFeed();
  fireEvent.click(retry);

  // With nothing cached, TanStack Query clears the error and loads again; the
  // button stays put instead of giving way to the skeleton.
  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);

  feed.isLoading = false;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("keeps Try again busy while an offline reload waits for the connection", () => {
  const { view, retry } = failToLoadFeed();
  const alert = screen.getByRole("alert");
  fireEvent.click(retry);

  // Offline with nothing cached, TanStack Query clears the error and pauses
  // the reload: nothing loads, yet nothing has answered.
  feed.error = null;
  feed.isPaused = true;
  view.rerender(<DonorFeedPage />);
  const busy = screen.getByRole("button", { name: "Waiting for connection…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);
  expect(screen.getByRole("alert")).toBe(alert);
  expect(screen.queryByRole("heading", { name: "No updates yet" })).toBeNull();
  fireEvent.click(busy);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  // The connection returns, so the reload runs and the updates arrive.
  feed.isPaused = false;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(document.activeElement).toBe(retry);

  feed.isLoading = false;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("says so again when an offline reload fails once the connection returns", () => {
  const { view, retry } = failToLoadFeed();
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);
  feed.error = null;
  feed.isPaused = true;
  view.rerender(<DonorFeedPage />);

  feed.isPaused = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  expect(screen.getByRole("alert")).not.toBe(firstAlert);
});

it("shows the feed loading while a first load waits offline for the connection", () => {
  // Offline with nothing cached, TanStack Query pauses the first load: nothing
  // has loaded or failed and nothing is fetching, yet the feed has not
  // answered.
  feed.isPaused = true;
  const view = render(<DonorFeedPage />);
  const loading = screen.getByRole("status", { name: "Loading updates" });
  expect(screen.queryByRole("heading", { name: "No updates yet" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(announced()).toEqual([]);

  // The connection returns, so the load runs and the updates arrive.
  feed.isPaused = false;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("status", { name: "Loading updates" })).toBe(loading);

  feed.isLoading = false;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.queryByRole("status", { name: "Loading updates" })).toBeNull();
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

it("still says there are no updates while a refresh of an empty feed waits offline", () => {
  // Loaded and empty, so a refresh waiting for the connection has nothing
  // new to show yet.
  feed.data = [];
  feed.isPaused = true;
  render(<DonorFeedPage />);
  expect(screen.getByRole("heading", { name: "No updates yet" })).toBeTruthy();
  expect(screen.queryByRole("status", { name: "Loading updates" })).toBeNull();
});

it("keeps saying why the feed couldn’t load while it tries again", () => {
  feed.error = Object.assign(new Error("Denied"), { status: 403 });
  feed.accessDenied = true;
  const view = render(<DonorFeedPage />);
  const alert = screen.getByRole("alert");
  const reason = alert.textContent;
  expect(reason).toContain(
    "Your access to these updates could not be confirmed",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));

  // With nothing cached, the error and its reason clear while it loads.
  feed.error = null;
  feed.accessDenied = false;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBeTruthy();
  expect(screen.getByRole("alert")).toBe(alert);
  expect(alert.textContent).toBe(reason);
});

it("returns to Try again and says so again each time the reload fails", () => {
  const { view, retry } = failToLoadFeed();
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);
  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);

  feed.isLoading = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toContain("Couldn’t load updates");

  // Still nothing cached, so the next reload clears the error again and is
  // announced only once it fails.
  fireEvent.click(again);
  expect(feed.retry).toHaveBeenCalledTimes(2);
  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("alert")).toBe(secondAlert);
  feed.isLoading = false;
  feed.error = new Error("Offline again");
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("alert")).not.toBe(secondAlert);
  expect(screen.getByRole("button", { name: "Try again" })).toBe(retry);
  expect(document.activeElement).toBe(retry);
});

it("says so again when a loaded empty feed’s reload fails again", () => {
  feed.data = [];
  const { view, retry } = failToLoadFeed();
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);

  // A cached result keeps the error until the reload answers with a new one.
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("alert")).toBe(firstAlert);

  feed.isFetching = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Try again" })).toBe(retry);
  expect(document.activeElement).toBe(retry);
  expect(screen.getByRole("alert")).not.toBe(firstAlert);
  expect(screen.getByRole("alert").textContent).toContain(
    "Couldn’t load updates",
  );
});

it.each([
  ["after a loaded empty feed’s refresh failed", false],
  ["through a fresh load", true],
])(
  "moves focus to the first update when the feed recovers on its own %s while Try again has focus",
  (_case, freshLoad) => {
    // The feed loaded with no updates, then a refresh failed.
    if (!freshLoad) feed.data = [];
    const { view, retry } = failToLoadFeed();
    fireEvent.click(retry);
    feed.error = new Error("Still offline");
    view.rerender(<DonorFeedPage />);
    expect(document.activeElement).toBe(retry);

    // Later the connection returns and the feed refetches by itself, removing
    // the button the keyboard is on. With nothing cached it loads afresh
    // first; with a result cached the error stays while it refetches.
    if (freshLoad) {
      feed.error = null;
      feed.isLoading = true;
      view.rerender(<DonorFeedPage />);
      expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
      feed.isLoading = false;
    } else {
      feed.isFetching = true;
      view.rerender(<DonorFeedPage />);
      expect(screen.getByRole("button", { name: "Try again" })).toBe(retry);
      expect(document.activeElement).toBe(retry);
      feed.isFetching = false;
      feed.error = null;
    }
    feed.data = twoPosts();
    view.rerender(<DonorFeedPage />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(document.activeElement).toBe(
      screen.getByRole("article", { name: "Field update" }),
    );
  },
);

it.each([
  ["it recovers on its own after a failed Try again", true],
  ["Try again works", false],
])(
  "leaves focus where the donor puts it once a feed that failed to load is back, after %s",
  (_case, pressFails) => {
    const { view, retry } = failToLoadFeed();
    fireEvent.click(retry);
    if (pressFails) {
      feed.error = new Error("Still offline");
      view.rerender(<DonorFeedPage />);
      expect(document.activeElement).toBe(retry);
    }
    feed.error = null;
    feed.data = twoPosts();
    view.rerender(<DonorFeedPage />);
    const first = screen.getByRole("article", { name: "Field update" });
    expect(document.activeElement).toBe(first);

    // The donor clicks blank page space, then a background refetch runs.
    act(() => first.blur());
    feed.isFetching = true;
    view.rerender(<DonorFeedPage />);
    feed.isFetching = false;
    view.rerender(<DonorFeedPage />);
    expect(document.activeElement).toBe(document.body);
  },
);

function failToRefreshFeed() {
  feed.data = twoPosts();
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  feed.isFetching = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  expect(document.activeElement).toBe(retry);
  return { view, retry };
}

it("moves focus to the first update when a refresh recovers on its own while Try again under the updates has focus", () => {
  const { view } = failToRefreshFeed();

  // Later the connection returns and the feed refreshes by itself; the
  // failure gives way to the end of the feed.
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  feed.isFetching = false;
  feed.error = null;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByText("You’re all caught up.")).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("keeps focus on the button when a refresh that recovers on its own leaves more to load", () => {
  const { view, retry } = failToRefreshFeed();

  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  feed.isFetching = false;
  feed.error = null;
  feed.hasMore = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Load more updates" })).toBe(retry);
  expect(document.activeElement).toBe(retry);
});

it("leaves focus alone when the feed recovers on its own while nothing has focus", () => {
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  expect(document.activeElement).toBe(document.body);

  // Later the connection returns and the feed refetches by itself.
  feed.error = null;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(document.activeElement).toBe(document.body);
  expect(
    screen.getByRole("heading", { level: 1 }).hasAttribute("tabindex"),
  ).toBe(false);
});

it("takes the reader to the first new update even while more pages remain", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  const view = render(<DonorFeedPage />);
  const loadMore = screen.getByRole("button", { name: "Load more updates" });
  act(() => loadMore.focus());
  fireEvent.click(loadMore);
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  feed.isLoadingMore = false;
  feed.data = [...twoPosts(), nextPost];
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Load more updates" })).toBe(
    loadMore,
  );
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Third update" }),
  );
});

// Offline, TanStack Query pauses the fetch a press starts: the page re-renders
// with nothing loading (a paused fetch is not fetching), and the fetch runs
// once the connection returns.
it.each([
  ["the last page", false],
  ["a page with more after it", true],
])(
  "takes the reader to the first new update when Load more waits offline for %s",
  (_, more) => {
    feed.data = twoPosts();
    feed.hasMore = true;
    const view = render(<DonorFeedPage />);
    const loadMore = screen.getByRole("button", { name: "Load more updates" });
    act(() => loadMore.focus());
    fireEvent.click(loadMore);

    feed.isPaused = true;
    view.rerender(<DonorFeedPage />);
    // The press is waiting, and the button says what for.
    expect(
      screen.getByRole("button", { name: "Waiting for connection…" }),
    ).toBe(loadMore);
    expect(loadMore.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(loadMore);

    feed.isPaused = false;
    feed.isLoadingMore = true;
    view.rerender(<DonorFeedPage />);
    expect(screen.getByRole("button", { name: "Loading…" })).toBe(loadMore);
    feed.isLoadingMore = false;
    feed.hasMore = more;
    feed.data = [...twoPosts(), nextPost];
    view.rerender(<DonorFeedPage />);
    expect(document.activeElement).toBe(
      screen.getByRole("article", { name: "Third update" }),
    );
  },
);

it("takes the reader to the new update when a page’s Try again waits offline", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  feed.error = new Error("Offline fixture");
  feed.isNextPageError = true;
  const view = render(<DonorFeedPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  // With pages cached, the error stays while the retry waits and runs.
  feed.isPaused = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Waiting for connection…" })).toBe(
    retry,
  );
  expect(retry.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);

  feed.isPaused = false;
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  feed.isLoadingMore = false;
  feed.error = null;
  feed.isNextPageError = false;
  feed.hasMore = false;
  feed.data = [...twoPosts(), nextPost];
  view.rerender(<DonorFeedPage />);
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Third update" }),
  );
});

it("takes the reader to the first update when a refresh’s Try again waits offline", () => {
  feed.data = twoPosts();
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  expect(screen.getByRole("alert").textContent).toContain(
    "Couldn’t refresh updates.",
  );
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  feed.isPaused = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Waiting for connection…" })).toBe(
    retry,
  );
  expect(document.activeElement).toBe(retry);

  // Back online the refresh runs, yet over cached pages it is neither a first
  // load nor a page load.
  feed.isPaused = false;
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(retry.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);

  feed.isFetching = false;
  feed.error = null;
  feed.data = twoPosts();
  view.rerender(<DonorFeedPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Field update" }),
  );
});

it("says so again, with focus kept on Try again, when a page fails again", () => {
  feed.data = twoPosts();
  feed.hasMore = true;
  feed.error = new Error("Offline fixture");
  feed.isNextPageError = true;
  const view = render(<DonorFeedPage />);
  const firstAlert = screen.getByRole("alert");
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  // With pages cached, the error stays while the page loads again.
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(retry.getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByRole("alert")).toBe(firstAlert);

  feed.isLoadingMore = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Try again" })).toBe(retry);
  expect(retry.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(retry);
  // A new alert, so the failure is announced again; it says only what failed.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("Couldn’t load more updates.");
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

it("shows a refresh’s Try again as busy until it answers, and says so again when it fails again", () => {
  feed.data = twoPosts();
  feed.error = new Error("Offline fixture");
  const view = render(<DonorFeedPage />);
  const firstAlert = screen.getByRole("alert");
  expect(firstAlert.textContent).toBe("Couldn’t refresh updates.");
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  // Over cached pages the refresh is neither a first load nor a page load,
  // yet it runs until it answers. Another press would restart it.
  feed.isFetching = true;
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
  expect(retry.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);
  fireEvent.click(retry);
  expect(feed.retry).toHaveBeenCalledTimes(1);

  feed.isFetching = false;
  feed.error = new Error("Still offline");
  view.rerender(<DonorFeedPage />);
  expect(screen.getByRole("button", { name: "Try again" })).toBe(retry);
  expect(document.activeElement).toBe(retry);
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("Couldn’t refresh updates.");
});

async function chooseMissionary(name: string) {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: "Missionary" }));
  const option = await screen.findByRole("option", { name, exact: true });
  fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
  fireEvent.click(option);
}

it("still names the chosen missionary once a refresh takes their updates away", async () => {
  feed.data = mixedPosts();
  const view = render(<DonorFeedPage />);
  await chooseMissionary("Ben");
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(announced()).toEqual(["1 update matches: Ben, out of 3 loaded"]);

  // A refresh no longer brings Ben’s only update.
  feed.data = mixedPosts().filter(
    (post) => post.missionary_id !== "missionary-ben",
  );
  view.rerender(<DonorFeedPage />);
  expect(
    screen.getByRole("heading", { name: "No updates match" }),
  ).toBeTruthy();
  expect(announced()).toEqual(["No updates match: Ben, out of 2 loaded"]);
  // The filter hiding every update stays on screen and names its choice.
  expect(
    screen.getByRole("combobox", { name: "Missionary" }).textContent,
  ).toContain("Ben");
});

it("keeps the chosen type's chip pressed once a refresh takes its updates away", async () => {
  feed.data = mixedPosts();
  const view = render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  fireEvent.click(
    within(group).getByRole("button", { name: "Prayer request", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));

  // A refresh no longer brings the only prayer request.
  feed.data = mixedPosts().filter(
    (post) => post.post_type !== "Prayer Request",
  );
  view.rerender(<DonorFeedPage />);
  expect(announced()).toEqual([
    "No updates match: Prayer request, out of 2 loaded",
  ]);
  // The filter hiding every update stays on screen, pressed.
  const chip = within(
    screen.getByRole("group", { name: "Type of update" }),
  ).getByRole("button", { name: "Prayer request", exact: true });
  expect(chip.getAttribute("aria-pressed")).toBe("true");
});

/** What the page's polite live regions currently say. */
function announced() {
  return screen
    .queryAllByRole("status")
    .map((status) => status.textContent?.trim() ?? "")
    .filter(Boolean);
}

it("says how many updates match while a filter narrows the feed, from one region present from the start", async () => {
  feed.data = mixedPosts();
  const view = render(<DonorFeedPage />);
  const atFirstPaint = screen.getAllByRole("status");
  expect(announced()).toEqual([]);

  const group = screen.getByRole("group", { name: "Type of update" });
  fireEvent.click(
    within(group).getByRole("button", { name: "Prayer request", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(announced()).toEqual([
    "1 update matches: Prayer request, out of 3 loaded",
  ]);
  const region = screen
    .getAllByRole("status")
    .find(
      (status) =>
        status.textContent ===
        "1 update matches: Prayer request, out of 3 loaded",
    );
  expect(atFirstPaint).toContain(region);

  fireEvent.click(
    within(group).getByRole("button", { name: "Story", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
  expect(announced()).toEqual(["2 updates match: Story, out of 3 loaded"]);

  // A refresh takes away every story: the same region says nothing matches.
  feed.data = mixedPosts().filter((post) => post.post_type !== "Story");
  view.rerender(<DonorFeedPage />);
  expect(
    screen.getByRole("heading", { name: "No updates match" }),
  ).toBeTruthy();
  expect(announced()).toEqual(["No updates match: Story, out of 1 loaded"]);
  expect(region!.textContent).toBe("No updates match: Story, out of 1 loaded");

  fireEvent.click(screen.getByRole("button", { name: "Show all updates" }));
  expect(announced()).toEqual([]);
});

it("names the filter, so two types with the same number of updates each get a count said", async () => {
  const [anna, other] = twoPosts();
  feed.data = [
    { ...anna, post_type: "Story" },
    { ...other, post_type: "Prayer Request" },
  ];
  render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  fireEvent.click(
    within(group).getByRole("button", { name: "Prayer request", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  const first = announced();
  expect(first).toEqual(["1 update matches: Prayer request, out of 2 loaded"]);

  fireEvent.click(
    within(group).getByRole("button", { name: "Story", exact: true }),
  );
  await waitFor(() =>
    expect(screen.getByRole("article", { name: "Field update" })).toBeTruthy(),
  );
  // Same count, different filter: the region's text changes, so it speaks.
  expect(announced()).not.toEqual(first);
  expect(announced()).toEqual(["1 update matches: Story, out of 2 loaded"]);
});

it("says a page loaded even when it brings no new match for the filter", async () => {
  feed.data = mixedPosts();
  feed.hasMore = true;
  const view = render(<DonorFeedPage />);
  const group = screen.getByRole("group", { name: "Type of update" });
  fireEvent.click(
    within(group).getByRole("button", { name: "Prayer request", exact: true }),
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  const before = announced();
  expect(before).toEqual(["1 update matches: Prayer request, out of 3 loaded"]);

  const loadMore = screen.getByRole("button", { name: "Load more updates" });
  act(() => loadMore.focus());
  fireEvent.click(loadMore);
  feed.isLoadingMore = true;
  view.rerender(<DonorFeedPage />);
  feed.isLoadingMore = false;
  feed.data = [
    ...mixedPosts(),
    { ...mixedPosts()[0], id: "capability-story-2", title: "Another story" },
  ];
  view.rerender(<DonorFeedPage />);

  // More pages remain, so focus stays on Load more; the region says the
  // page arrived, though it held no prayer request.
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Load more updates" }),
  );
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(announced()).not.toEqual(before);
  expect(announced()).toEqual([
    "1 update matches: Prayer request, out of 4 loaded",
  ]);
});
