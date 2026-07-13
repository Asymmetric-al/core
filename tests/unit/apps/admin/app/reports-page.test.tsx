/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminCrmReportResponse } from "@asym/database/types";

const { useAdminCrmReportMock } = vi.hoisted(() => ({
  useAdminCrmReportMock: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useAdminCrmReport: useAdminCrmReportMock,
}));

const repoRoot = process.cwd();
type ReportsPageComponent =
  typeof import("../../../../../apps/admin/app/reports/page-client").default;
type ReportsPageViewComponent =
  typeof import("../../../../../apps/admin/app/reports/page-client").ReportsPageView;
type DeriveReportKpis =
  typeof import("../../../../../apps/admin/app/reports/page-client").deriveReportKpis;
type BuildReportSummary =
  typeof import("../../../../../apps/admin/app/reports/page-client").buildReportSummary;
type DeriveGivingByFund =
  typeof import("../../../../../apps/admin/app/reports/page-client").deriveGivingByFund;
type DeriveDonorsByFund =
  typeof import("../../../../../apps/admin/app/reports/page-client").deriveDonorsByFund;

let ReportsPage: ReportsPageComponent;
let ReportsPageView: ReportsPageViewComponent;
let deriveReportKpis: DeriveReportKpis;
let buildReportSummary: BuildReportSummary;
let deriveGivingByFund: DeriveGivingByFund;
let deriveDonorsByFund: DeriveDonorsByFund;
let dom: JSDOM | undefined;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function createReport(
  overrides: Partial<AdminCrmReportResponse> = {},
): AdminCrmReportResponse {
  return {
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

describe("apps/admin/app/reports/page-client", () => {
  beforeEach(async () => {
    useAdminCrmReportMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "http://localhost",
    });
    globalThis.window = dom.window as unknown as Window & typeof globalThis;
    globalThis.document = dom.window.document;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.SVGElement = dom.window.SVGElement;
    globalThis.Node = dom.window.Node;
    globalThis.Event = dom.window.Event;
    globalThis.InputEvent = dom.window.InputEvent;
    globalThis.MutationObserver = dom.window.MutationObserver;
    globalThis.getComputedStyle = dom.window.getComputedStyle;
    globalThis.requestAnimationFrame = (callback) =>
      window.setTimeout(callback, 0);
    globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: dom.window.navigator,
    });
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
      !buildReportSummary ||
      !deriveGivingByFund ||
      !deriveDonorsByFund
    ) {
      const pageClient =
        await import("../../../../../apps/admin/app/reports/page-client");
      ReportsPage = pageClient.default;
      ReportsPageView = pageClient.ReportsPageView;
      deriveReportKpis = pageClient.deriveReportKpis;
      buildReportSummary = pageClient.buildReportSummary;
      deriveGivingByFund = pageClient.deriveGivingByFund;
      deriveDonorsByFund = pageClient.deriveDonorsByFund;
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    dom?.window.close();
    dom = undefined;
  });

  it("derives KPI cards from real report totals", () => {
    const kpis = deriveReportKpis(createReport());

    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Completed Giving",
      "Total Gifts",
      "Average Gift",
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

  it("builds a deterministic report summary from real data", () => {
    const summary = buildReportSummary(createReport());

    expect(summary).not.toBeNull();
    expect(summary).toContain("$8,000.00");
    expect(summary).toContain("35");
    expect(summary).toContain("21");
    expect(summary).toContain("Clean Water Initiative");
    expect(summary).toContain("$5,000.00");
  });

  it("returns no summary when the report has no giving", () => {
    expect(buildReportSummary(emptyReport)).toBeNull();
    expect(buildReportSummary(null)).toBeNull();
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

  it("renders an honest empty state when there is no completed giving", () => {
    const view = render(
      <ReportsPageView
        hasLoadedData
        isError={false}
        isLoading={false}
        report={emptyReport}
      />,
    );

    expect(view.getByText("No completed giving to report yet")).toBeTruthy();
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

    expect(view.getByText("Completed Giving")).toBeTruthy();
    expect(view.getByText("$8,000.00")).toBeTruthy();
    expect(view.getByText("Total Gifts")).toBeTruthy();
    expect(view.getByText("Donors")).toBeTruthy();
    expect(view.getByText("Giving by Fund")).toBeTruthy();
    expect(view.getByText("Donors by Fund")).toBeTruthy();
  });

  it("drives the default export from the useAdminCrmReport hook", () => {
    useAdminCrmReportMock.mockReturnValue({
      error: "Server returned a string failure",
      isError: true,
      isLoading: false,
      report: null,
    });

    const view = render(<ReportsPage />);

    expect(useAdminCrmReportMock).toHaveBeenCalledTimes(1);
    expect(view.getByText("Could not load reports")).toBeTruthy();
    expect(view.getByText("Server returned a string failure")).toBeTruthy();
  });

  it("does not keep mock report data or fake AI generation in the page source", () => {
    const source = readRepoFile("apps/admin/app/reports/page-client.tsx");

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
