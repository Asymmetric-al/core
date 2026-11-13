import { describe, expect, it, vi } from "vitest";
import { combineReportStatus } from "../../../../../../apps/admin/features/support-hub/lib/report-status";

describe("report readiness", () => {
  it("retries only failed dependencies and never treats failures as ready zero series", () => {
    const failed = vi.fn(),
      ready = vi.fn();
    const status = combineReportStatus([
      { isError: true, isReady: false, refetch: failed },
      { isReady: true, refetch: ready },
    ]);
    expect(status.isError).toBe(true);
    status.retry();
    expect(failed).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
  });
  it("waits for all dependencies but accepts successful zero totals", () => {
    expect(
      combineReportStatus([{ isReady: true }, { isReady: false }]).isLoading,
    ).toBe(true);
    expect(combineReportStatus([{ isReady: true }]).isLoading).toBe(false);
  });
});
