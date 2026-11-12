/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import MemberCareDashboardPage from "../../../../../../apps/admin/app/(app)/care/page-client";

const { dashboard } = vi.hoisted(() => ({ dashboard: vi.fn() }));
vi.mock("@asym/database/hooks", () => ({
  useCareDashboard: dashboard,
}));
afterEach(cleanup);

it("offers one retry for the shared overview and chart request", () => {
  const refetch = vi.fn();
  dashboard.mockReturnValue({ isLoading: false, isError: true, refetch });
  render(<MemberCareDashboardPage />);
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(refetch).toHaveBeenCalledOnce();
  expect(screen.queryByText(/No contacts logged/)).toBeNull();
});

it("keeps the chart loading while the overview has no data", () => {
  dashboard.mockReturnValue({
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  render(<MemberCareDashboardPage />);
  expect(screen.getByRole("status").textContent).toContain(
    "Loading Contacts logged by week",
  );
  expect(screen.queryByText(/No contacts logged/)).toBeNull();
});

it("groups the weekly chart below follow-ups with a consistent card gap", () => {
  dashboard.mockReturnValue({
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    data: { personnel: [], activities: [], requirements: [], lastContacts: {} },
  });
  render(<MemberCareDashboardPage />);
  const column = screen.getByRole("region", {
    name: "Follow-up due",
  }).parentElement!;
  expect(
    column.contains(
      screen.getByRole("heading", { name: "Contacts logged by week" }),
    ),
  ).toBe(true);
  expect(column.classList.contains("gap-6")).toBe(true);
  expect(column.classList.contains("flex-col")).toBe(true);
  expect(
    column.contains(screen.getByRole("heading", { name: "Recent activity" })),
  ).toBe(false);
});
