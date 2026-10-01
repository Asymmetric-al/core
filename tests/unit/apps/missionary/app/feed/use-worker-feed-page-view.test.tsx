/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
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
