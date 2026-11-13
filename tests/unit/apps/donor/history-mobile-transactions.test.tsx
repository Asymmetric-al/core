// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

import { HistoryTransactionsCard } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";
import type { Transaction } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/types";
import { getDemoDonorPortalSnapshot } from "../../../../packages/api/src/donor-portal/demo-snapshot";
import { toDonorHistoryTransaction } from "../../../../packages/database/collections/donor-history";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children?: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({ data: [], isLoading: false }),
}));

const transactions: Transaction[] = getDemoDonorPortalSnapshot().donations.map(
  toDonorHistoryTransaction,
);

function installMobileMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query === "(max-width: 767px)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("shows the actual transaction identity, formatted amount/date and status in narrow history", async () => {
  installMobileMedia();
  render(<HistoryTransactionsCard filteredTransactions={transactions} />);
  await waitFor(() =>
    expect(screen.queryByRole("region", { name: "Data table" })).toBeNull(),
  );

  expect(screen.getByText("Field Team 1")).toBeTruthy();
  expect(screen.getByText("Nairobi Water Wells")).toBeTruthy();
  expect(screen.getByText("General fund")).toBeTruthy();
  expect(screen.getByText("$125.00")).toBeTruthy();
  expect(screen.getByText("$250.00")).toBeTruthy();
  expect(screen.getByText("$100.00")).toBeTruthy();
  expect(screen.getByText("Jun 15, 2026")).toBeTruthy();
  expect(screen.getByText("Apr 22, 2026")).toBeTruthy();
  expect(screen.getByText("Feb 10, 2026")).toBeTruthy();
  expect(screen.getAllByText("Paid")).toHaveLength(2);
  expect(screen.getByText("Processing")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Monthly gift" })).toBeTruthy();
  expect(screen.getAllByText("One-time gift")).toHaveLength(2);
  expect(screen.getAllByText("General support")).toHaveLength(3);
  expect(screen.getByText("Page 1 of 1")).toBeTruthy();
});

it("keeps the receipt link bound to its paid gift and offers none for a processing gift", async () => {
  installMobileMedia();
  render(<HistoryTransactionsCard filteredTransactions={transactions} />);
  const receipt = await screen.findByRole("link", {
    name: /^Download receipt for Field Team 1, /,
  });
  expect(receipt.getAttribute("href")).toBe(transactions[0]!.receiptUrl);
  expect(receipt.hasAttribute("download")).toBe(true);
  receipt.focus();
  expect(document.activeElement).toBe(receipt);
  const activate = vi.fn((event: Event) => event.preventDefault());
  receipt.addEventListener("click", activate);
  fireEvent.click(receipt);
  expect(activate).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByRole("link", {
      name: /^Download receipt for General fund, /,
    }),
  ).toBeNull();

  // Statements live with the year summary, not on each gift.
  expect(screen.queryByRole("button", { name: "Open actions" })).toBeNull();
});

it("says a year has no gifts yet instead of blaming filters that aren't set", () => {
  installMobileMedia();
  const view = render(
    <HistoryTransactionsCard
      filteredTransactions={[]}
      filtersActive={false}
      year="2027"
    />,
  );
  expect(screen.getByRole("status").textContent).toContain(
    "No gifts in 2027 yet",
  );
  expect(screen.queryByText(/clear the filters/)).toBeNull();

  view.rerender(
    <HistoryTransactionsCard
      filteredTransactions={[]}
      filtersActive
      year="2027"
    />,
  );
  expect(screen.getByRole("status").textContent).toContain("No gifts match");
});
