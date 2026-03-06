import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/missionary/components/dashboard-home", () => ({
  DashboardHome: function DashboardHome() {
    return null;
  },
}));

describe("admin dashboard page", () => {
  it("delegates to the shared data-backed dashboard home", async () => {
    const { default: AdminDashboardPage } = await import(
      "../../apps/admin/app/page"
    );

    const element = AdminDashboardPage();

    expect(element.type.name).toBe("DashboardHome");
  });
});
