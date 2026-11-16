// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from "vitest";

import type { Transaction } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/types";

const year = new Date().getFullYear();

const gift = (overrides: Partial<Transaction>): Transaction => ({
  id: "gift",
  date: `${year}-01-15T12:00:00`,
  amount: 50,
  recipient: "Jordan Hale",
  fund: null,
  type: "One-Time",
  method: "Card",
  status: "Paid",
  receiptUrl: "/api/donor/receipts/gift",
  ...overrides,
});

const fixture = vi.hoisted(() => ({ data: [] as unknown[] }));
const originalTz = process.env.TZ;

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({
    data: fixture.data,
    isLoading: false,
    isError: false,
  }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => true,
}));
// The plotted chart loads on demand; a stand-in keeps the graphic's place.
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

beforeAll(() => {
  process.env.TZ = "America/Los_Angeles";
});

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
  fixture.data = [
    gift({ id: "jan", amount: 50 }),
    gift({ id: "mar-1", date: `${year}-03-02T12:00:00`, amount: 500 }),
    gift({ id: "mar-2", date: `${year}-03-20T12:00:00`, amount: 206.67 }),
    // Not paid, so not plotted.
    gift({
      id: "apr",
      date: `${year}-04-02T12:00:00`,
      amount: 75,
      status: "Processing",
    }),
  ];
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

afterAll(() => {
  if (originalTz === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTz;
  }
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

it("gives the monthly chart a visually hidden table with every month's exact paid amount", () => {
  render(<DonorHistoryPage />);

  const table = screen.getByRole("table", {
    name: `Paid gifts by month in ${year}`,
  });
  // A table grows to fit its content whatever its width, so sr-only on the
  // table itself can widen the page on phones. A hidden wrapper clips it.
  expect(table.classList.contains("sr-only")).toBe(false);
  expect(table.parentElement?.classList.contains("sr-only")).toBe(true);
  expect(
    within(table)
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent),
  ).toEqual(["Month", "Paid"]);

  const rows = within(table).getAllByRole("row").slice(1);
  expect(rows).toHaveLength(12);
  expect(
    rows.map((row) => within(row).getByRole("rowheader").textContent),
  ).toEqual(MONTHS);
  const paid = rows.map((row) => within(row).getByRole("cell").textContent);
  expect(paid[0]).toBe("$50.00");
  expect(paid[1]).toBe("$0.00");
  expect(paid[2]).toBe("$706.67");
  expect(paid[3]).toBe("$0.00");
});

it("hides the plotted graphic from assistive tech instead of wrapping it in an image role", () => {
  render(<DonorHistoryPage />);

  expect(
    screen.queryByRole("img", { name: `Paid gifts by month in ${year}` }),
  ).toBeNull();
  expect(
    screen.getByTestId("monthly-giving-chart").closest('[aria-hidden="true"]'),
  ).not.toBeNull();
});

it("keeps the hidden chart out of the tab order", () => {
  // Recharts 3 makes the chart surface focusable by default; a focusable
  // element inside aria-hidden would be announced as nothing.
  const source = readFileSync(
    join(
      process.cwd(),
      "apps/donor/app/(dashboard)/donor-dashboard/history/monthly-giving-chart.tsx",
    ),
    "utf8",
  );
  expect(source).toMatch(/accessibilityLayer=\{false\}/);
});

it("offers no table when there is nothing to chart", () => {
  fixture.data = [];
  render(<DonorHistoryPage />);

  expect(screen.getByText(`Nothing to chart for ${year}.`)).toBeTruthy();
  expect(
    screen.queryByRole("table", { name: `Paid gifts by month in ${year}` }),
  ).toBeNull();
});

it("counts date-only New Year's gifts in the selected year", () => {
  fixture.data = [gift({ id: "new-year", date: `${year}-01-01`, amount: 10 })];
  render(<DonorHistoryPage />);

  expect(screen.getAllByText("$10.00").length).toBeGreaterThan(0);
  const table = screen.getByRole("table", {
    name: `Paid gifts by month in ${year}`,
  });
  const rows = within(table).getAllByRole("row").slice(1);
  expect(within(rows[0]!).getByRole("cell").textContent).toBe("$10.00");
});

it("keeps the year summary short on phones so the records start sooner", () => {
  render(<DonorHistoryPage />);

  const chartArea = screen
    .getByTestId("monthly-giving-chart")
    .closest('[aria-hidden="true"]')!.parentElement!;
  // A shorter chart on phones; full height from sm up.
  expect(chartArea.className).toMatch(/(^|\s)h-28(\s|$)/);
  expect(chartArea.className).toMatch(/(^|\s)sm:h-40(\s|$)/);
  // Every figure is still there.
  expect(screen.getByText("$756.67")).toBeTruthy();
  expect(screen.getByText(/Not counted: 1 processing/)).toBeTruthy();
});

it("says so in the table when a year has no months to list", async () => {
  const { MonthlyGivingTable } = await import(
    // eslint-disable-next-line no-restricted-imports -- AL-1931: The real hidden chart table at its app boundary.
    "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/monthly-giving-table"
  );
  render(
    <MonthlyGivingTable
      caption="Paid gifts by month in 2026"
      year="2026"
      data={[]}
    />,
  );
  const table = screen.getByRole("table", {
    name: "Paid gifts by month in 2026",
  });
  expect(within(table).getByRole("cell").textContent).toBe("No gifts in 2026.");
});
