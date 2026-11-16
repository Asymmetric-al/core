"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Types for donation metrics and chart data
 */

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface MonthlyChartDataPoint {
  month: string;
  year: number;
  recurring: number;
  oneTime: number;
  offline: number;
  total: number;
}

export interface MetricData {
  total: number | null;
  /** Percent change vs the prior period; null when the prior period had no gifts. */
  change: number | null;
  trend: "up" | "down" | "neutral";
  data: ChartDataPoint[];
}

/** One gift as the metrics API returns it, in any status (cents). */
export interface MetricsGift {
  amountCents: number;
  currency: string | null;
  date: string;
  donorId: string | null;
  type: DonationType;
  status: string;
}

export interface DonationMetrics {
  currency: string | null;
  thisMonth: MetricData;
  lastMonth: MetricData;
  yearToDate: MetricData;
  monthlyBreakdown: MonthlyChartDataPoint[];
  gifts: MetricsGift[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export type DonationType = "recurring" | "one_time" | "offline";

const HISTORY_MONTHS = 13;
const COMPARISON_HISTORY_MONTHS = 25;

/**
 * Calendar keys in the viewer's time zone, not UTC: a gift at 11pm on the
 * last day of a month belongs to that month wherever the viewer is.
 */
function localMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function localDayKey(date: Date): string {
  return `${localMonthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

interface RawDonation {
  id: string;
  amount: number;
  currency: string | null;
  donation_type: DonationType;
  created_at: string;
  /** The day the gift was given (SQL DATE); entry time is the fallback. */
  gift_date?: string | null;
  status: string;
  donor_id?: string | null;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * When a gift counts: its gift date, read as a local calendar day (a bare
 * "2026-02-01" would otherwise parse as UTC midnight and slip a day west of
 * UTC), or the time it was recorded when there is no gift date.
 */
function giftTime(d: RawDonation): Date {
  const match = d.gift_date ? DATE_ONLY.exec(d.gift_date) : null;
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(d.created_at);
}

/**
 * The one currency of the completed gifts the dashboard shows, judged by the
 * date each is counted on. Gifts fetched only for the comparison window but
 * outside every shown period don't count, so an old gift in another currency
 * can't blank the charts. `shown` is false when no completed gift is shown.
 */
function qualifyShownMoney(
  donations: RawDonation[],
  now: Date,
  months: number,
): { shown: boolean; currency: string | null } {
  const breakdownStart = new Date(
    now.getFullYear(),
    now.getMonth() - (HISTORY_MONTHS - 1),
    1,
  );
  const historyStart = new Date(now);
  historyStart.setMonth(historyStart.getMonth() - months);
  // Last year's year-to-date comparison reaches back to 1 January when the
  // history covers it.
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const shownStart =
    lastYearStart >= historyStart && lastYearStart < breakdownStart
      ? lastYearStart
      : breakdownStart;
  let currency: string | null = null;
  let shown = false;
  let total = 0;
  for (const d of donations) {
    if (d.status !== "completed" || giftTime(d) < shownStart) continue;
    shown = true;
    total += d.amount;
    if (
      !d.currency ||
      (currency !== null && d.currency !== currency) ||
      !Number.isSafeInteger(d.amount) ||
      d.amount < 0 ||
      !Number.isSafeInteger(total)
    ) {
      return { shown, currency: null };
    }
    currency = d.currency;
  }
  return { shown, currency };
}

/**
 * Aggregates donations by day within a date range
 */
function aggregateByDay(
  donations: RawDonation[],
  startDate: Date,
  endDate: Date,
): ChartDataPoint[] {
  const dayMap = new Map<string, number>();

  const current = new Date(startDate);
  while (current <= endDate) {
    const key = localDayKey(current);
    dayMap.set(key, 0);
    current.setDate(current.getDate() + 1);
  }

  donations.forEach((d) => {
    const date = giftTime(d);
    if (date >= startDate && date <= endDate && d.status === "completed") {
      const key = localDayKey(date);
      dayMap.set(key, (dayMap.get(key) ?? 0) + Number(d.amount));
    }
  });

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

/**
 * Aggregates donations by month with breakdown by type
 * Returns data for the specified number of months ending at current month
 */
function aggregateByMonth(
  donations: RawDonation[],
  months: number,
  now: Date,
): MonthlyChartDataPoint[] {
  const monthMap = new Map<
    string,
    { recurring: number; oneTime: number; offline: number }
  >();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = localMonthKey(d);
    monthMap.set(key, { recurring: 0, oneTime: 0, offline: 0 });
  }

  donations.forEach((d) => {
    if (d.status !== "completed") return;
    const date = giftTime(d);
    const key = localMonthKey(date);
    const entry = monthMap.get(key);
    if (entry) {
      const amount = Number(d.amount);
      switch (d.donation_type) {
        case "recurring":
          entry.recurring += amount;
          break;
        case "one_time":
          entry.oneTime += amount;
          break;
        case "offline":
          entry.offline += amount;
          break;
      }
    }
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { recurring, oneTime, offline }]) => ({
      month: formatMonth(key),
      year: Number(key.slice(0, 4)),
      recurring,
      oneTime,
      offline,
      total: recurring + oneTime + offline,
    }));
}

/**
 * Formats ISO month string (YYYY-MM) to short month name
 */
function formatMonth(isoMonth: string): string {
  const parts = isoMonth.split("-");
  const year = parts[0] ?? "2024";
  const month = parts[1] ?? "01";
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

/**
 * Calculates percentage change between two values
 */
function calculateChange(
  current: number,
  previous: number,
): { change: number | null; trend: "up" | "down" | "neutral" } {
  if (previous === 0) {
    // No prior amount to compare against: a percentage would be invented.
    return { change: null, trend: "neutral" };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    change: Math.round(change * 10) / 10,
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

/**
 * Hook for fetching and computing donation metrics for a missionary
 *
 * @param missionaryId - The UUID of the missionary
 * @returns Donation metrics including this month, last month, YTD totals, and monthly breakdown
 */
export function useDonationMetrics(
  missionaryId: string,
  options: { months?: number } = {},
): DonationMetrics {
  const months = options.months ?? COMPARISON_HISTORY_MONTHS;
  const query = `?months=${months}`;
  const [{ donations, currency, moneyQualified }, setMoney] = useState<{
    donations: RawDonation[];
    currency: string | null;
    /** False when the response carried no money qualification at all. */
    moneyQualified: boolean;
  }>({ donations: [], currency: null, moneyQualified: false });
  const [calendarAnchor, setCalendarAnchor] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    setCalendarAnchor(new Date());
    if (!missionaryId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/missionaries/${missionaryId}/metrics${query}`,
          { signal: controller.signal },
        );

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!isMounted) return;

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.limited === true) {
          throw new Error("Donation metrics are unavailable.");
        }

        setMoney({
          donations: result.donations || [],
          currency:
            typeof result.currency === "string" ? result.currency : null,
          moneyQualified:
            typeof result.currency === "string" || result.currency === null,
        });
      } catch (e) {
        if (!isMounted) return;
        setError(
          e instanceof Error ? e : new Error("Failed to fetch donations"),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDonations();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [missionaryId, query, attempt]);

  const metrics = useMemo((): Omit<
    DonationMetrics,
    "isLoading" | "error" | "retry"
  > => {
    const gifts = donations.map((donation) => ({
      amountCents: donation.amount,
      currency: donation.currency ?? null,
      date: giftTime(donation).toISOString(),
      donorId: donation.donor_id ?? null,
      type: donation.donation_type,
      status: donation.status,
    }));
    const qualified =
      calendarAnchor === null || !moneyQualified
        ? { shown: false, currency: null }
        : qualifyShownMoney(donations, calendarAnchor, months);
    // With no completed gift in any shown period the totals are zero; the
    // fetch's own currency still lets them read as "$0".
    const shownCurrency = qualified.shown ? qualified.currency : currency;
    if (calendarAnchor === null || shownCurrency === null) {
      const unavailable: MetricData = {
        total: null,
        change: null,
        trend: "neutral",
        data: [],
      };
      return {
        currency: null,
        thisMonth: unavailable,
        lastMonth: unavailable,
        yearToDate: unavailable,
        monthlyBreakdown: [],
        gifts,
      };
    }
    const now = calendarAnchor;

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);

    const twoMonthsAgoStart = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1,
    );

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearSameDay = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
    // The metrics API returns `months` of gifts (see
    // packages/api/src/missionaries/metrics.ts).
    const historyStart = new Date(now);
    historyStart.setMonth(historyStart.getMonth() - months);

    // Half-open [start, end) windows: a month ends where the next one starts,
    // so gifts made during a month's last day are counted.
    const sumPeriod = (start: Date, end: Date) =>
      donations
        .filter((d) => {
          const date = giftTime(d);
          return date >= start && date < end && d.status === "completed";
        })
        .reduce((sum, d) => sum + Number(d.amount), 0);

    const thisMonthTotal = sumPeriod(thisMonthStart, nextMonthStart);
    const lastMonthTotal = sumPeriod(lastMonthStart, thisMonthStart);
    const twoMonthsAgoTotal = sumPeriod(twoMonthsAgoStart, lastMonthStart);
    const ytdTotal = sumPeriod(yearStart, now);
    const lastYtdTotal = sumPeriod(lastYearStart, lastYearSameDay);

    const thisMonthChange = calculateChange(thisMonthTotal, lastMonthTotal);
    const lastMonthChange = calculateChange(lastMonthTotal, twoMonthsAgoTotal);
    // Last year's year-to-date window starts before the fetched history for
    // every month after January; a partial prior total would give a wrong
    // percentage, so report no comparison instead.
    const ytdChange: Pick<MetricData, "change" | "trend"> =
      lastYearStart < historyStart
        ? { change: null, trend: "neutral" }
        : calculateChange(ytdTotal, lastYtdTotal);

    return {
      currency: shownCurrency,
      thisMonth: {
        total: thisMonthTotal,
        ...thisMonthChange,
        data: aggregateByDay(donations, thisMonthStart, now),
      },
      lastMonth: {
        total: lastMonthTotal,
        ...lastMonthChange,
        data: aggregateByDay(donations, lastMonthStart, lastMonthEnd),
      },
      yearToDate: {
        total: ytdTotal,
        ...ytdChange,
        data: aggregateByDay(donations, yearStart, now),
      },
      monthlyBreakdown: aggregateByMonth(donations, HISTORY_MONTHS, now),
      gifts,
    };
  }, [donations, currency, moneyQualified, months, calendarAnchor]);

  return {
    ...metrics,
    isLoading: isLoading || calendarAnchor === null,
    error,
    retry,
  };
}
