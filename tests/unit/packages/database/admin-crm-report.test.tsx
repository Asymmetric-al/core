/** @vitest-environment jsdom */

/**
 * The Reports page groups giving by fund, missionary or donor over a chosen
 * period. The hook sends the grouping and period bounds to the report API,
 * and the CSV link is built from the report the server applied, so an
 * export never describes a slice or period other than the one on screen.
 */

import { cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  crmReportExportHref,
  crmReportPeriodRange,
  useAdminCrmReport,
} from "../../../../packages/database/hooks/admin-crm-report";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

function reportFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    return {
      ok: true,
      json: async () => ({
        slice: url.searchParams.get("slice"),
        filters: {
          dateFrom: url.searchParams.get("dateFrom"),
          dateTo: url.searchParams.get("dateTo"),
          search: null,
        },
        rows: [],
      }),
    };
  });
}

describe("crmReportPeriodRange", () => {
  // 2026-11-11 15:30 local time.
  const now = new Date(2026, 10, 11, 15, 30);

  it("leaves all time unbounded", () => {
    expect(crmReportPeriodRange("all", now)).toEqual({
      dateFrom: null,
      dateTo: null,
    });
  });

  it("starts each period at local midnight and leaves the end open", () => {
    // Calendar dates, so the server compares them with each gift's date.
    expect(crmReportPeriodRange("year", now)).toEqual({
      dateFrom: "2026-01-01",
      dateTo: null,
    });
    expect(crmReportPeriodRange("12m", now).dateFrom).toBe("2025-11-11");
    // Today counts as one of the 90 and 30 days.
    expect(crmReportPeriodRange("90d", now).dateFrom).toBe("2026-08-14");
    expect(crmReportPeriodRange("30d", now).dateFrom).toBe("2026-10-13");
  });
});

describe("crmReportExportHref", () => {
  it("exports the slice and bounds the server applied", () => {
    const href = crmReportExportHref({
      slice: "missionaries",
      filters: {
        dateFrom: "2026-01-01T05:00:00.000Z",
        dateTo: null,
        search: null,
      },
    });
    const url = new URL(href, "http://localhost");

    expect(url.pathname).toBe("/api/admin/crm/reports/export");
    expect(url.searchParams.get("slice")).toBe("missionaries");
    expect(url.searchParams.get("dateFrom")).toBe("2026-01-01T05:00:00.000Z");
    expect(url.searchParams.has("dateTo")).toBe(false);
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("keeps a server-applied search", () => {
    const href = crmReportExportHref({
      slice: "donors",
      filters: { dateFrom: null, dateTo: null, search: "hale" },
    });

    expect(new URL(href, "http://localhost").searchParams.get("q")).toBe(
      "hale",
    );
  });
});

describe("useAdminCrmReport", () => {
  it("requests the chosen grouping and period", async () => {
    const fetchMock = reportFetch();
    vi.stubGlobal("fetch", fetchMock);
    const period = crmReportPeriodRange("year", new Date(2026, 10, 11));

    const { result } = renderHook(() => useAdminCrmReport("donors", period), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.report).not.toBeNull());
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]), "http://x");
    expect(url.searchParams.get("slice")).toBe("donors");
    expect(url.searchParams.get("dateFrom")).toBe(period.dateFrom);
    expect(url.searchParams.has("dateTo")).toBe(false);
    expect(result.current.isUpdating).toBe(false);
  });

  it("marks the previous report as updating while a new period loads", async () => {
    let release: (() => void) | undefined;
    const fetchMock = reportFetch();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (new URL(String(input), "http://x").searchParams.has("dateFrom")) {
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        }
        return fetchMock(input);
      }),
    );

    const { result, rerender } = renderHook(
      ({ period }) => useAdminCrmReport("funds", period),
      {
        wrapper: Wrapper,
        initialProps: { period: crmReportPeriodRange("all") },
      },
    );
    await waitFor(() => expect(result.current.report).not.toBeNull());

    rerender({ period: crmReportPeriodRange("30d") });

    await waitFor(() => expect(result.current.isUpdating).toBe(true));
    // The old (all time) report stays visible but is marked stale.
    expect(result.current.report?.filters.dateFrom).toBeNull();

    release?.();
    await waitFor(() => expect(result.current.isUpdating).toBe(false));
    expect(result.current.report?.filters.dateFrom).not.toBeNull();
  });
});
