/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkerFeedPageView } from "../../../../../../apps/missionary/app/feed/use-worker-feed-page-view";

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

beforeEach(() => {
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
      expect(toast.error).toHaveBeenCalledWith("Could not load feed"),
    );
    expect(result.current.posts).toEqual([]);
  });

  it("does not report an HTTP error from /api/follower-requests as pending requests", async () => {
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

    await act(async () => {});
    consoleError.mockRestore();
  });
});
