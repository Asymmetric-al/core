// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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
    currency: "USD",
    donation_type: "one_time" as const,
    created_at: midMonthIso(),
    status: "completed",
  };
}

function metricsUrl(missionaryId: string) {
  return `/api/missionaries/${missionaryId}/metrics?months=25`;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useDonationMetrics", () => {
  it("requests comparison history by default while keeping the chart at thirteen months", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ currency: "USD", donations: [donation(3000)] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/missionaries/missionary-a/metrics?months=25",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.monthlyBreakdown).toHaveLength(13);
    expect(result.current.thisMonth.total).toBe(3000);
  });

  it("computes loaded metrics without render-time clock reads", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 1, 12));
    const dateConstructor = Date;
    const renderClockReads: string[] = [];
    let renderingMetrics = false;

    vi.stubGlobal(
      "Date",
      new Proxy(dateConstructor, {
        construct(target, argumentsList, newTarget) {
          if (renderingMetrics && argumentsList.length === 0) {
            renderClockReads.push("new Date()");
          }
          return Reflect.construct(target, argumentsList, newTarget);
        },
        get(target, property, receiver) {
          if (property === "now") {
            return () => {
              if (renderingMetrics) renderClockReads.push("Date.now()");
              return target.now();
            };
          }
          return Reflect.get(target, property, receiver);
        },
      }),
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ currency: "USD", donations: [donation(5000)] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    function useMetrics() {
      renderingMetrics = true;
      const metrics = useDonationMetrics(MISSIONARY_A, { months: 25 });
      renderingMetrics = false;
      return metrics;
    }

    function DashboardMetricsProbe() {
      const metrics = useMetrics();
      return (
        <output aria-busy={metrics.isLoading}>
          {metrics.isLoading
            ? "Loading donation metrics"
            : metrics.thisMonth.total}
        </output>
      );
    }

    try {
      expect(renderToStaticMarkup(<DashboardMetricsProbe />)).toBe(
        '<output aria-busy="true">Loading donation metrics</output>',
      );
      expect(fetchMock).not.toHaveBeenCalled();
      const { result } = renderHook(useMetrics);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.thisMonth.total).toBeNull();
      expect(result.current.monthlyBreakdown).toEqual([]);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.currency).toBe("USD");
      expect(result.current.thisMonth.total).toBe(5000);
      expect(result.current.monthlyBreakdown.at(-1)).toMatchObject({
        month: "Nov",
        year: 2026,
        total: 5000,
      });
      expect(renderClockReads).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("reports permission-limited metrics as unavailable instead of successful empty data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ donations: [], limited: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(fetchMock).toHaveBeenCalledWith(
      metricsUrl(MISSIONARY_A),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "Donation metrics are unavailable.",
    );
  });

  it.each([
    { label: "without a limited flag", payload: { donations: [] } },
    { label: "with limited false", payload: { donations: [], limited: false } },
  ])("keeps genuine successful empty data $label", async ({ payload }) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload }),
    );

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.thisMonth.total).toBeNull();
    expect(result.current.currency).toBeNull();
    expect(result.current.monthlyBreakdown).toEqual([]);
  });

  it("keeps an explicit API error ahead of the limited flag", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          currency: "USD",
          donations: [],
          limited: true,
          error: "Existing API error",
        }),
      }),
    );

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error?.message).toBe("Existing API error");
  });

  it("preserves HTTP failure handling before consuming a limited response body", async () => {
    const json = vi.fn().mockResolvedValue({ donations: [], limited: true });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403, json }),
    );

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error?.message).toBe("HTTP error! status: 403");
    expect(json).not.toHaveBeenCalled();
  });

  it("does not let a late limited response for A poison B's successful data", async () => {
    const lateLimited = createDeferred<{ donations: []; limited: true }>();
    const readLateLimited = vi.fn(() => lateLimited.promise);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: readLateLimited })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currency: "USD", donations: [donation(20)] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ missionaryId }) => useDonationMetrics(missionaryId),
      { initialProps: { missionaryId: MISSIONARY_A } },
    );
    await waitFor(() => expect(readLateLimited).toHaveBeenCalled());
    rerender({ missionaryId: MISSIONARY_B });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.thisMonth.total).toBe(20);
    });

    await act(async () => {
      lateLimited.resolve({ donations: [], limited: true });
      await lateLimited.promise;
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      metricsUrl(MISSIONARY_A),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      metricsUrl(MISSIONARY_B),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.error).toBeNull();
    expect(result.current.thisMonth.total).toBe(20);
    expect(result.current.isLoading).toBe(false);
  });

  it("does not let missionary A overwrite B when A's json() resolves later", async () => {
    const jsonById = new Map<
      string,
      ReturnType<
        typeof createDeferred<{
          currency: string;
          donations: ReturnType<typeof donation>[];
        }>
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
      expect(fetchMock).toHaveBeenCalledWith(
        metricsUrl(MISSIONARY_A),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    rerender({ missionaryId: MISSIONARY_B });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        metricsUrl(MISSIONARY_B),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jsonById
        .get(MISSIONARY_B)
        ?.resolve({ currency: "USD", donations: [donation(20)] });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.thisMonth.total).toBe(20);
    });

    await act(async () => {
      jsonById
        .get(MISSIONARY_A)
        ?.resolve({ currency: "USD", donations: [donation(99)] });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.thisMonth.total).toBe(20);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe("donation metrics request cancellation", () => {
  it("aborts replaced and unmounted requests without publishing abort errors", async () => {
    const signals: Array<AbortSignal | null | undefined> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        signals.push(init?.signal);
        return new Promise<Response>((_resolve, reject) =>
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        );
      }),
    );
    const { result, rerender, unmount } = renderHook(
      ({ id }) => useDonationMetrics(id),
      { initialProps: { id: MISSIONARY_A } },
    );
    await waitFor(() => expect(signals).toHaveLength(1));
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    rerender({ id: MISSIONARY_B });
    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(result.current.error).toBeNull();
    unmount();
    expect(signals[1]?.aborted).toBe(true);
  });
});

describe("donation metrics period change", () => {
  // A percentage needs a prior amount. With no gifts in the prior period the
  // change is unknown (null), not "+100%".
  it("reports no change figure when the prior period had no gifts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ currency: "USD", donations: [donation(5000)] }),
      }),
    );

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.thisMonth.total).toBe(5000);
    expect(result.current.thisMonth.change).toBeNull();
    expect(result.current.thisMonth.trend).toBe("neutral");
    // Last month had no gifts and neither did the month before it.
    expect(result.current.lastMonth.change).toBeNull();
  });
});

describe("donation metrics period windows", () => {
  function giftAt(id: string, date: Date, amount: number) {
    return {
      id,
      amount,
      currency: "USD",
      donation_type: "one_time" as const,
      created_at: date.toISOString(),
      status: "completed",
    };
  }

  function serve(donations: unknown[]) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ currency: "USD", donations }),
      }),
    );
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps date-only gifts and all periods on the post-mount calendar until retry", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 1, 12));
    const donations = [
      {
        ...giftAt("nov-1", new Date(2026, 11, 2, 12), 2000),
        gift_date: "2026-11-01",
      },
      {
        ...giftAt("oct-31", new Date(2026, 10, 3, 12), 7500),
        gift_date: "2026-10-31",
      },
    ];
    const response = createDeferred<{
      currency: string;
      donations: typeof donations;
    }>();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => response.promise })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ currency: "USD", donations }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useDonationMetrics(MISSIONARY_A, { months: 25 }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.thisMonth.total).toBeNull();
    expect(result.current.monthlyBreakdown).toEqual([]);

    vi.setSystemTime(new Date(2026, 11, 1, 12));
    await act(async () => {
      response.resolve({ currency: "USD", donations });
      await response.promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.thisMonth.total).toBe(2000);
    expect(result.current.lastMonth.total).toBe(7500);
    expect(result.current.yearToDate.total).toBe(9500);
    expect(result.current.thisMonth.data[0]).toEqual({
      date: "2026-11-01",
      value: 2000,
    });
    expect(result.current.lastMonth.data.at(-1)).toEqual({
      date: "2026-10-31",
      value: 7500,
    });
    expect(result.current.monthlyBreakdown.at(-1)).toMatchObject({
      month: "Nov",
      year: 2026,
      total: 2000,
    });
    expect(result.current.gifts[0]?.date).toBe(
      new Date(2026, 10, 1).toISOString(),
    );

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.thisMonth.total).toBe(0);
    expect(result.current.lastMonth.total).toBe(2000);
    expect(result.current.monthlyBreakdown.at(-1)).toMatchObject({
      month: "Dec",
      year: 2026,
      total: 0,
    });
  });

  it("counts a gift made during the last day of a month in that month", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 12));
    serve([giftAt("oct-31", new Date(2026, 9, 31, 15), 5000)]);

    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lastMonth.total).toBe(5000);
    expect(result.current.lastMonth.data.at(-1)).toEqual({
      date: "2026-10-31",
      value: 5000,
    });
  });

  // The metrics API returns 13 months of gifts, which never covers all of last
  // year's year-to-date window after January. A partial prior total would
  // produce a wrong percentage, so no comparison is reported instead.
  it("reports no year-to-date comparison when last year's window predates the history", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 9, 12));
    serve([
      giftAt("prior", new Date(2025, 9, 20, 12), 4000),
      giftAt("current", new Date(2026, 2, 1, 12), 9000),
    ]);

    const { result } = renderHook(() =>
      useDonationMetrics(MISSIONARY_A, { months: 13 }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.yearToDate.total).toBe(9000);
    expect(result.current.yearToDate.change).toBeNull();
  });
});

describe("donation metrics gift dates", () => {
  // An offline or imported gift is entered after the day it was given; the
  // gift date, not the entry date, decides its month.
  it("counts a gift in the month of its gift date", async () => {
    const now = new Date();
    const earlier = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const giftDate = `${earlier.getFullYear()}-${String(earlier.getMonth() + 1).padStart(2, "0")}-01`;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          currency: "USD",
          donations: [
            {
              id: "offline-1",
              amount: 7500,
              currency: "USD",
              donation_type: "offline",
              created_at: midMonthIso(),
              gift_date: giftDate,
              status: "completed",
            },
          ],
        }),
      }),
    );
    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const gift = result.current.gifts?.[0];
    const when = new Date(gift!.date);
    expect([when.getFullYear(), when.getMonth(), when.getDate()]).toEqual([
      earlier.getFullYear(),
      earlier.getMonth(),
      1,
    ]);
    expect(result.current.thisMonth.total).toBe(0);
  });
});

describe("donation metrics currency", () => {
  function giftOn(id: string, date: Date, currency: string, amount: number) {
    return {
      id,
      amount,
      currency,
      donation_type: "one_time" as const,
      created_at: date.toISOString(),
      status: "completed",
    };
  }

  function serve(donations: unknown[], currency: string | null) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ currency, donations }),
      }),
    );
  }

  it("qualifies money over the periods it shows, not every fetched gift", async () => {
    const now = new Date();
    // Fetched for the 25-month comparison window but older than any period
    // the dashboard shows; the API reports no single currency for the fetch.
    serve(
      [
        giftOn(
          "old",
          new Date(now.getFullYear(), now.getMonth() - 24, 15),
          "EUR",
          900,
        ),
        giftOn(
          "now",
          new Date(now.getFullYear(), now.getMonth(), 1, 12),
          "USD",
          5000,
        ),
      ],
      null,
    );
    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currency).toBe("USD");
    expect(result.current.thisMonth.total).toBe(5000);
  });

  it("still withholds totals when the shown periods mix currencies", async () => {
    const now = new Date();
    serve(
      [
        giftOn(
          "eur",
          new Date(now.getFullYear(), now.getMonth() - 2, 15),
          "EUR",
          900,
        ),
        giftOn(
          "usd",
          new Date(now.getFullYear(), now.getMonth(), 1, 12),
          "USD",
          5000,
        ),
      ],
      null,
    );
    const { result } = renderHook(() => useDonationMetrics(MISSIONARY_A));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currency).toBeNull();
    expect(result.current.thisMonth.total).toBeNull();
  });
});
