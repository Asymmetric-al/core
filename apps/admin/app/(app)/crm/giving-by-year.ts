import type { CrmDonorDetailResponse } from "@asym/database/types";

/** Years shown at most, so each bar stays wide enough to read in the drawer. */
const MAX_YEARS = 10;

export type CrmGivingYear = {
  year: number;
  /** Settled giving after refunds, in the gifts' currency. */
  amountCents: number;
  giftCount: number;
  isCurrentYear: boolean;
};

export type CrmGivingByYear =
  | {
      kind: "chart";
      currencyCode: string;
      /** From the earliest year with giving through this year, zeros kept. */
      years: CrmGivingYear[];
      /** The gift list is capped, so its earliest years may be incomplete. */
      truncated: boolean;
      /** Giving older than the years shown exists but is not charted. */
      olderYearsLeftOut: boolean;
    }
  /** Fewer than two years to compare: one bar says no more than a total. */
  | { kind: "none" }
  /** Amounts in different currencies cannot be added together. */
  | { kind: "mixed-currency" };

/**
 * Settled giving per calendar year from the drawer's gift history, the same
 * rule as the Lifetime giving note: completed gifts, net of refunds. Years
 * without giving stay as zero bars through this year, so a lapse shows.
 */
export function crmGivingByYear(
  detail: Pick<CrmDonorDetailResponse, "giftHistory" | "giftHistoryTruncated">,
  currentYear: number,
): CrmGivingByYear {
  const totals = new Map<number, { amountCents: number; giftCount: number }>();
  let currencyCode: string | null = null;

  for (const { shared } of detail.giftHistory) {
    if (shared.paymentStatus !== "completed") continue;
    const netCents = shared.amountCents - shared.refundedAmountCents;
    if (netCents <= 0) continue;
    const currency = shared.currencyCode.toUpperCase();
    if (currencyCode && currency !== currencyCode) {
      return { kind: "mixed-currency" };
    }
    currencyCode = currency;
    const year = Number(shared.giftDate.slice(0, 4));
    const total = totals.get(year) ?? { amountCents: 0, giftCount: 0 };
    total.amountCents += netCents;
    total.giftCount += 1;
    totals.set(year, total);
  }

  if (!currencyCode) return { kind: "none" };
  const givingYears = [...totals.keys()];
  const lastYear = Math.max(currentYear, ...givingYears);
  const earliestYear = Math.min(...givingYears);
  if (lastYear === earliestYear) return { kind: "none" };
  const firstYear = Math.max(earliestYear, lastYear - MAX_YEARS + 1);

  const years: CrmGivingYear[] = [];
  for (let year = firstYear; year <= lastYear; year += 1) {
    years.push({
      year,
      amountCents: totals.get(year)?.amountCents ?? 0,
      giftCount: totals.get(year)?.giftCount ?? 0,
      isCurrentYear: year === currentYear,
    });
  }

  return {
    kind: "chart",
    currencyCode,
    years,
    truncated: detail.giftHistoryTruncated,
    olderYearsLeftOut: earliestYear < firstYear,
  };
}
