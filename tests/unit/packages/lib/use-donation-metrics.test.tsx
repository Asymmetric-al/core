// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDonationMetrics } from "../../../../packages/lib/hooks/use-donation-metrics";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const MISSIONARY_A = "missionary-a";
const MISSIONARY_B = "missionary-b";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function midMonthIso() {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    15,
    12,
    0,
    0,
  ).toISOString();
}

function donation(amount: number) {
  return {
    id: `donation-${amount}`,
    amount,
    donation_type: "one_time" as const,
    created_at: midMonthIso(),
    status: "completed",
  };
}

function metricsUrl(missionaryId: string) {
  return `/api/missionaries/${missionaryId}/metrics`;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useDonationMetrics", () => {
  it("does not let missionary A overwrite B when A's json() resolves later", async () => {
    const jsonById = new Map<
      string,
      ReturnType<
        typeof createDeferred<{ donations: ReturnType<typeof donation>[] }>
      >
    >();

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const missionaryId =
        String(input).match(/\/api\/missionaries\/([^/]+)\/metrics/)?.[1] ?? "";
      let deferred = jsonById.get(missionaryId);
      if (!deferred) {
        deferred = createDeferred();
        jsonById.set(missionaryId, deferred);
      }
      return Promise.resolve({
        ok: true,
        json: () => deferred.promise,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ missionaryId }) => useDonationMetrics(missionaryId),
      { initialProps: { missionaryId: MISSIONARY_A } },
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(metricsUrl(MISSIONARY_A));
    });
    await act(async () => {
      await Promise.resolve();
    });

    rerender({ missionaryId: MISSIONARY_B });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(metricsUrl(MISSIONARY_B));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jsonById.get(MISSIONARY_B)?.resolve({ donations: [donation(20)] });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.thisMonth.total).toBe(20);
    });

    await act(async () => {
      jsonById.get(MISSIONARY_A)?.resolve({ donations: [donation(99)] });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.thisMonth.total).toBe(20);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
