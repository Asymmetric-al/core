import { describe, expect, it, vi } from "vitest";

import { fetchDonorDashboardBootstrap } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/use-donor-dashboard-bootstrap";

describe("fetchDonorDashboardBootstrap", () => {
  it("resolves after delay when not aborted", async () => {
    vi.useFakeTimers();
    const p = fetchDonorDashboardBootstrap({ delayMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it("resolves (does not reject) when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchDonorDashboardBootstrap({ delayMs: 50, signal: controller.signal }),
    ).resolves.toBeUndefined();
  });

  it("resolves when aborted before the delay completes", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const p = fetchDonorDashboardBootstrap({
      delayMs: 10_000,
      signal: controller.signal,
    });
    controller.abort();
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
