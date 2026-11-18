// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const thisYear = new Date().getFullYear();
const gift = (id: string, recipient: string, month: number) => ({
  id,
  date: `${thisYear}-${String(month).padStart(2, "0")}-10T10:00:00`,
  amount: 50,
  recipient,
  fund: null,
  type: "One-Time" as const,
  method: "Card",
  status: "Paid" as const,
  receiptUrl: "#",
});
const transactions = [
  gift("TX-1", "Jordan Hale", 1),
  gift("TX-2", "Jordan Hale", 2),
  gift("TX-3", "Field Team 1", 3),
  gift("TX-4", "Nairobi Water Wells", 4),
];

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({
    data: transactions,
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

/** What the page's polite live regions currently say. */
function announced() {
  return screen
    .queryAllByRole("status")
    .map((status) => status.textContent?.trim() ?? "")
    .filter(Boolean);
}

it("says how many gifts match while a search narrows the list, from one region present from the start", () => {
  render(<DonorHistoryPage />);
  const atFirstPaint = screen.getAllByRole("status");
  expect(announced()).toEqual([]);

  const search = screen.getByRole("textbox", { name: "Search giving history" });
  fireEvent.change(search, { target: { value: "jordan" } });
  expect(announced()).toEqual([`2 gifts match in ${thisYear}`]);
  const region = screen
    .getAllByRole("status")
    .find((status) => status.textContent === `2 gifts match in ${thisYear}`);
  expect(atFirstPaint).toContain(region);

  fireEvent.change(search, { target: { value: "nairobi" } });
  expect(announced()).toEqual([`1 gift matches in ${thisYear}`]);

  // No results is said once, by the same region, not again by the empty state.
  fireEvent.change(search, { target: { value: "nothing like this" } });
  expect(
    screen.getByText("Try another search, or clear the filters."),
  ).toBeTruthy();
  expect(announced()).toEqual([`No gifts match in ${thisYear}`]);
  expect(region!.textContent).toBe(`No gifts match in ${thisYear}`);

  fireEvent.change(search, { target: { value: "" } });
  expect(announced()).toEqual([]);
});

it.each([
  ["Failed", `No gifts match in ${thisYear}: Failed`],
  ["Paid", `4 gifts match in ${thisYear}: Paid`],
])("counts the gifts the %s status filter leaves", async (choice, said) => {
  render(<DonorHistoryPage />);
  fireEvent.click(screen.getByRole("button", { name: "Status: All statuses" }));
  fireEvent.click(await screen.findByRole("menuitemradio", { name: choice }));
  await screen.findByRole("button", { name: `Status: ${choice}` });
  expect(announced()).toEqual([said]);
});

it("names the filters, so two choices that leave the same count each get it said", async () => {
  render(<DonorHistoryPage />);
  fireEvent.click(screen.getByRole("button", { name: "Status: All statuses" }));
  fireEvent.click(await screen.findByRole("menuitemradio", { name: "Failed" }));
  await screen.findByRole("button", { name: "Status: Failed" });
  const region = screen
    .getAllByRole("status")
    .find((status) => status.textContent?.startsWith("No gifts match"))!;
  const before = region.textContent;
  expect(before).toBe(`No gifts match in ${thisYear}: Failed`);

  // A radio item keeps the menu open, so the next choice is one click away.
  fireEvent.click(
    await screen.findByRole("menuitemradio", { name: "Refunded" }),
  );
  await screen.findByRole("button", { name: "Status: Refunded" });
  expect(region.textContent).not.toBe(before);
  expect(region.textContent).toBe(`No gifts match in ${thisYear}: Refunded`);
});
