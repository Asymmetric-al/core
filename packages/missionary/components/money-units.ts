import type { MonthlyChartDataPoint } from "@asym/lib/hooks";

// Donation amounts are stored as integer cents (BIGINT since the 2026-02-14
// money migration). Dashboard displays work in dollars, like analytics.
function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Whole dollars drop the decimals ("$110"); others keep both ("$12.50"). */
export function formatDollars(dollars: number): string {
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

const EXACT_DOLLARS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Exact amount from cents, always with cents ("$130.00", "$706.67"), the
 * same way the donor app shows money. Rounding to whole dollars would
 * misstate a real amount.
 */
export function formatCents(cents: number): string {
  return EXACT_DOLLARS.format(centsToDollars(cents));
}

/** Compact dollar label for dashboard tiles, e.g. 3000000 cents -> "$30k". */
export function formatCurrencyFromCents(cents: number): string {
  const dollars = centsToDollars(cents);
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars % 1000 === 0 ? 0 : 1)}k`;
  }
  return formatDollars(dollars);
}

/** Converts the monthly giving breakdown from cents to dollars for charting. */
export function toDollarBreakdown(
  points: readonly MonthlyChartDataPoint[],
): MonthlyChartDataPoint[] {
  return points.map((point) => ({
    ...point,
    recurring: centsToDollars(point.recurring),
    oneTime: centsToDollars(point.oneTime),
    offline: centsToDollars(point.offline),
    total: centsToDollars(point.total),
  }));
}
