/**
 * Giving Trends projection for the donor history chart.
 * Aggregates the already-live `portal.donations` into monthly totals so the
 * chart no longer renders a hardcoded MONTHLY_DATA array. Pure + deterministic
 * (no `Date.now`) — fully unit-testable.
 */

export interface GivingTrendPoint {
  /** "YYYY-MM" */
  monthKey: string;
  /** "Jan 2026" */
  label: string;
  totalCents: number;
  total: number;
  giftCount: number;
}

/** Minimal shape needed from a DonorPortalDonation. */
export interface GivingTrendInput {
  date: string;
  amountCents: number;
  status: string;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthKey(date: string): string | null {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  return match ? `${match[1]}-${match[2]}` : null;
}

function labelFor(key: string): string {
  const [year, month] = key.split("-");
  const index = Number(month) - 1;
  return `${MONTH_ABBR[index] ?? month} ${year}`;
}

/**
 * Monthly totals of SETTLED (Succeeded) gifts, ascending by month. Only months
 * with at least one settled gift appear (the chart can zero-fill a window if it
 * wants); rows with an unparseable date are skipped.
 */
export function buildGivingTrends(
  donations: GivingTrendInput[],
): GivingTrendPoint[] {
  const byMonth = new Map<string, { totalCents: number; giftCount: number }>();

  for (const donation of donations) {
    if (donation.status !== "Succeeded") continue;
    const key = monthKey(donation.date);
    if (!key) continue;
    const current = byMonth.get(key) ?? { totalCents: 0, giftCount: 0 };
    current.totalCents += donation.amountCents ?? 0;
    current.giftCount += 1;
    byMonth.set(key, current);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      monthKey: key,
      label: labelFor(key),
      totalCents: value.totalCents,
      total: Math.round(value.totalCents) / 100,
      giftCount: value.giftCount,
    }));
}
