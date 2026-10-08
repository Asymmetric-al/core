// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { HistoryTransactionsCard } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";
import type { Transaction } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/types";
import { getDemoDonorPortalSnapshot } from "../../../../packages/api/src/donor-portal/demo-snapshot";

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({ data: [], isLoading: false }),
}));

const transactions: Transaction[] = getDemoDonorPortalSnapshot().donations.map(
  (donation) => ({
    id: donation.id,
    date: donation.date,
    amount: donation.amount,
    recipient: donation.designation.name,
    recipientAvatar: donation.designation.avatarUrl ?? undefined,
    category:
      donation.designation.type === "fund"
        ? "Project"
        : donation.designation.type === "missionary"
          ? "Missionary"
          : "General",
    type: donation.type,
    method: donation.method,
    last4: "Stripe",
    status: donation.status,
    receiptUrl: donation.receiptUrl,
  }),
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
  expect(screen.getAllByText("Succeeded")).toHaveLength(2);
  expect(screen.getByText("Processing")).toBeTruthy();
  expect(screen.getByText("Missionary")).toBeTruthy();
  expect(screen.getByText("Project")).toBeTruthy();
  expect(screen.getByText("General")).toBeTruthy();
  expect(screen.getByText("Page 1 of 1")).toBeTruthy();
});

it("keeps successful receipt and statement links bound to the same transaction without offering a processing receipt", async () => {
  installMobileMedia();
  render(<HistoryTransactionsCard filteredTransactions={transactions} />);
  const receipt = await screen.findByRole("link", {
    name: "Download receipt for Field Team 1",
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
      name: "Download receipt for General fund",
    }),
  ).toBeNull();

  const card = receipt.closest('[role="article"]');
  expect(card).toBeTruthy();
  fireEvent.click(
    within(card as HTMLElement).getByRole("button", { name: "Open actions" }),
  );
  const statement = await screen.findByRole("menuitem", {
    name: "Open Statement",
  });
  expect(statement.getAttribute("href")).toBe("/api/donor/statements/2026");
});
