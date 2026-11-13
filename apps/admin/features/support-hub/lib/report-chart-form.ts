/** Most periods a trend chart draws as a filled area (two weeks by day). */
export const REPORT_TREND_AREA_MAX_PERIODS = 14;

export type ReportTrendChartForm = "area" | "bar";

/**
 * How a trend chart draws its periods. A short range reads well as a filled
 * area; over a long range (a month by day) a curve across mostly quiet days
 * reads as one spike, so each period gets its own bar instead.
 */
export function reportTrendChartForm(periods: number): ReportTrendChartForm {
  return periods > REPORT_TREND_AREA_MAX_PERIODS ? "bar" : "area";
}
