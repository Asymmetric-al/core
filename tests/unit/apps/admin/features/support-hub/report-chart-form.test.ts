import { describe, expect, it } from "vitest";

import {
  REPORT_TREND_AREA_MAX_PERIODS,
  reportTrendChartForm,
} from "../../../../../../apps/admin/features/support-hub/lib/report-chart-form";

describe("reportTrendChartForm", () => {
  it("draws a short range as a filled area", () => {
    expect(reportTrendChartForm(1)).toBe("area");
    expect(reportTrendChartForm(7)).toBe("area");
    expect(reportTrendChartForm(REPORT_TREND_AREA_MAX_PERIODS)).toBe("area");
  });

  it("draws a long range (a month by day) as bars, so one busy day is not read as a spike", () => {
    expect(reportTrendChartForm(REPORT_TREND_AREA_MAX_PERIODS + 1)).toBe("bar");
    expect(reportTrendChartForm(31)).toBe("bar");
  });
});
