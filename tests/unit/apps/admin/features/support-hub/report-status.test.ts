// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report status regression.
import { useReportStatus } from "../../../../../../apps/admin/features/support-hub/lib/report-status";

describe("report readiness", () => {
  it("retries only failed dependencies and never treats failures as ready zero series", async () => {
    const failed = vi.fn(async () => ({ isError: false })),
      ready = vi.fn();
    const { result } = renderHook(() =>
      useReportStatus([
        { isError: true, isReady: false, refetch: failed },
        { isReady: true, refetch: ready },
      ]),
    );
    expect(result.current.isError).toBe(true);
    await act(async () => result.current.retry());
    expect(failed).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
  });
  it("waits for all dependencies but accepts successful zero totals", () => {
    expect(
      renderHook(() => useReportStatus([{ isReady: true }, { isReady: false }]))
        .result.current.isLoading,
    ).toBe(true);
    expect(
      renderHook(() => useReportStatus([{ isReady: true }])).result.current
        .isLoading,
    ).toBe(false);
  });
  it("reports a retry as running until its refetches settle and ignores presses meanwhile", async () => {
    let settle: (value: unknown) => void = () => {};
    const refetch = vi.fn(
      () =>
        new Promise((resolve) => {
          settle = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useReportStatus([{ isError: true, refetch }]),
    );
    act(() => result.current.retry());
    expect(result.current.isRetrying).toBe(true);
    act(() => result.current.retry());
    expect(refetch).toHaveBeenCalledOnce();
    await act(async () => settle([{ isError: false }]));
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.failedRetries).toBe(0);
  });
  // useSupportReport's refetch resolves Promise.all's array of results;
  // useSupportTeams' resolves the one query result.
  it.each([
    [
      "an array holding a failed result",
      async () => [{ isError: false }, { isError: true }],
    ],
    ["a failed query result", async () => ({ isError: true })],
    ["a rejection", async () => Promise.reject(new Error("offline"))],
  ])(
    "counts a retry whose refetch resolves %s as failed",
    async (_, refetch) => {
      const { result } = renderHook(() =>
        useReportStatus([{ isError: true, refetch }]),
      );
      await act(async () => result.current.retry());
      expect(result.current.isRetrying).toBe(false);
      expect(result.current.failedRetries).toBe(1);
      await act(async () => result.current.retry());
      expect(result.current.failedRetries).toBe(2);
    },
  );
});
