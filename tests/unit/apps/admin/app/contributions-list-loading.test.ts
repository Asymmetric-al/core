// @vitest-environment jsdom

import { getQueryClient, QueryProvider } from "@asym/database/providers";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeMobileContribution } from "./contribution-mobile-fixture";
// eslint-disable-next-line no-restricted-imports -- AL-1894: App loader regression test at its module boundary.
import {
  ADMIN_CONTRIBUTIONS_LOAD_CEILING,
  ADMIN_CONTRIBUTIONS_PAGE_SIZE,
  useAdminContributions,
} from "../../../../../apps/admin/app/(app)/contributions/use-admin-contributions";

import type { AdminContributionsListResponse } from "@asym/api/admin/contributions/types";

function page(
  ids: string[],
  next: { hasMore: boolean; nextCursor: string | null },
): AdminContributionsListResponse {
  return {
    rows: ids.map((id) => makeMobileContribution({ id })),
    nextCursor: next.nextCursor,
    hasMore: next.hasMore,
    limit: ADMIN_CONTRIBUTIONS_PAGE_SIZE,
    sort: { field: "giftDate", direction: "desc" },
    filters: {
      statuses: [],
      contributionTypes: [],
      paymentMethods: [],
      sources: [],
      fundIds: [],
      missionaryIds: [],
      receiptStatuses: [],
      anonymousOnly: false,
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
    },
  };
}

function okJson(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response;
}

function failedJson(body: unknown) {
  return { ok: false, json: async () => body } as unknown as Response;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

function renderListHook() {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryProvider, null, children);
  return renderHook(() => useAdminContributions(), { wrapper });
}

function requestedUrl(callIndex: number) {
  return new URL(String(fetchMock.mock.calls[callIndex]![0]), "http://x");
}

describe("useAdminContributions", () => {
  it("shows the newest page at once and keeps loading older gifts through the cursor", async () => {
    let releaseOlder: (response: Response) => void = () => undefined;
    fetchMock
      .mockResolvedValueOnce(
        okJson(page(["g1", "g2"], { hasMore: true, nextCursor: "cursor-2" })),
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            releaseOlder = resolve;
          }),
      );

    const { result } = renderListHook();

    await waitFor(() =>
      expect(result.current.data?.map((row) => row.id)).toEqual(["g1", "g2"]),
    );
    expect(result.current.isPending).toBe(false);
    expect(result.current.isLoadingOlder).toBe(true);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    releaseOlder(okJson(page(["g3"], { hasMore: false, nextCursor: null })));

    await waitFor(() =>
      expect(result.current.data?.map((row) => row.id)).toEqual([
        "g1",
        "g2",
        "g3",
      ]),
    );
    expect(result.current.isLoadingOlder).toBe(false);
    expect(requestedUrl(0).pathname).toBe("/api/admin/contributions");
    expect(requestedUrl(0).searchParams.get("limit")).toBe(
      String(ADMIN_CONTRIBUTIONS_PAGE_SIZE),
    );
    expect(requestedUrl(0).searchParams.get("after")).toBeNull();
    expect(requestedUrl(1).searchParams.get("after")).toBe("cursor-2");
  });

  it("never duplicates a gift that appears on two pages", async () => {
    fetchMock
      .mockResolvedValueOnce(
        okJson(page(["g1", "g2"], { hasMore: true, nextCursor: "c2" })),
      )
      .mockResolvedValueOnce(
        okJson(page(["g2", "g3"], { hasMore: false, nextCursor: null })),
      );

    const { result } = renderListHook();

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    await waitFor(() => expect(result.current.isLoadingOlder).toBe(false));
    expect(result.current.data?.map((row) => row.id)).toEqual([
      "g1",
      "g2",
      "g3",
    ]);
  });

  it("stops at the load ceiling instead of paging forever", async () => {
    let call = 0;
    fetchMock.mockImplementation(async () => {
      call += 1;
      const ids = Array.from(
        { length: ADMIN_CONTRIBUTIONS_PAGE_SIZE },
        (_, index) => `p${call}-${index}`,
      );
      return okJson(page(ids, { hasMore: true, nextCursor: `c${call}` }));
    });

    const { result } = renderListHook();

    await waitFor(
      () =>
        expect(result.current.data).toHaveLength(
          ADMIN_CONTRIBUTIONS_LOAD_CEILING,
        ),
      { timeout: 10_000 },
    );
    await waitFor(() => expect(result.current.isLoadingOlder).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(
      ADMIN_CONTRIBUTIONS_LOAD_CEILING / ADMIN_CONTRIBUTIONS_PAGE_SIZE,
    );
  });

  it("stops when the server repeats a cursor", async () => {
    fetchMock.mockResolvedValue(
      okJson(page(["g1"], { hasMore: true, nextCursor: "same" })),
    );

    const { result } = renderListHook();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoadingOlder).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.data?.map((row) => row.id)).toEqual(["g1"]);
  });

  it("surfaces the server error message when the first page fails", async () => {
    fetchMock.mockResolvedValue(
      failedJson({ error: "Contributions are unavailable." }),
    );

    const { result } = renderListHook();

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5_000,
    });
    expect(result.current.error?.message).toBe(
      "Contributions are unavailable.",
    );
    expect(result.current.data).toBeUndefined();
    expect(result.current.loadIssue).toBeNull();
    expect(result.current.isLoadingOlder).toBe(false);
  });

  it("keeps the gifts already shown when an older page fails, and retries that page", async () => {
    fetchMock
      .mockResolvedValueOnce(
        okJson(page(["g1", "g2"], { hasMore: true, nextCursor: "c2" })),
      )
      // The page is retried once before the failure is reported.
      .mockResolvedValueOnce(failedJson({ error: "Gateway timeout" }))
      .mockResolvedValueOnce(failedJson({ error: "Gateway timeout" }));

    const { result } = renderListHook();

    await waitFor(() => expect(result.current.loadIssue).not.toBeNull(), {
      timeout: 5_000,
    });
    // An older page failing is not a failed workspace.
    expect(result.current.isError).toBe(false);
    expect(result.current.data?.map((row) => row.id)).toEqual(["g1", "g2"]);
    expect(result.current.loadIssue?.kind).toBe("older");
    expect(result.current.loadIssue?.message).toBe("Gateway timeout");
    expect(result.current.isLoadingOlder).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    fetchMock.mockResolvedValueOnce(
      okJson(page(["g3"], { hasMore: false, nextCursor: null })),
    );
    act(() => result.current.loadIssue?.onRetry());

    await waitFor(() =>
      expect(result.current.data?.map((row) => row.id)).toEqual([
        "g1",
        "g2",
        "g3",
      ]),
    );
    expect(result.current.loadIssue).toBeNull();
    // Retry asks for the failed page only, not the whole list again.
    expect(requestedUrl(3).searchParams.get("after")).toBe("c2");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("keeps the last loaded gifts when a refresh fails", async () => {
    fetchMock.mockResolvedValueOnce(
      okJson(page(["g1", "g2"], { hasMore: false, nextCursor: null })),
    );

    const { result } = renderListHook();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    fetchMock.mockResolvedValue(failedJson({ error: "Gateway timeout" }));
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(
      () => expect(result.current.loadIssue?.kind).toBe("refresh"),
      {
        timeout: 5_000,
      },
    );
    expect(result.current.isError).toBe(false);
    expect(result.current.data?.map((row) => row.id)).toEqual(["g1", "g2"]);
  });
});
