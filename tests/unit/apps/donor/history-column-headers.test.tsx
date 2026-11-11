// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { Transaction } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/types";

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
vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({ data: [], isLoading: false }),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor history table at its app boundary.
import { HistoryTransactionsCard } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";

const transactions: Transaction[] = [
  {
    id: "gift-1",
    date: "2026-02-05T12:00:00Z",
    amount: 30,
    recipient: "Jordan Hale",
    fund: null,
    type: "Recurring",
    method: "Card",
    status: "Paid",
    receiptUrl: "/api/donor/receipts/gift-1",
  },
];

beforeEach(() => {
  // Desktop: the table, not the phone cards.
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

it("writes the history column headers in sentence case like the rest of the portal", async () => {
  render(<HistoryTransactionsCard filteredTransactions={transactions} />);
  const headers = await screen.findAllByRole("columnheader");
  const head = headers[0]!.closest("thead")!;

  expect(head.querySelector(".uppercase")).toBeNull();
  expect(
    headers
      .map((header) => header.textContent?.trim())
      .filter((text) => text && text !== "Receipt"),
  ).toEqual(["Date", "Gift to", "Fund", "Amount", "Payment", "Status"]);
});

it("names each sort control by its column and says how it is sorted", async () => {
  render(<HistoryTransactionsCard filteredTransactions={transactions} />);
  await screen.findAllByRole("columnheader");

  const amount = screen.getByRole("button", { name: "Amount" });
  fireEvent.click(amount);
  expect(
    screen.getByRole("button", { name: /^Amount, sorted (de|a)scending$/ }),
  ).toBe(amount);

  const date = screen.getByRole("button", { name: "Date" });
  expect(within(date.closest("th")!).getByText("Date")).toBeTruthy();
});
