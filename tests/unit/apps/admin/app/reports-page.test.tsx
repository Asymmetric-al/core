/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/"} */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// nuqs is installed in the admin workspace, not hoisted to the repo root.
import {
  NuqsTestingAdapter,
  type OnUrlUpdateFunction,
} from "../../../../../apps/admin/node_modules/nuqs/dist/adapters/testing.js";

import type { ReactElement, ReactNode } from "react";

import type { AdminCrmReportResponse } from "@asym/database/types";

const { useAdminCrmReportMock } = vi.hoisted(() => ({
  useAdminCrmReportMock: vi.fn(),
}));

vi.mock("@asym/database/hooks", async () => ({
  ...(await vi.importActual(
    "../../../../../packages/database/hooks/admin-crm-report",
  )),
  useAdminCrmReport: useAdminCrmReportMock,
}));

const repoRoot = process.cwd();
type ReportsPageComponent =
  typeof import("../../../../../apps/admin/app/(app)/reports/page-client").default;
type ReportsPageViewComponent =
  typeof import("../../../../../apps/admin/app/(app)/reports/page-client").ReportsPageView;
type DeriveReportKpis =
  typeof import("../../../../../apps/admin/app/(app)/reports/report-model").deriveReportKpis;
type DescribeReportPeriod =
  typeof import("../../../../../apps/admin/app/(app)/reports/report-model").describeReportPeriod;
type DeriveGivingByFund =
  typeof import("../../../../../apps/admin/app/(app)/reports/report-model").deriveGivingByFund;
type DeriveDonorsByFund =
  typeof import("../../../../../apps/admin/app/(app)/reports/report-model").deriveDonorsByFund;

let ReportsPage: ReportsPageComponent;
let ReportsPageView: ReportsPageViewComponent;
let deriveReportKpis: DeriveReportKpis;
let describeReportPeriod: DescribeReportPeriod;
let deriveGivingByFund: DeriveGivingByFund;
let deriveDonorsByFund: DeriveDonorsByFund;

/** Renders under a URL, as the route does, so grouping and period can live in it. */
function renderWithUrl(
  ui: ReactElement,
  searchParams = "",
  onUrlUpdate?: OnUrlUpdateFunction,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter
        hasMemory
        searchParams={searchParams}
        onUrlUpdate={onUrlUpdate}
      >
        {children}
      </NuqsTestingAdapter>
    ),
  });
}

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function createReport(
  overrides: Partial<AdminCrmReportResponse> = {},
): AdminCrmReportResponse {
  return {
    completeness: {
      complete: true,
      donationLimit: 50000,
      includedGiftCount: 35,
    },
    audit: {
      exportRequired: true,
      loggedEvents: ["actor", "tenant", "filters", "rowCount", "timestamp"],
    },
    filters: { dateFrom: null, dateTo: null, search: null },
    rows: [
      {
        amountCents: 500000,
        donorCount: 12,
        giftCount: 20,
        id: "fund_water",
        label: "Clean Water Initiative",
        lastGiftAt: "2026-06-01T00:00:00.000Z",
        metadata: {},
        status: null,
      },
      {
        amountCents: 300000,
        donorCount: 9,
        giftCount: 15,
        id: "fund_food",
        label: "Food Bank",
        lastGiftAt: null,
        metadata: {},
        status: null,
      },
    ],
    slice: "funds",
    totals: {
      amountCents: 800000,
      donorCount: 21,
      giftCount: 35,
      rowCount: 2,
    },
    ...overrides,
  };
}

const emptyReport = createReport({
  rows: [],
  totals: { amountCents: 0, donorCount: 0, giftCount: 0, rowCount: 0 },
});

describe("apps/admin/app/(app)/reports/page-client", () => {
  beforeEach(async () => {
    useAdminCrmReportMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    // Vitest owns the jsdom Window; its document getter cannot be replaced.
    document.body.replaceChildren();

    globalThis.requestAnimationFrame = (callback) =>
      window.setTimeout(callback, 0);
    globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
    Object.defineProperty(globalThis.window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    if (
      !ReportsPage ||
      !ReportsPageView ||
      !deriveReportKpis ||
      !describeReportPeriod ||
      !deriveGivingByFund ||
      !deriveDonorsByFund
    ) {
      const pageClient =
        await import("../../../../../apps/admin/app/(app)/reports/page-client");
      const reportModel =
        await import("../../../../../apps/admin/app/(app)/reports/report-model");
      ReportsPage = pageClient.default;
      ReportsPageView = pageClient.ReportsPageView;
      deriveReportKpis = reportModel.deriveReportKpis;
      describeReportPeriod = reportModel.describeReportPeriod;
      deriveGivingByFund = reportModel.deriveGivingByFund;
      deriveDonorsByFund = reportModel.deriveDonorsByFund;
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("discloses a capped report and never shows failed figures as zero", () => {
    const view = render(
      <ReportsPageView
        isLoading={false}
        isError={false}
        report={createReport({
          completeness: {
            complete: false,
            donationLimit: 50000,
            includedGiftCount: 50000,
          },
        })}
      />,
    );
    expect(view.getByRole("note").textContent).toContain(
      "only the most recent 50000 gifts",
    );
    expect(view.queryByRole("figure")).toBeNull();
    expect(
      view.getAllByText("Charts need a complete report").length,
    ).toBeGreaterThan(0);
    expect(view.getByRole("table")).toBeTruthy();
    view.rerender(<ReportsPageView isLoading={false} isError report={null} />);
    expect(view.queryByText("$0.00")).toBeNull();
  });

  it("keeps the page up when a response has no completeness, and says it can't confirm the totals", () => {
    const { completeness: _omitted, ...withoutCompleteness } = createReport();
    const view = render(
      <ReportsPageView
        isLoading={false}
        isError={false}
        report={withoutCompleteness as AdminCrmReportResponse}
      />,
    );
    expect(view.getByRole("note").textContent).toContain(
      "Couldn’t confirm that these totals include every gift in this period.",
    );
    // Figures without a known cap are still shown, but not charted as whole.
    expect(view.getByRole("table")).toBeTruthy();
    expect(
      view.getAllByText("Charts need a complete report").length,
    ).toBeGreaterThan(0);
  });

  it("shows the period by its label, not its stored key", () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport(),
      isError: false,
      isLoading: false,
      isUpdating: false,
    });
    const view = renderWithUrl(<ReportsPage />);
    const period = view.getByRole("combobox", { name: "Period" });
    expect(period.textContent).toContain("All time");
    expect(period.textContent).not.toMatch(/\ball\b/);
  });

  it("opens the grouping and period named in the URL", () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport({ slice: "donors" }),
      isError: false,
      isLoading: false,
      isUpdating: false,
    });
    const view = renderWithUrl(<ReportsPage />, "?group=donors&period=30d");
    expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("donors", {
      dateFrom: expect.any(String),
      dateTo: null,
    });
    expect(
      view.getByRole("combobox", { name: "Period" }).textContent,
    ).toContain("Last 30 days");
    const grouping = view.getByRole("group", { name: "Group by" });
    expect(
      within(grouping)
        .getByRole("button", { name: "Donor", exact: true })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("keeps a new grouping and period in the URL, so reloading or sharing keeps them", async () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport(),
      isError: false,
      isLoading: false,
      isUpdating: false,
    });
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    const view = renderWithUrl(<ReportsPage />, "", onUrlUpdate);
    fireEvent.click(
      view.getByRole("button", { name: "Missionary", exact: true }),
    );
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("group")).toBe(
        "missionaries",
      ),
    );
    fireEvent.click(view.getByRole("combobox", { name: "Period" }));
    fireEvent.keyDown(
      await view.findByRole("option", { name: "Last 90 days" }),
      { key: "Enter" },
    );
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("period")).toBe(
        "90d",
      ),
    );
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("group")).toBe(
      "missionaries",
    );
  });

  it("falls back to the default report for grouping or period values it does not know", () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport(),
      isError: false,
      isLoading: false,
      isUpdating: false,
    });
    const view = renderWithUrl(
      <ReportsPage />,
      "?group=regions&period=forever",
    );
    expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("funds", {
      dateFrom: null,
      dateTo: null,
    });
    expect(
      view.getByRole("combobox", { name: "Period" }).textContent,
    ).toContain("All time");
  });

  it("feeds grouping and period controls to the hook and exports the applied report", async () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport(),
      isError: false,
      isLoading: false,
      isUpdating: false,
    });
    const view = renderWithUrl(<ReportsPage />);
    expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("funds", {
      dateFrom: null,
      dateTo: null,
    });
    expect(
      view.getByRole("link", { name: "Export CSV" }).getAttribute("href"),
    ).toBe("/api/admin/crm/reports/export?slice=funds");
    fireEvent.click(
      view.getByRole("button", { name: "Missionary", exact: true }),
    );
    expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("missionaries", {
      dateFrom: null,
      dateTo: null,
    });
    fireEvent.click(view.getByRole("combobox", { name: "Period" }));
    fireEvent.keyDown(
      await view.findByRole("option", { name: "Last 30 days" }),
      { key: "Enter" },
    );
    await waitFor(() =>
      expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("missionaries", {
        dateFrom: expect.any(String),
        dateTo: null,
      }),
    );
  });

  it("keeps the applied donor labels while updating and disables export with its reason", () => {
    useAdminCrmReportMock.mockReturnValue({
      report: createReport({ slice: "donors" }),
      isError: false,
      isLoading: false,
      isUpdating: true,
    });
    const view = renderWithUrl(<ReportsPage />);
    expect(view.getByText(/Net giving by donor/)).toBeTruthy();
    expect(view.getByRole("region", { name: "Donors" })).toBeTruthy();
    expect(view.getByRole("status").textContent).toContain("Updating");
    expect(view.queryByRole("link", { name: "Export CSV" })).toBeNull();
    const button = view.getByRole("button", { name: "Export CSV" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(
      document.getElementById(button.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toContain("Wait for the report to finish updating");
    expect(view.queryByText("Giving by fund")).toBeNull();
  });

  it("derives KPI cards from real report totals", () => {
    const kpis = deriveReportKpis(createReport());

    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Net giving",
      "Gifts",
      "Average gift",
      "Donors",
    ]);
    // 800000 cents == $8,000.00 ; avg 800000/35 cents == $228.57
    expect(kpis[0].value).toBe("$8,000.00");
    expect(kpis[1].value).toBe("35");
    expect(kpis[2].value).toBe("$228.57");
    expect(kpis[3].value).toBe("21");
  });

  it("derives zeroed KPI cards without fabricated numbers when there is no report", () => {
    const kpis = deriveReportKpis(null);

    expect(kpis[0].value).toBe("$0.00");
    expect(kpis[1].value).toBe("0");
    expect(kpis.some((kpi) => kpi.value.includes("26.4M"))).toBe(false);
    expect(kpis.some((kpi) => kpi.value.includes("88.4"))).toBe(false);
  });

  it("maps report rows to giving-by-fund and donors-by-fund chart series", () => {
    const report = createReport();

    expect(deriveGivingByFund(report)).toEqual([
      { amount: 5000, label: "Clean Water Initiative" },
      { amount: 3000, label: "Food Bank" },
    ]);
    expect(deriveDonorsByFund(report)).toEqual([
      { donors: 12, label: "Clean Water Initiative" },
      { donors: 9, label: "Food Bank" },
    ]);
    expect(deriveGivingByFund(null)).toEqual([]);
  });

  it("names the reporting period from the report filters", () => {
    expect(describeReportPeriod(createReport())).toBe("All time");
    expect(
      describeReportPeriod(
        createReport({
          filters: {
            dateFrom: "2026-01-01",
            dateTo: "2026-03-31",
            search: null,
          },
        }),
      ),
    ).toBe("Jan 1, 2026 – Mar 31, 2026");
    expect(
      describeReportPeriod(
        createReport({
          filters: { dateFrom: "2026-01-01", dateTo: null, search: null },
        }),
      ),
    ).toBe("Since Jan 1, 2026");
  });

  it("lists every fund with exact giving, its share and counts", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
      />,
    );

    const funds = view.getByRole("region", { name: "Funds" });
    const water = within(funds)
      .getByText("Clean Water Initiative")
      .closest("tr")!;
    expect(within(water).getByText("$5,000.00")).toBeTruthy();
    expect(within(water).getByText("62.5%")).toBeTruthy();
    expect(within(water).getByText("20")).toBeTruthy();
    expect(within(funds).getByText("Food Bank")).toBeTruthy();
  });

  it("lets phones jump past the charts to the funds list", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
      />,
    );

    const jump = view.getByRole("link", { name: "Jump to funds" });
    const heading = view.getByRole("heading", { name: "Funds", level: 2 });
    expect(jump.getAttribute("href")).toBe(`#${heading.id}`);
    expect(heading.id).toBe("report-funds");
    // Wider screens show the funds beside or just below the charts.
    expect(jump.className).toContain("sm:hidden");
  });

  it("offers no jump link while there are no funds to jump to", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={emptyReport}
      />,
    );
    expect(view.queryByRole("link", { name: "Jump to funds" })).toBeNull();
  });

  it("lets long fund names wrap on phone cards and offers a phone sort", () => {
    const innerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    try {
      const view = render(
        <ReportsPageView
          hasLoadedData
          isError={false}
          isLoading={false}
          report={createReport()}
        />,
      );
      const name = view.getByText("Clean Water Initiative");
      expect(name.closest("tr")).toBeNull();
      expect(name.className).not.toContain("truncate");
      expect(name.className).toContain("line-clamp-2");
      expect(view.getByRole("combobox", { name: "Sort funds" })).toBeTruthy();
    } finally {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: innerWidth,
      });
    }
  });

  it("describes the funds list in the order it is sorted", async () => {
    const { fundsSortDescription } =
      await import("../../../../../apps/admin/app/(app)/reports/funds-grid");
    expect(fundsSortDescription([{ id: "amountCents", desc: true }])).toBe(
      "Every fund with completed giving, largest giving first.",
    );
    expect(fundsSortDescription([{ id: "amountCents", desc: false }])).toBe(
      "Every fund with completed giving, smallest giving first.",
    );
    expect(fundsSortDescription([{ id: "label", desc: false }])).toBe(
      "Every fund with completed giving, by name from A to Z.",
    );
    expect(fundsSortDescription([{ id: "lastGiftAt", desc: true }])).toBe(
      "Every fund with completed giving, most recent gift first.",
    );
    expect(fundsSortDescription([{ id: "share", desc: false }])).toBe(
      "Every fund with completed giving, smallest share first.",
    );
    // No sort, or one it does not know: no order is claimed.
    expect(fundsSortDescription([])).toBe("Every fund with completed giving.");
    expect(fundsSortDescription([{ id: "unknown", desc: true }])).toBe(
      "Every fund with completed giving.",
    );

    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
      />,
    );
    expect(
      view.getByText("Every fund with net giving, largest giving first."),
    ).toBeTruthy();
  });

  it("keys summary lines by position, so repeated lines do not collide", async () => {
    const { GivingSummaryDialog } =
      await import("../../../../../apps/admin/app/(app)/reports/giving-summary-dialog");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const view = render(
        <GivingSummaryDialog text={"Giving summary\nSame line\nSame line"} />,
      );
      fireEvent.click(view.getByRole("button", { name: "Summary" }));
      const dialog = await view.findByRole("dialog", {
        name: "Giving summary",
      });
      expect(within(dialog).getAllByText("Same line")).toHaveLength(2);
      expect(
        consoleError.mock.calls.some((call) =>
          String(call[0]).includes("same key"),
        ),
      ).toBe(false);
    } finally {
      consoleError.mockRestore();
    }
  });

  it("says when the charts leave smaller funds out", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({
      amountCents: (10 - index) * 10000,
      donorCount: 1,
      giftCount: 1,
      id: `fund_${index}`,
      label: `Fund ${index}`,
      lastGiftAt: null,
      metadata: {},
      status: null,
    }));
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport({
          rows,
          totals: {
            amountCents: 550000,
            donorCount: 10,
            giftCount: 10,
            rowCount: 10,
          },
        })}
      />,
    );

    expect(view.getAllByText(/Top 8 of 10 funds/).length).toBe(2);
  });

  it("renders a loading state with no fabricated KPI numbers", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData={false}
        isError={false}
        isLoading
        report={null}
      />,
    );

    expect(view.getByText(/loading reports/i)).toBeTruthy();
    expect(view.queryByText("$26.4M")).toBeNull();
    expect(view.queryByText("88.4%")).toBeNull();
    expect(view.queryByText("Retention Rate")).toBeNull();
  });

  it("renders an honest error state", () => {
    const view = render(
      <ReportsPageView
        errorMessage="Unable to reach reports"
        hasLoadedData={false}
        isError
        isLoading={false}
        report={null}
      />,
    );

    expect(view.getByText("Could not load reports")).toBeTruthy();
    expect(view.getByText("Unable to reach reports")).toBeTruthy();
    expect(view.queryByText("$26.4M")).toBeNull();
  });

  it("offers Retry when the report fails to load", () => {
    const onRetry = vi.fn();
    const view = render(
      <ReportsPageView
        errorMessage="Unable to reach reports"
        hasLoadedData={false}
        isError
        isLoading={false}
        onRetry={onRetry}
        report={null}
      />,
    );
    view.getByRole("button", { name: "Retry" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders an honest empty state when there is no completed giving", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={emptyReport}
      />,
    );

    expect(view.getByText("No settled giving to report yet")).toBeTruthy();
  });

  it("renders real KPI values and fund labels from the report", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
      />,
    );

    const summary = within(
      view.getByRole("region", { name: "Giving summary" }),
    );
    expect(summary.getByText("Net giving")).toBeTruthy();
    expect(summary.getByText("$8,000.00")).toBeTruthy();
    expect(summary.getByText("Gifts")).toBeTruthy();
    expect(summary.getByText("Donors")).toBeTruthy();
    expect(view.getByText("Giving by fund")).toBeTruthy();
    expect(view.getByText("Donors by fund")).toBeTruthy();
    expect(
      view.getByText(
        "Net giving by fund, after refunds and corrections. Period: All time.",
      ),
    ).toBeTruthy();
    // The cards already carry the totals; no Highlights card repeats them.
    expect(view.queryByRole("heading", { name: "Highlights" })).toBeNull();
  });

  it("builds a plain-text giving summary with exact amounts and the top fund", async () => {
    const { buildGivingSummaryText } =
      await import("../../../../../apps/admin/app/(app)/reports/report-model");
    expect(buildGivingSummaryText(createReport())).toBe(
      [
        "Giving summary, all time",
        "Net giving (after refunds): $8,000.00 from 35 gifts by 21 donors.",
        "Average gift: $228.57.",
        "Top fund: Clean Water Initiative, $5,000.00 (62.5% of giving).",
      ].join("\n"),
    );
    expect(buildGivingSummaryText(emptyReport)).toBeNull();
    expect(buildGivingSummaryText(null)).toBeNull();
  });

  it("shows the giving summary in a dialog and copies it as plain text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
      />,
    );

    fireEvent.click(view.getByRole("button", { name: "Summary" }));
    const dialog = await view.findByRole("dialog", { name: "Giving summary" });
    expect(
      within(dialog).getByText(
        "Net giving (after refunds): $8,000.00 from 35 gifts by 21 donors.",
      ),
    ).toBeTruthy();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Copy summary" }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("Top fund: Clean Water Initiative"),
      ),
    );
    expect(await within(dialog).findByText("Copied")).toBeTruthy();
  });

  it("offers no summary while there is no giving to summarize", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={emptyReport}
      />,
    );
    expect(view.queryByRole("button", { name: "Summary" })).toBeNull();
  });

  it("places the giving trend after the funds list, so the list is not pushed down, whatever the report state", () => {
    const trend = <section aria-label="Net giving by month">Trend</section>;
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={createReport()}
        givingTrend={trend}
      />,
    );
    const trendRegion = view.getByRole("region", {
      name: "Net giving by month",
    });
    const byFund = view.getByRole("region", { name: "Giving by fund" });
    const funds = view.getByRole("heading", { name: "Funds", level: 2 });
    expect(
      byFund.compareDocumentPosition(funds) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // It has its own fixed period, so it follows the selection's figures.
    expect(
      funds.compareDocumentPosition(trendRegion) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Its own read: a failed or empty report does not hide it.
    view.rerender(
      <ReportsPageView
        isError
        isLoading={false}
        report={null}
        givingTrend={trend}
      />,
    );
    expect(
      view.getByRole("region", { name: "Net giving by month" }),
    ).toBeTruthy();
    view.rerender(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={emptyReport}
        givingTrend={trend}
      />,
    );
    expect(
      view.getByRole("region", { name: "Net giving by month" }),
    ).toBeTruthy();
  });

  it("passes the server-streamed giving trend through the default export", () => {
    useAdminCrmReportMock.mockReturnValue({
      error: null,
      isError: false,
      isLoading: true,
      report: null,
    });
    const view = renderWithUrl(
      <ReportsPage
        givingTrend={<p data-testid="giving-trend">Trend slot</p>}
      />,
    );
    expect(view.getByTestId("giving-trend")).toBeTruthy();
  });

  it("streams the giving trend behind its own Suspense boundary with a loading chart", () => {
    const page = readRepoFile("apps/admin/app/(app)/reports/page.tsx");
    expect(page).toMatch(
      /<Suspense\s+fallback={<GivingTrendCard isLoading \/>}\s*>\s*<ReportsGivingTrend \/>/,
    );
  });

  it("drives the default export from the useAdminCrmReport hook", () => {
    useAdminCrmReportMock.mockReturnValue({
      error: "Server returned a string failure",
      isError: true,
      isLoading: false,
      report: null,
    });

    const view = renderWithUrl(<ReportsPage />);

    // The URL adapter may render twice; what matters is the report it asks for.
    expect(useAdminCrmReportMock).toHaveBeenLastCalledWith("funds", {
      dateFrom: null,
      dateTo: null,
    });
    expect(view.getByText("Could not load reports")).toBeTruthy();
    expect(view.getByText("Server returned a string failure")).toBeTruthy();
  });

  it("does not keep mock report data or fake AI generation in the page source", () => {
    const source = readRepoFile("apps/admin/app/(app)/reports/page-client.tsx");

    for (const banned of [
      "DONATION_DATA",
      "ENGAGEMENT_DATA",
      "_DONOR_TYPE_DATA",
      "setTimeout",
      "26.4M",
      "88.4%",
      "Report Library",
      "Summarizing",
    ]) {
      expect(source).not.toContain(banned);
    }
  });
});

it("keeps capped and unknown completeness warnings in copied giving summaries", async () => {
  const { buildGivingSummaryText } =
    await import("../../../../../apps/admin/app/(app)/reports/report-model");
  const report = createReport();
  report.completeness = {
    ...report.completeness,
    complete: false,
    donationLimit: 50000,
  };
  expect(buildGivingSummaryText(report)).toContain(
    "Incomplete report: totals cover only the most recent 50,000 gifts in this period.",
  );
  report.completeness.donationLimit = null;
  expect(buildGivingSummaryText(report)).toContain(
    "Incomplete report: these totals may omit gifts from this period.",
  );
  Reflect.deleteProperty(report, "completeness");
  expect(buildGivingSummaryText(report)).toContain(
    "Couldn’t confirm that these totals include every gift in this period.",
  );
});
