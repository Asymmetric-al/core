/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DONOR_FEED_PAGE_SIZE,
  DONOR_FEED_POSTS_QUERY_KEY,
  useDonorFeedPostPages,
} from "../../../../packages/database/hooks/donor-feed-posts";
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

afterEach(() => {
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
});
