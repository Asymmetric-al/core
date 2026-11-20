// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { ownApiDownloadMock } = vi.hoisted(() => ({
  ownApiDownloadMock: vi.fn(async () => undefined),
}));
vi.mock("@asym/database/own-api", () => ({
  ownApiDownload: ownApiDownloadMock,
  ownApiFetch: vi.fn(),
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

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the donor history row cells at their app boundary.
import { columns } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/columns";

import type { Transaction } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/types";

afterEach(cleanup);

const monthlyGift: Transaction = {
  id: "gift-1",
  date: "2026-02-05T12:00:00Z",
  amount: 30,
  recipient: "Jordan Hale",
  fund: null,
  type: "Recurring",
  method: "Card",
  status: "Paid",
  receiptUrl: "/api/donor/receipts/gift-1",
};

function renderCell(columnId: string, transaction: Transaction) {
  const column = columns.find(
    (candidate) =>
      candidate.id === columnId ||
      ("accessorKey" in candidate && candidate.accessorKey === columnId),
  )!;
  const cell = column.cell as (context: {
    row: { original: Transaction; getValue: (key: string) => unknown };
  }) => React.ReactNode;
  const row = {
    original: transaction,
    getValue: (key: string) => transaction[key as keyof Transaction],
  };
  return render(<>{cell({ row })}</>);
}

describe("donor history rows", () => {
  it("links a monthly gift to Recurring gifts and leaves one-time gifts as text", () => {
    renderCell("recipient", monthlyGift);
    expect(
      screen.getByRole("link", { name: "Monthly gift" }).getAttribute("href"),
    ).toBe("/donor-dashboard/pledges");
    cleanup();

    renderCell("recipient", { ...monthlyGift, type: "One-Time" });
    expect(screen.getByText("One-time gift")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  // WP2b, AL-2675: the receipt route is the app's own API, so the control
  // downloads it through the own-API wrapper (a link would be a page load
  // with no tenant header). Where this read the link's href and `download`
  // attribute, it now clicks the control and reads the address downloaded.
  it("offers a receipt only for paid gifts", () => {
    renderCell("receipt", monthlyGift);
    const receipt = screen.getByRole("button", {
      // Each gift's own date and amount, so ten receipts for one partner
      // don't all read the same.
      name: "Download receipt for Jordan Hale, Feb 5, 2026, $30.00",
    });
    fireEvent.click(receipt);
    expect(ownApiDownloadMock).toHaveBeenCalledWith(
      "/api/donor/receipts/gift-1",
      {},
    );

    for (const status of ["Processing", "Failed", "Refunded"] as const) {
      cleanup();
      renderCell("receipt", { ...monthlyGift, status });
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
    }
  });

  it("names the fund, or general support when there is none", () => {
    renderCell("fund", { ...monthlyGift, fund: "Nairobi Water Wells" });
    expect(screen.getByText("Nairobi Water Wells")).toBeTruthy();
    cleanup();
    renderCell("fund", monthlyGift);
    expect(screen.getByText("General support")).toBeTruthy();
  });
});
