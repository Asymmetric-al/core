/** @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  UNREVIEWED_WORKERS_COUNT_QUERY_KEY,
  useUnreviewedWorkersCount,
} from "../../../../packages/database/hooks/workers-review";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

const fetchMock = vi.fn();

beforeEach(() => {
  getQueryClient().clear();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe("AL-2678 r2b1: useUnreviewedWorkersCount", () => {
  it("reads the count route, keeps it under the workers' key so every command refreshes it, and refetches on focus with no stale time", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ count: 4 }),
    });
    const { result } = renderHook(() => useUnreviewedWorkersCount(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe(4));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/admin/workers/unreviewed-count",
    );
    expect(UNREVIEWED_WORKERS_COUNT_QUERY_KEY.slice(0, 2)).toEqual([
      "admin",
      "workers",
    ]);
    const query = getQueryClient()
      .getQueryCache()
      .find({ queryKey: UNREVIEWED_WORKERS_COUNT_QUERY_KEY });
    expect(query?.options).toMatchObject({
      staleTime: 0,
      refetchOnWindowFocus: true,
    });
  });

  it.each([
    [{ ok: false, status: 500, json: async () => ({ error: "x" }) }],
    [{ ok: true, status: 200, json: async () => ({ count: null }) }],
    [{ ok: true, status: 200, json: async () => ({}) }],
  ])("fails, never reading as 0, on %#", async (response) => {
    fetchMock.mockResolvedValue(response);
    const { result } = renderHook(() => useUnreviewedWorkersCount(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
