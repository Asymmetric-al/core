// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => true,
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function MonthlyGivingChartStub() {
      return <svg data-testid="monthly-giving-chart" />;
    },
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor history page at its app boundary.
import DonorHistoryPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("names each filter menu button by its filter as well as its value", async () => {
  render(<DonorHistoryPage />);
  expect(
    screen.getByRole("button", { name: "Type: All types" }).textContent,
  ).toBe("Type");

  const status = screen.getByRole("button", { name: "Status: All statuses" });
  fireEvent.click(status);
  fireEvent.click(await screen.findByRole("menuitemradio", { name: "Paid" }));

  // The visible value stays, and the name still says which filter it is.
  const filtered = await screen.findByRole("button", { name: "Status: Paid" });
  expect(filtered.textContent).toBe("Paid");
});
