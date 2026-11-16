/**
 * Giving analytics from completed gifts. Pure functions so the numbers are
 * testable; amounts are cents and months are the viewer's local calendar
 * months.
 */

import {
  formatCents,
  summarizeMoney,
} from "@asym/missionary/components/money-units";

export type AnalyticsGift = {
  amountCents: number;
  currency: string | null;
  /** ISO timestamp of the gift. */
  date: string;
  /** Null for gifts that can't be tied to a partner. */
  donorId: string | null;
  type: "recurring" | "one_time" | "offline";
  status: string;
};

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", { month: "short" });
const MONTH_NAME = new Intl.DateTimeFormat("en-US", { month: "long" });
const MONTH_AND_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
export const formatMoney = formatCents;

/** The two series of the year-over-year chart, as its legend names them. */
export const YEAR_OVER_YEAR_SERIES = {
  thisYear: "Last 12 months",
  lastYear: "Year before",
} as const;

/**
 * The reporting periods, in whole calendar months: the last 12 are this month
 * and the 11 before (what the chart shows), and the prior 12 come before them.
 */
function periods(now: Date) {
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const priorStart = new Date(now.getFullYear(), now.getMonth() - 23, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { priorStart, lastStart, end };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function completed(gifts: AnalyticsGift[]) {
  return gifts.filter((gift) => gift.status === "completed");
}

/** Gifts dated in [from, to). */
function between(gifts: AnalyticsGift[], from: Date, to: Date) {
  return gifts.filter((gift) => {
    const date = new Date(gift.date);
    return date >= from && date < to;
  });
}

function sum(gifts: AnalyticsGift[]) {
  return gifts.reduce((total, gift) => total + gift.amountCents, 0);
}

/** The last 12 months of giving against the 12 months before. */
export function givingYear(gifts: AnalyticsGift[], now: Date) {
  const done = completed(gifts);
  const { priorStart, lastStart, end } = periods(now);
  const last = between(done, lastStart, end);
  const prior = between(done, priorStart, lastStart);
  const { currency } = summarizeMoney([...last, ...prior]);
  const last12Cents = currency ? sum(last) : null;
  const prior12Cents = currency ? sum(prior) : null;
  return {
    currency,
    last12Cents,
    prior12Cents,
    changePct:
      last12Cents !== null && prior12Cents !== null && prior12Cents > 0
        ? Math.round(((last12Cents - prior12Cents) / prior12Cents) * 100)
        : null,
    giftCount: last.length,
    averageGiftCents:
      last12Cents !== null && last.length > 0
        ? Math.round(last12Cents / last.length)
        : null,
    // The typical gift: one large gift can't pull it up the way it can an average.
    medianGiftCents: currency
      ? median(last.map((gift) => gift.amountCents))
      : null,
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]!
    : Math.round((sorted[middle - 1]! + sorted[middle]!) / 2);
}

/**
 * Of the partners who gave in the 12 months before the last 12, the share
 * who gave again in the last 12. Gifts without a partner are left out.
 */
export function partnerRetention(gifts: AnalyticsGift[], now: Date) {
  const done = completed(gifts).filter((gift) => gift.donorId);
  const { priorStart, lastStart, end } = periods(now);
  const prior = new Set(
    between(done, priorStart, lastStart).map((gift) => gift.donorId),
  );
  const recent = new Set(
    between(done, lastStart, end).map((gift) => gift.donorId),
  );
  const retainedPartners = [...prior].filter((id) => recent.has(id)).length;
  return {
    priorPartners: prior.size,
    retainedPartners,
    ratePct:
      prior.size > 0 ? Math.round((retainedPartners / prior.size) * 100) : null,
  };
}

/** Each of the last 12 months beside the same month a year earlier. */
export function monthlyYearOverYear(gifts: AnalyticsGift[], now: Date) {
  const { priorStart, end } = periods(now);
  const done = between(completed(gifts), priorStart, end);
  if (!summarizeMoney(done).currency) return [];
  const totals = new Map<string, number>();
  for (const gift of done) {
    const key = monthKey(new Date(gift.date));
    totals.set(key, (totals.get(key) ?? 0) + gift.amountCents);
  }
  return Array.from({ length: 12 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const yearBefore = new Date(month.getFullYear() - 1, month.getMonth(), 1);
    return {
      key: monthKey(month),
      label: MONTH_LABEL.format(month),
      thisYearCents: totals.get(monthKey(month)) ?? 0,
      lastYearCents: totals.get(monthKey(yearBefore)) ?? 0,
    };
  });
}

export type YearOverYearMonth = ReturnType<typeof monthlyYearOverYear>[number];

/** The first day of the month a key names ("2025-12"). */
function monthFromKey(key: string): Date {
  const [year = 0, month = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * The year-over-year months for the chart's data table: each month named in
 * full, with its year only when the 12 months cross into a new year, and the
 * period they cover ("December 2025 to November 2026").
 */
export function yearOverYearTable(months: YearOverYearMonth[]) {
  const first = months[0];
  const last = months.at(-1);
  if (!first || !last) return { period: "", rows: [] };
  const start = monthFromKey(first.key);
  const end = monthFromKey(last.key);
  const name =
    start.getFullYear() === end.getFullYear() ? MONTH_NAME : MONTH_AND_YEAR;
  return {
    period: `${MONTH_AND_YEAR.format(start)} to ${MONTH_AND_YEAR.format(end)}`,
    rows: months.map((month) => ({
      ...month,
      name: name.format(monthFromKey(month.key)),
    })),
  };
}

/** The last 12 months of giving by how people gave. */
export function givingMix(gifts: AnalyticsGift[], now: Date) {
  const { lastStart, end } = periods(now);
  const last = between(completed(gifts), lastStart, end);
  const { currency } = summarizeMoney(last);
  const byType = (type: AnalyticsGift["type"]) =>
    currency ? sum(last.filter((gift) => gift.type === type)) : null;
  return {
    recurringCents: byType("recurring"),
    oneTimeCents: byType("one_time"),
    offlineCents: byType("offline"),
  };
}
