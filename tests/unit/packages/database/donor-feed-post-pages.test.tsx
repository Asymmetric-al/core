/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DONOR_FEED_PAGE_SIZE,
  DONOR_FEED_POSTS_QUERY_KEY,
  useDonorFeedPostPages,
  useDonorFeedPosts,
} from "../../../../packages/database/hooks/donor-feed-posts";
import { onlineManager } from "../../../../packages/database/node_modules/@tanstack/react-query/build/modern/index.js";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

const post = (id: number) => ({ id: `post-${id}` });

function respondWith(pages: Array<Array<{ id: string }>>) {
  const fetchMock = vi.fn(async (url: string) => {
    const offset = Number(
      new URL(url, "http://local").searchParams.get("offset") ?? 0,
    );
    const page = pages[offset / DONOR_FEED_PAGE_SIZE] ?? [];
    return new Response(JSON.stringify({ posts: page }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderPages() {
  return renderHook(() => useDonorFeedPostPages(), {
    wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
  });
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

afterEach(() => {
  cleanup();
  setOnline(true);
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("useDonorFeedPostPages", () => {
  it("loads the next page from where the last one ended, until a short page", async () => {
    const full = Array.from({ length: DONOR_FEED_PAGE_SIZE }, (_, i) =>
      post(i),
    );
    const fetchMock = respondWith([full, [post(100), post(101)]]);
    const { result } = renderPages();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(DONOR_FEED_PAGE_SIZE);
    // A full page may not be the end.
    expect(result.current.hasMore).toBe(true);
    const first = new URL(fetchMock.mock.calls[0]![0], "http://local");
    expect(first.searchParams.get("limit")).toBe(String(DONOR_FEED_PAGE_SIZE));
    expect(first.searchParams.get("offset")).toBeNull();

    act(() => result.current.loadMore());
    await waitFor(() =>
      expect(result.current.data).toHaveLength(DONOR_FEED_PAGE_SIZE + 2),
    );
    const second = new URL(fetchMock.mock.calls[1]![0], "http://local");
    expect(second.searchParams.get("offset")).toBe(
      String(DONOR_FEED_PAGE_SIZE),
    );
    // A short page is the end of the feed.
    expect(result.current.hasMore).toBe(false);
  });

  it("shows an update once when one published between pages pushes it onto the next page", async () => {
    const full = Array.from({ length: DONOR_FEED_PAGE_SIZE }, (_, i) =>
      post(i),
    );
    const last = full.at(-1)!;
    // Newest first, by offset: an update published after the first page
    // loaded moves that page's last update to the start of the next one.
    respondWith([full, [last, post(100)]]);
    const { result } = renderPages();
    await waitFor(() =>
      expect(result.current.data).toHaveLength(DONOR_FEED_PAGE_SIZE),
    );

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
    expect(result.current.data).toEqual([...full, post(100)]);
  });

  it("knows a short first page is the whole feed", async () => {
    respondWith([[post(1)]]);
    const { result } = renderPages();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(false);
  });

  it.each([401, 403])(
    "hides cached posts after access is denied with %s",
    async (status) => {
      const client = getQueryClient();
      client.setQueryDefaults([DONOR_FEED_POSTS_QUERY_KEY], { retry: false });
      const fetchMock = respondWith([[post(1)]]);
      const { result } = renderPages();
      await waitFor(() => expect(result.current.data).toHaveLength(1));
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ error: "Denied" }), { status }),
      );
      await act(async () => {
        await client.refetchQueries({ queryKey: [DONOR_FEED_POSTS_QUERY_KEY] });
      });
      await waitFor(() =>
        expect(result.current.error).toMatchObject({ status }),
      );
      expect(result.current.data).toEqual([]);
      expect(result.current.accessDenied).toBe(true);
    },
  );

  it("retries a failed refresh even when there is no next page", async () => {
    const client = getQueryClient();
    client.setQueryDefaults([DONOR_FEED_POSTS_QUERY_KEY], { retry: false });
    const fetchMock = respondWith([[post(1)]]);
    const { result } = renderPages();
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 503 }));
    await act(async () => {
      await client.refetchQueries({ queryKey: [DONOR_FEED_POSTS_QUERY_KEY] });
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.hasMore).toBe(false);
    expect(result.current.data).toHaveLength(1);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("says a retry is waiting for a connection, neither loading nor answered", async () => {
    const client = getQueryClient();
    client.setQueryDefaults([DONOR_FEED_POSTS_QUERY_KEY], { retry: false });
    const fetchMock = respondWith([[post(1)]]);
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 503 }));
    const { result } = renderPages();
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.isPaused).toBe(false);

    // Offline, a retry with nothing cached clears the error and waits for
    // the connection without fetching.
    setOnline(false);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isPaused).toBe(true));
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // The connection returns, so the retry runs and answers.
    setOnline(true);
    await waitFor(() => expect(result.current.data).toEqual([post(1)]));
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("says a first load is pending while it waits for a connection, with nothing loaded or failed", async () => {
    const fetchMock = respondWith([[post(1)]]);
    // Offline before anything is cached, the first load waits without
    // fetching.
    setOnline(false);
    const { result } = renderPages();
    await waitFor(() => expect(result.current.isPaused).toBe(true));
    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();

    // The connection returns, so the load runs and answers.
    setOnline(true);
    await waitFor(() => expect(result.current.data).toEqual([post(1)]));
    expect(result.current.isPending).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it("does not call a loaded empty feed pending while its refresh waits for a connection", async () => {
    respondWith([[]]);
    const { result } = renderPages();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPending).toBe(false);

    setOnline(false);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isPaused).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it("says a refresh over loaded updates is fetching until it answers, through a lost connection", async () => {
    const client = getQueryClient();
    client.setQueryDefaults([DONOR_FEED_POSTS_QUERY_KEY], { retry: false });
    const fetchMock = respondWith([[post(1)]]);
    const { result } = renderPages();
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.isFetching).toBe(false);

    let answer: (response: Response) => void = () => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          answer = resolve;
        }),
    );
    // Offline, the refresh waits for the connection without fetching.
    setOnline(false);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isPaused).toBe(true));
    expect(result.current.isFetching).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Back online it runs; over loaded updates it is neither a first load
    // nor a page load, yet it has not answered.
    setOnline(true);
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      answer(
        new Response(JSON.stringify({ posts: [post(1), post(2)] }), {
          status: 200,
        }),
      );
    });
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toEqual([post(1), post(2)]);
  });
});

describe("useDonorFeedPosts", () => {
  it("can load again after a failure, resolving with the outcome", async () => {
    const client = getQueryClient();
    client.setQueryDefaults([DONOR_FEED_POSTS_QUERY_KEY], { retry: false });
    const fetchMock = respondWith([[post(1)]]);
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 503 }));
    const { result } = renderHook(() => useDonorFeedPosts({ limit: 5 }), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toEqual([]);

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.refetch();
    });
    expect(outcome).toMatchObject({ isError: false });
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.data).toEqual([post(1)]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
