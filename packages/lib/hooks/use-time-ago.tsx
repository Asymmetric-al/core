"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useLocaleFormat, type LocaleFormatters } from "./use-locale-format";

export interface TimeAgoOptions {
  updateInterval?: number;
  shortFormat?: boolean;
}

const TIME_AGO_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

function calculateTimeAgo(
  dateString: string,
  shortFormat: boolean,
  nowMs: number,
  formatCalendarDate: LocaleFormatters["formatDate"],
): string {
  const date = new Date(dateString);
  const diffMs = nowMs - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";

  if (shortFormat) {
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  } else {
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return formatCalendarDate(dateString, TIME_AGO_DATE_OPTIONS);
}

function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(
    "en-US",
    options ?? { month: "short", day: "numeric", year: "numeric" },
  );
}

function useNow(updateInterval?: number): number {
  const intervalMs = updateInterval && updateInterval > 0 ? updateInterval : 0;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (intervalMs <= 0) {
        return () => {};
      }

      const timer = window.setInterval(onStoreChange, intervalMs);
      return () => window.clearInterval(timer);
    },
    [intervalMs],
  );

  return useSyncExternalStore(
    subscribe,
    () => Date.now(),
    () => 0,
  );
}

export function useTimeAgo(
  dateString: string,
  options?: TimeAgoOptions,
): string {
  const { updateInterval, shortFormat = false } = options ?? {};
  const { formatDate: formatHydrationDate, hydrated } = useLocaleFormat();
  const now = useNow(updateInterval);

  return useMemo(() => {
    if (!hydrated) {
      return formatHydrationDate(dateString, TIME_AGO_DATE_OPTIONS);
    }

    return calculateTimeAgo(dateString, shortFormat, now, formatHydrationDate);
  }, [dateString, formatHydrationDate, hydrated, now, shortFormat]);
}

export interface TimeAgoProps {
  date: string;
  shortFormat?: boolean;
  updateInterval?: number;
  className?: string;
}

export function TimeAgo({
  date,
  shortFormat,
  updateInterval,
  className,
}: TimeAgoProps) {
  const timeAgo = useTimeAgo(date, { shortFormat, updateInterval });
  return <span className={className}>{timeAgo}</span>;
}

export function useLastSynced(): string {
  const { hydrated, formatTime } = useLocaleFormat();

  return useMemo(() => {
    if (!hydrated) {
      return "";
    }

    return formatTime(new Date(), { hour: "2-digit", minute: "2-digit" });
  }, [formatTime, hydrated]);
}
