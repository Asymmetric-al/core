import { describe, expect, it, vi } from "vitest";

const { authMock, loadMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  loadMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({ getAuthContext: authMock }));
vi.mock("../../../../../apps/admin/app/(app)/dashboard-stats-loader", () => ({
  loadDashboardStats: loadMock,
}));

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the Reports server section at its boundary.
import { ReportsGivingTrend } from "../../../../../apps/admin/app/(app)/reports/giving-trend-section";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the Reports server section at its boundary.
import { RefreshableGivingTrendCard } from "../../../../../apps/admin/app/(app)/reports/giving-trend-refresh";

const trend = {
  periodStart: "2025-11-01T00:00:00.000Z",
  asOf: "2026-11-11T12:00:00.000Z",
  currency: null,
  currencies: [],
  months: [],
};

describe("apps/admin/app/(app)/reports/giving-trend-section", () => {
  it("loads the tenant's trend through the dashboard loader", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true, tenantId: "tenant-7" });
    loadMock.mockResolvedValue({ givingTrend: trend });

    const element = await ReportsGivingTrend();

    expect(loadMock).toHaveBeenCalledExactlyOnceWith("tenant-7");
    expect(element.type).toBe(RefreshableGivingTrendCard);
    expect(element.props).toEqual({ trend });
  });

  it("hands a failed load to the chart's error state, never an empty chart", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true, tenantId: "tenant-7" });
    loadMock.mockResolvedValue(null);

    const element = await ReportsGivingTrend();
    expect(element.props).toEqual({ trend: null });
  });

  it("reads nothing without a signed-in tenant", async () => {
    loadMock.mockClear();
    authMock.mockResolvedValue({ isAuthenticated: false, tenantId: null });

    const element = await ReportsGivingTrend();
    expect(loadMock).not.toHaveBeenCalled();
    expect(element.props).toEqual({ trend: null });
  });
});
