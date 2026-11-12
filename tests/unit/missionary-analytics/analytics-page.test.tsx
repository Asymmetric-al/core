/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  metrics: vi.fn(),
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: mocks.auth,
  useDonationMetrics: mocks.metrics,
}));
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

import AnalyticsPage from "../../../apps/missionary/app/analytics/page-client";

/** A month offset from now, mid-month so time zones can't move it. */
function monthsAgo(months: number) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() - months,
    10,
    12,
  ).toISOString();
}

const gift = (
  months: number,
  amountCents: number,
  donorId: string | null,
  type: "recurring" | "one_time" | "offline" = "recurring",
) => ({
  amountCents,
  currency: "USD",
  date: monthsAgo(months),
  donorId,
  type,
  status: "completed",
});

beforeEach(() => {
  mocks.auth.mockReturnValue({ profile: { id: "m-1" }, loading: false });
  mocks.metrics.mockReturnValue({
    gifts: [
      gift(1, 10_000, "a"),
      gift(2, 10_000, "a"),
      gift(3, 5_000, "b", "one_time"),
      gift(4, 15_000, null, "offline"),
      // The year before: partners a and c.
      gift(14, 10_000, "a"),
      gift(15, 10_000, "c"),
    ],
    isLoading: false,
    error: null,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

/** Freezes only the clock, so the months the page shows are known. */
function freezeClock(date: Date) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(date);
}

/** Each body row of a table as its cells' text. */
function bodyRows(table: HTMLElement) {
  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => [...row.children].map((cell) => cell.textContent));
}

describe("missionary analytics", () => {
  it("asks for two years of gifts for the signed-in missionary", () => {
    render(<AnalyticsPage />);
    expect(mocks.metrics).toHaveBeenCalledWith("m-1");
    expect(
      screen.getByRole("heading", { level: 1, name: "Analytics" }),
    ).toBeTruthy();
    expect(
      screen.queryByText(/aren’t calculated|aren't calculated/),
    ).toBeNull();
  });

  it("states each number with a written comparison", () => {
    render(<AnalyticsPage />);
    const given = screen.getByRole("region", {
      name: "Given in the last 12 months",
    });
    expect(within(given).getByText("$400.00")).toBeTruthy();
    expect(
      within(given).getByText("Up 100% on the 12 months before ($200.00)"),
    ).toBeTruthy();

    const retention = screen.getByRole("region", {
      name: "Partners who gave again",
    });
    expect(within(retention).getByText("50%")).toBeTruthy();
    expect(
      within(retention).getByText(
        "1 of 2 partners from the year before gave again",
      ),
    ).toBeTruthy();

    const typical = screen.getByRole("region", { name: "Typical gift" });
    expect(within(typical).getByText("$100.00")).toBeTruthy();
    expect(
      within(typical).getByText("Middle of 4 gifts · average $100.00"),
    ).toBeTruthy();
  });

  it("shows how people gave as parts of the whole", () => {
    render(<AnalyticsPage />);
    const mix = screen.getByRole("region", { name: "How people gave" });
    expect(within(mix).getByText("Recurring")).toBeTruthy();
    expect(within(mix).getByText("$200.00 · 50%")).toBeTruthy();
    expect(within(mix).getByText("$50.00 · 13%")).toBeTruthy();
    expect(within(mix).getByText("$150.00 · 38%")).toBeTruthy();
    // One bar split by kind, in the same colours as the home chart.
    const bar = within(mix).getByRole("img", {
      name: "Recurring 50%, One-time 13%, Offline (cash and checks) 38%",
    });
    expect(
      [...bar.children].map((part) => part.getAttribute("data-kind")),
    ).toEqual(["recurring", "one-time", "offline"]);
    // Each part is as wide as its share of the total.
    expect(
      [...bar.children].map((part) =>
        (part as HTMLElement).style.getPropertyValue("--share"),
      ),
    ).toEqual(["50%", "12.5%", "37.5%"]);
  });

  it("shows exact amounts with cents, never rounded to whole dollars", () => {
    mocks.metrics.mockReturnValue({
      gifts: [
        gift(1, 70_667, "a"),
        gift(2, 12_345, "b", "one_time"),
        gift(14, 50_000, "a"),
      ],
      isLoading: false,
      error: null,
    });
    render(<AnalyticsPage />);
    const given = screen.getByRole("region", {
      name: "Given in the last 12 months",
    });
    expect(within(given).getByText("$830.12")).toBeTruthy();
    expect(
      within(given).getByText("Up 66% on the 12 months before ($500.00)"),
    ).toBeTruthy();
    const typical = screen.getByRole("region", { name: "Typical gift" });
    expect(within(typical).getByText("$415.06")).toBeTruthy();
    expect(
      within(typical).getByText("Middle of 2 gifts · average $415.06"),
    ).toBeTruthy();
    const mix = screen.getByRole("region", { name: "How people gave" });
    expect(within(mix).getByText("$706.67 · 85%")).toBeTruthy();
    expect(within(mix).getByText("$123.45 · 15%")).toBeTruthy();
  });

  it("gives the year-over-year chart a table of its monthly values", () => {
    freezeClock(new Date(2026, 10, 10, 12));
    mocks.metrics.mockReturnValue({
      gifts: [
        gift(1, 10_000, "a"),
        gift(2, 10_000, "a"),
        gift(3, 5_000, "b", "one_time"),
        gift(4, 15_000, null, "offline"),
        gift(14, 10_000, "a"),
        gift(15, 10_050, "c"),
      ],
      isLoading: false,
      error: null,
    });
    render(<AnalyticsPage />);
    const chart = screen.getByRole("region", {
      name: "The last 12 months beside the year before",
    });
    // The summary sentence stays as it was, with the exact amount.
    expect(
      within(chart).getByText(
        "Each month of the last 12 against the same month a year earlier. Your strongest month was Jul ($150.00).",
      ),
    ).toBeTruthy();
    // No image wrapper repeats what the table says.
    expect(within(chart).queryByRole("img")).toBeNull();
    const table = within(chart).getByRole("table", {
      name: "The last 12 months beside the year before, December 2025 to November 2026",
    });
    // A table grows to fit its content whatever its width, so sr-only on the
    // table itself can widen the page on phones. A hidden wrapper clips it.
    expect(table.classList.contains("sr-only")).toBe(false);
    expect(table.parentElement?.classList.contains("sr-only")).toBe(true);
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Month", "Last 12 months", "Year before"]);
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual([
      "December 2025",
      "January 2026",
      "February 2026",
      "March 2026",
      "April 2026",
      "May 2026",
      "June 2026",
      "July 2026",
      "August 2026",
      "September 2026",
      "October 2026",
      "November 2026",
    ]);
    expect(bodyRows(table).slice(7)).toEqual([
      ["July 2026", "$150.00", "$0.00"],
      ["August 2026", "$50.00", "$100.50"],
      ["September 2026", "$100.00", "$100.00"],
      ["October 2026", "$100.00", "$0.00"],
      ["November 2026", "$0.00", "$0.00"],
    ]);
  });

  it("names months without the year when the 12 months share one", () => {
    freezeClock(new Date(2026, 11, 10, 12));
    // Gifts are dated from the frozen clock, not the real one, so the test
    // keeps its data whatever today's date is.
    mocks.metrics.mockReturnValue({
      gifts: [gift(1, 10_000, "a"), gift(14, 10_000, "a")],
      isLoading: false,
      error: null,
    });
    render(<AnalyticsPage />);
    const table = screen.getByRole("table", {
      name: "The last 12 months beside the year before, January 2026 to December 2026",
    });
    const months = within(table)
      .getAllByRole("rowheader")
      .map((header) => header.textContent);
    expect(months[0]).toBe("January");
    expect(months.at(-1)).toBe("December");
  });

  it("says so plainly when there is no history yet", () => {
    mocks.metrics.mockReturnValue({ gifts: [], isLoading: false, error: null });
    render(<AnalyticsPage />);
    expect(
      screen.getByText("No gifts in the last 12 months yet."),
    ).toBeTruthy();
  });

  it("keeps the unauthenticated loading identity boundary", () => {
    mocks.auth.mockReturnValue({ profile: null, loading: true });
    mocks.metrics.mockReturnValue({ gifts: [], isLoading: true, error: null });
    render(<AnalyticsPage />);
    expect(mocks.metrics).toHaveBeenCalledWith("");
    expect(
      screen.getByRole("status", { name: "Loading analytics" }),
    ).toBeTruthy();
  });

  it("reports a failed load with a way forward", () => {
    mocks.metrics.mockReturnValue({
      gifts: [],
      isLoading: false,
      error: new Error("offline"),
    });
    render(<AnalyticsPage />);
    expect(screen.getByRole("alert").textContent).toContain(
      "We couldn’t load your giving history.",
    );
  });
});

describe("Analytics currency containment", () => {
  it.each(["JPY", null, "XXX"])("does not combine USD with %s", (currency) => {
    mocks.metrics.mockReturnValue({
      gifts: [
        gift(1, 70667, "a"),
        { ...gift(2, 1000, "b"), currency },
        gift(14, 1000, "a"),
      ],
      isLoading: false,
      error: null,
    });
    render(<AnalyticsPage />);
    expect(
      screen.getAllByText(/currencies are mixed or unknown/).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    expect(
      screen.getByRole("region", { name: "Given in the last 12 months" })
        .textContent,
    ).not.toMatch(/\$|Up \d|Down \d/);
    expect(
      screen.getByRole("region", { name: "Partners who gave again" })
        .textContent,
    ).toContain("100%");
  });

  it.each([
    ["JPY", 1000, "¥1,000"],
    ["BHD", 1234, "1.234"],
    ["USD", Number.MAX_SAFE_INTEGER, "$90,071,992,547,409.91"],
  ])(
    "keeps %s original units in the accessible chart table",
    (currency, amount, expected) => {
      mocks.metrics.mockReturnValue({
        gifts: [{ ...gift(1, amount, "a"), currency }],
        isLoading: false,
        error: null,
      });
      render(<AnalyticsPage />);
      expect(screen.getByRole("table").textContent).toContain(expected);
    },
  );
});
