/** @vitest-environment jsdom */

/**
 * Behavioral test for `useAdminCrmRelationshipsGrid` query-key stability.
 *
 * Domain toggling appends/removes entries, so the raw `domains` array's order
 * depends on the toggle sequence. The hook must normalize the query key to a
 * sorted serialization so equivalent selections (people+organizations vs
 * organizations+people) share a single cache entry instead of churning the
 * cache, while the fetch itself keeps using the raw toggle order.
 *
 * The test wraps the hook in the repo's own `QueryProvider` (instead of a
 * locally imported `QueryClientProvider`) so the provider and the hook share
 * the same `@tanstack/react-query` module instance; the root `tests/`
 * directory cannot resolve that bare specifier itself.
 */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminCrmRelationshipsGrid } from "../../../../packages/database/hooks/admin-crm-relationships";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

function createFetchMock() {
  return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
    ok: true,
    json: async () => ({
      configured: true,
      missing: [],
      mode: "live",
      report: null,
      rows: [],
    }),
  }));
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

describe("useAdminCrmRelationshipsGrid query key", () => {
  it("reuses one cache entry for the same domain set regardless of toggle order", async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = getQueryClient();
    const { result } = renderHook(() => useAdminCrmRelationshipsGrid(), {
      wrapper: Wrapper,
    });

    // Initial query with no domain filters.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // ["people"]
    act(() => result.current.onDomainToggle("people"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // ["people", "organizations"]
    act(() => result.current.onDomainToggle("organizations"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    // The fetch keeps the raw toggle order; only the query key is normalized.
    const thirdRequestUrl = String(fetchMock.mock.calls[2]?.[0]);
    expect(thirdRequestUrl).toContain("domain=people&domain=organizations");

    // ["organizations"]
    act(() => result.current.onDomainToggle("people"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

    // ["organizations", "people"] — same set as step 3 in a different order.
    // The normalized key must map back to the existing fresh cache entry,
    // so no new query (and no refetch within staleTime) is created.
    act(() => result.current.onDomainToggle("people"));

    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      expect(queries).toHaveLength(4);
      expect(queries.every((query) => query.state.fetchStatus === "idle")).toBe(
        true,
      );
    });

    expect(queryClient.getQueryCache().getAll()).toHaveLength(4);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
