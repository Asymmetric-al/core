import type { MonthlyChartDataPoint } from "@asym/lib/hooks";

/**
 * Trailing window (in months) rendered in the "Giving Trends" card. Matches the
 * card's default "Last 6m" range selector.
 */
export const GIVING_TREND_MONTHS = 6;

/**
 * Chart-ready giving point in dollars. `total = recurring + oneTime` (offline is excluded).
 */
export interface GivingTrendPoint {
  month: string;
  total: number;
  recurring: number;
  oneTime: number;
}

function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Projects the shared donation-metrics monthly breakdown onto the Giving Trends
 * chart shape, limited to the trailing `months` window.
 *
 * The aggregation itself is owned by `useDonationMetrics` (packages/lib) over the
 * existing `/api/missionaries/[id]/metrics` endpoint — this only selects the
 * window and reshapes it. No donor-identifying fields are referenced: the input
 * is already reduced to per-month sums.
 */
export function selectGivingTrend(
  monthlyBreakdown: readonly MonthlyChartDataPoint[],
  months: number = GIVING_TREND_MONTHS,
): GivingTrendPoint[] {
  if (months <= 0) return [];
  const windowed = monthlyBreakdown.slice(-months);
  return windowed.map((point) => {
    const recurring = centsToDollars(point.recurring);
    const oneTime = centsToDollars(point.oneTime);

    return {
      month: point.month,
      total: recurring + oneTime,
      recurring,
      oneTime,
    };
  });
}

export type GivingTrendState = "loading" | "error" | "empty" | "ready";

/**
 * Derives which UI state the Giving Trends card should render.
 *
 * `empty` means the request resolved successfully but every month in the window
 * is zero (new missionary / no settled gifts yet) — that must surface an empty
 * state rather than a flat, misleading chart.
 */
export function resolveGivingTrendState(input: {
  isLoading: boolean;
  error: unknown;
  points: readonly GivingTrendPoint[];
}): GivingTrendState {
  if (input.isLoading) return "loading";
  if (input.error) return "error";
  const hasValue = input.points.some(
    (point) => point.recurring !== 0 || point.oneTime !== 0,
  );
  return hasValue ? "ready" : "empty";
}
