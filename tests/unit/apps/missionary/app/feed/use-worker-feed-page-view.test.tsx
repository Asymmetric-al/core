/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";

import { act, cleanup, waitFor } from "@testing-library/react";
import { renderDraftHook as renderHook } from "../../../../fixtures/retained-drafts";
import { StrictMode } from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkerFeedPageView } from "../../../../../../apps/missionary/app/feed/use-worker-feed-page-view";

import type { ReactNode } from "react";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();

function StrictModeWrapper({ children }: { children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useWorkerFeedPageView initial loads", () => {
  it("treats an HTTP error from /api/posts as a failed load instead of an empty feed", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        return jsonResponse(500, { error: "database unavailable" });
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return jsonResponse(200, { posts: [] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Could not load feed", {
        id: "worker-feed-load-error",
      }),
    );
    expect(result.current.posts).toEqual([]);
    expect(result.current.feedError).toMatch(/failed to load published posts/i);
  });

  it("treats a successful empty feed as empty without feedError", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) {
        return jsonResponse(200, { posts: [] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.posts).toEqual([]);
    expect(result.current.feedError).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("keeps last-good posts and records feedError when a refetch fails", async () => {
    const publishedPost = {
      id: "post-1",
      content: "Hello partners",
      created_at: "2026-01-01T00:00:00.000Z",
      post_type: "Update",
      status: "published",
      visibility: "public",
    };
    fetchMock
      .mockImplementationOnce(async () =>
        jsonResponse(200, { posts: [publishedPost] }),
      )
      .mockImplementationOnce(async () => jsonResponse(200, { posts: [] }))
      .mockImplementationOnce(async () => jsonResponse(200, { requests: [] }))
      .mockImplementationOnce(async () =>
        jsonResponse(500, { error: "database unavailable" }),
      );

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.posts).toEqual([publishedPost]);
    expect(result.current.feedError).toBeNull();

    await act(async () => {
      await result.current.reloadPosts();
    });

    expect(result.current.posts).toEqual([publishedPost]);
    expect(result.current.feedError).toMatch(/failed to load published posts/i);
    expect(toast.error).toHaveBeenCalledWith("Could not load feed", {
      id: "worker-feed-load-error",
    });
  });

  it("uses one stable notification for concurrent post failures in StrictMode", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) {
        return jsonResponse(500, { error: "database unavailable" });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    renderHook(() => useWorkerFeedPageView(), {
      wrapper: StrictModeWrapper,
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    const feedErrorCalls = vi
      .mocked(toast.error)
      .mock.calls.filter(([message]) => message === "Could not load feed");

    expect(feedErrorCalls.length).toBeGreaterThan(1);
    expect(
      feedErrorCalls.every(
        ([, options]) => options?.id === "worker-feed-load-error",
      ),
    ).toBe(true);
  });

  it("surfaces an HTTP error from /api/follower-requests without showing failed data", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) {
        return jsonResponse(200, { posts: [] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(503, {
          requests: [{ id: "not-a-request", error: "upstream failed" }],
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoadingRequests).toBe(false));
    expect(result.current.pendingRequests).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to fetch follower requests:",
      expect.any(Error),
    );
    expect(toast.error).toHaveBeenCalledWith(
      "Could not load follower requests",
      {
        id: "worker-feed-follower-requests-load-error",
      },
    );

    await act(async () => {});
    consoleError.mockRestore();
  });

  it("keeps a successful empty follower-request response quiet", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) {
        return jsonResponse(200, { posts: [] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoadingRequests).toBe(false));
    expect(result.current.pendingRequests).toEqual([]);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("keeps published loading visible when a pending draft request finishes during reload", async () => {
    const draft = Promise.withResolvers<Response>();
    const publishedRetry = Promise.withResolvers<Response>();
    let publishedCalls = 0;

    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        publishedCalls += 1;
        if (publishedCalls === 1) {
          return jsonResponse(500, { error: "database unavailable" });
        }
        return publishedRetry.promise;
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return draft.promise;
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.feedError).toMatch(/failed to load published posts/i);

    let reloadPromise: Promise<void> | undefined;
    await act(async () => {
      reloadPromise = result.current.reloadPosts();
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      draft.resolve(jsonResponse(200, { posts: [] }));
      await draft.promise;
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      publishedRetry.resolve(jsonResponse(200, { posts: [] }));
      await reloadPromise;
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("does not clear published loading when the initial draft request finishes first", async () => {
    const published = Promise.withResolvers<Response>();

    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        return published.promise;
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return jsonResponse(200, {
          posts: [{ id: "draft-1", status: "draft" }],
        });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());

    await waitFor(() =>
      expect(result.current.drafts).toEqual([
        { id: "draft-1", status: "draft" },
      ]),
    );
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      published.resolve(jsonResponse(200, { posts: [] }));
      await published.promise;
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("keeps initial feed loads inside the effect so set-state-in-effect stays clean", () => {
    const source = readFileSync(
      "apps/missionary/app/feed/use-worker-feed-page-view.ts",
      "utf8",
    );

    expect(source).toContain("const loadInitialPosts = async");
    expect(source).toContain("const loadInitialFollowerRequests = async");
    expect(source).not.toMatch(/void loadPosts\(/);
  });
});

describe("published request ownership", () => {
  it("ignores a failed reload after the feed unmounts", async () => {
    const reloadResponse = Promise.withResolvers<Response>();
    let publishedCalls = 0;
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("status=published")) {
        publishedCalls += 1;
        return publishedCalls === 1
          ? jsonResponse(200, { posts: [] })
          : reloadResponse.promise;
      }
      return jsonResponse(
        200,
        url.includes("follower-requests") ? { requests: [] } : { posts: [] },
      );
    });
    const { result, unmount } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let reload: Promise<void> | undefined;
    act(() => {
      reload = result.current.reloadPosts();
    });
    unmount();

    await act(async () => {
      reloadResponse.resolve(jsonResponse(500, { error: "obsolete failure" }));
      await reload;
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("ignores an older published response and its loading completion after a newer reload starts", async () => {
    const older = Promise.withResolvers<Response>();
    const newer = Promise.withResolvers<Response>();
    let calls = 0;
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("status=published"))
        return ++calls === 1 ? older.promise : newer.promise;
      return jsonResponse(
        200,
        url.includes("follower-requests") ? { requests: [] } : { posts: [] },
      );
    });
    const { result } = renderHook(() => useWorkerFeedPageView());
    let retry: Promise<void>;
    act(() => {
      retry = result.current.reloadPosts();
    });
    await act(async () => {
      older.resolve(jsonResponse(500, { error: "obsolete failure" }));
      await older.promise;
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.feedError).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
    await act(async () => {
      newer.resolve(jsonResponse(200, { posts: [] }));
      await retry!;
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.feedError).toBeNull();
  });

  it("keeps the latest successful posts when an older reload finishes afterward", async () => {
    const older = Promise.withResolvers<Response>();
    const newer = Promise.withResolvers<Response>();
    let calls = 0;
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("status=published")) {
        calls += 1;
        if (calls === 1) return jsonResponse(500, { error: "first failure" });
        return calls === 2 ? older.promise : newer.promise;
      }
      return jsonResponse(
        200,
        url.includes("follower-requests") ? { requests: [] } : { posts: [] },
      );
    });
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.feedError).not.toBeNull());
    let oldRetry: Promise<void>;
    let newRetry: Promise<void>;
    act(() => {
      oldRetry = result.current.reloadPosts();
    });
    expect(result.current.feedError).toBeNull();
    act(() => {
      newRetry = result.current.reloadPosts();
    });
    const newestPost = { id: "newest", content: "latest" };
    await act(async () => {
      newer.resolve(jsonResponse(200, { posts: [newestPost] }));
      await newRetry!;
    });
    await act(async () => {
      older.resolve(jsonResponse(200, { posts: [{ id: "stale" }] }));
      await oldRetry!;
    });
    expect(result.current.posts).toEqual([newestPost]);
    expect(result.current.feedError).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe("composer autosave", () => {
  const published = {
    id: "post-live",
    content: "<p>Live update</p>",
    post_type: "Update",
    visibility: "public",
    status: "published",
    media: [],
    created_at: "2026-01-29T12:00:00Z",
  };
  const draft = { ...published, id: "post-draft", status: "draft" };

  function mockFeed() {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        return jsonResponse(200, { posts: [published] });
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return jsonResponse(200, { posts: [draft] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      if (url.startsWith("/api/posts/")) {
        return jsonResponse(200, { post: draft });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
  }

  function patchCalls() {
    return fetchMock.mock.calls.filter(
      ([, init]) => (init as RequestInit | undefined)?.method === "PATCH",
    );
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  // Autosave writes status "draft". Running it while editing a published
  // update would silently unpublish it, so autosave is limited to drafts.
  it("never autosaves an edited published update as a draft", async () => {
    mockFeed();
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.posts).toHaveLength(1));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    act(() => result.current.handleEditDraft(published as never));
    act(() => result.current.setPostContent("<p>Live update, edited</p>"));
    act(() => vi.advanceTimersByTime(31_000));

    expect(patchCalls()).toEqual([]);
  });

  it("still autosaves an edited draft", async () => {
    mockFeed();
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    act(() => result.current.handleEditDraft(draft as never));
    act(() => result.current.setPostContent("<p>Draft, edited</p>"));
    await act(async () => vi.advanceTimersByTime(31_000));

    expect(patchCalls()).toHaveLength(1);
    const [url, init] = patchCalls()[0]!;
    expect(String(url)).toBe("/api/posts/post-draft");
    expect(JSON.parse(String((init as RequestInit).body)).status).toBe("draft");
  });

  it("keeps the writer editing after an autosave", async () => {
    mockFeed();
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    act(() => result.current.handleEditDraft(draft as never));
    act(() => result.current.setPostTitle("Rainy season"));
    act(() => result.current.setPostContent("<p>Draft, edited</p>"));
    await act(async () => {
      vi.advanceTimersByTime(31_000);
    });
    vi.useRealTimers();

    await waitFor(() => expect(patchCalls()).toHaveLength(1));
    await waitFor(() => expect(result.current.lastSaved).not.toBeNull());
    expect(result.current.editingPostId).toBe("post-draft");
    expect(result.current.postTitle).toBe("Rainy season");
    expect(result.current.postContent).toBe("<p>Draft, edited</p>");
  });

  it("serializes overlapping autosaves before publishing", async () => {
    mockFeed();
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));
    const finish: Array<(response: Response) => void> = [];
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input, init) => {
      if (
        init?.method === "PATCH" &&
        JSON.parse(String(init.body)).status === "draft"
      ) {
        return new Promise<Response>((resolve) => finish.push(resolve));
      }
      return base(input, init);
    });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    act(() => result.current.handleEditDraft(draft as never));
    act(() => result.current.setPostContent("<p>First edit</p>"));
    await act(async () => vi.advanceTimersByTime(31_000));
    act(() => result.current.setPostContent("<p>Latest edit</p>"));
    await act(async () => vi.advanceTimersByTime(31_000));
    expect(patchCalls()).toHaveLength(1);
    let publishing!: Promise<void>;
    act(() => {
      publishing = result.current.handlePost("published");
    });
    await act(async () => finish[0](jsonResponse(200, { post: draft })));
    expect(patchCalls()).toHaveLength(2);
    expect(JSON.parse(String(patchCalls()[1][1]?.body)).status).toBe("draft");
    await act(async () => {
      finish[1](jsonResponse(200, { post: draft }));
      await publishing;
    });
    expect(patchCalls()).toHaveLength(3);
    expect(JSON.parse(String(patchCalls()[2][1]?.body))).toMatchObject({
      status: "published",
      content: "<p>Latest edit</p>",
    });
  });

  it("waits for an old composer's autosave after unmount and remount", async () => {
    mockFeed();
    const remountDraft = {
      ...draft,
      id: "post-remount",
      updated_at: "2026-11-11T12:00:00.000Z",
    };
    let finishAutosave!: (response: Response) => void;
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input).startsWith("/api/posts?status=draft"))
        return jsonResponse(200, { posts: [remountDraft] });
      if (
        String(input) === "/api/posts/post-remount" &&
        init?.method === "PATCH"
      ) {
        if (JSON.parse(String(init.body)).status === "draft")
          return new Promise<Response>((resolve) => {
            finishAutosave = resolve;
          });
        return jsonResponse(200, {
          post: { ...remountDraft, status: "published" },
        });
      }
      return base(input, init);
    });
    const first = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(first.result.current.drafts).toHaveLength(1));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    act(() => first.result.current.handleEditDraft(remountDraft as never));
    act(() => first.result.current.setPostContent("<p>Old editor</p>"));
    await act(async () => vi.advanceTimersByTime(31_000));
    vi.useRealTimers();
    first.unmount();

    const second = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(second.result.current.drafts).toHaveLength(1));
    act(() => second.result.current.handleEditDraft(remountDraft as never));
    act(() => second.result.current.setPostContent("<p>Latest editor</p>"));
    let publishing!: Promise<void>;
    act(() => {
      publishing = second.result.current.handlePost("published");
    });
    await act(async () => {});
    expect(patchCalls()).toHaveLength(1);
    await act(async () => {
      finishAutosave(
        jsonResponse(200, {
          post: { ...remountDraft, updated_at: "2026-11-11T12:01:00.000Z" },
        }),
      );
      await publishing;
    });
    expect(patchCalls()).toHaveLength(2);
    expect(JSON.parse(String(patchCalls()[1][1]?.body))).toMatchObject({
      status: "published",
      content: "<p>Latest editor</p>",
      expected_updated_at: "2026-11-11T12:01:00.000Z",
    });
  });

  // An autosave in flight writes status "draft"; if it landed after a
  // publish it would unpublish the update, so publishing waits for it.
  it("publishes only after an autosave in flight has finished", async () => {
    mockFeed();
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));

    let finishAutosave = (_response: Response) => {};
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (input, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (init?.method === "PATCH" && body?.status === "draft") {
        return new Promise<Response>((resolve) => (finishAutosave = resolve));
      }
      return base(input, init);
    });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    act(() => result.current.handleEditDraft(draft as never));
    act(() => result.current.setPostContent("<p>Draft, edited</p>"));
    await act(async () => {
      vi.advanceTimersByTime(31_000);
    });
    vi.useRealTimers();
    await waitFor(() => expect(patchCalls()).toHaveLength(1));

    let publishing!: Promise<void>;
    act(() => {
      publishing = result.current.handlePost("published");
    });
    // The publish waits behind the autosave rather than racing it.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(patchCalls()).toHaveLength(1);

    await act(async () => {
      finishAutosave(jsonResponse(200, { post: draft }));
      await publishing;
    });
    expect(patchCalls()).toHaveLength(2);
    const last = patchCalls()[1]!;
    expect(JSON.parse(String((last[1] as RequestInit).body)).status).toBe(
      "published",
    );
  });
});

describe("saving moves a post to the list for its saved status", () => {
  const live = {
    id: "post-live",
    content: "<p>Live update</p>",
    post_type: "Update",
    visibility: "public",
    status: "published",
    media: [],
    created_at: "2026-01-29T12:00:00Z",
  };
  const draft = { ...live, id: "post-draft", status: "draft" };

  function mockSave(saved: Record<string, unknown>) {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        return jsonResponse(200, { posts: [live] });
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return jsonResponse(200, { posts: [draft] });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      if (url.startsWith("/api/posts/")) {
        return jsonResponse(200, { post: saved });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
  }

  it("moves a published update into drafts when it is saved as a draft", async () => {
    mockSave({ ...live, status: "draft", content: "<p>Back to draft</p>" });
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.posts).toHaveLength(1));

    act(() => result.current.handleEditDraft(live as never));
    act(() => result.current.setPostContent("<p>Back to draft</p>"));
    await act(() => result.current.handlePost("draft"));

    expect(result.current.posts.map((post) => post.id)).toEqual([]);
    expect(result.current.drafts.map((post) => post.id)).toEqual([
      "post-live",
      "post-draft",
    ]);
  });

  it("moves a draft into the feed when published from the Published tab", async () => {
    mockSave({ ...draft, status: "published" });
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.drafts).toHaveLength(1));

    expect(result.current.activeTab).toBe("published");
    act(() => result.current.handleEditDraft(draft as never));
    await act(() => result.current.handlePost("published"));

    expect(result.current.drafts).toEqual([]);
    expect(result.current.posts.map((post) => post.id)).toEqual([
      "post-draft",
      "post-live",
    ]);
  });
});

describe("follower requests", () => {
  const request = {
    id: "req-1",
    name: "Logan Rivera",
    status: "pending",
    created_at: "2026-11-01T10:00:00.000Z",
  };

  function serve(patchStatus: number) {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) return jsonResponse(200, { posts: [] });
      if (url.startsWith("/api/follower-requests?")) {
        return jsonResponse(200, { requests: [request] });
      }
      if (url === "/api/follower-requests/req-1" && init?.method === "PATCH") {
        return jsonResponse(
          patchStatus,
          patchStatus === 200 ? { request } : { error: "nope" },
        );
      }
      throw new Error(`unexpected fetch ${url}`);
    });
  }

  it("saves an approval on the server", async () => {
    serve(200);
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.pendingRequests).toHaveLength(1));

    await act(async () => {
      await result.current.handleResolveRequest("req-1", true);
    });

    const patch = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/follower-requests/req-1" && init?.method === "PATCH",
    );
    expect(JSON.parse(String(patch?.[1]?.body))).toEqual({
      status: "approved",
    });
    expect(result.current.pendingRequests).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith(
      "Logan Rivera can now follow your updates",
    );
  });

  it("saves a decline on the server", async () => {
    serve(200);
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.pendingRequests).toHaveLength(1));
    await act(async () => {
      await result.current.handleResolveRequest("req-1", false);
    });
    const patch = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/follower-requests/req-1" && init?.method === "PATCH",
    );
    expect(JSON.parse(String(patch?.[1]?.body))).toEqual({
      status: "rejected",
    });
  });

  it("puts the request back and says so when the server refuses", async () => {
    serve(500);
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.pendingRequests).toHaveLength(1));
    await act(async () => {
      await result.current.handleResolveRequest("req-1", true);
    });
    expect(result.current.pendingRequests).toHaveLength(1);
    expect(toast.error).toHaveBeenCalledWith(
      "Couldn’t update that request. Try again.",
    );
  });
});

describe("drafts loading", () => {
  it("reports drafts as loading until they arrive, so the tab never claims there are none", async () => {
    let releaseDrafts: (response: Response) => void = () => {};
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts?status=published")) {
        return jsonResponse(200, { posts: [] });
      }
      if (url.startsWith("/api/posts?status=draft")) {
        return new Promise<Response>((resolve) => {
          releaseDrafts = resolve;
        });
      }
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLoadingDrafts).toBe(true);

    await act(async () => {
      releaseDrafts(jsonResponse(200, { posts: [] }));
    });
    await waitFor(() => expect(result.current.isLoadingDrafts).toBe(false));
  });
});

describe("unsaved writing", () => {
  it("reports writing that would be lost by leaving the page", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/posts")) return jsonResponse(200, { posts: [] });
      if (url.startsWith("/api/follower-requests")) {
        return jsonResponse(200, { requests: [] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    const { result } = renderHook(() => useWorkerFeedPageView());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasUnsavedWriting).toBe(false);
    act(() => result.current.setPostContent("<p>Rainy season</p>"));
    expect(result.current.hasUnsavedWriting).toBe(true);
  });
});
