"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface TimeAgoOptions {
  updateInterval?: number;
  shortFormat?: boolean;
}

function calculateTimeAgo(
  dateString: string,
  shortFormat = false,
  nowMs = Date.now(),
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

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(
    "en-US",
    options ?? { month: "short", day: "numeric", year: "numeric" },
  );
}

const emptySubscribe = () => () => {};

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

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function useTimeAgo(
  dateString: string,
  options?: TimeAgoOptions,
): string {
  const { updateInterval, shortFormat = false } = options ?? {};
  const isClient = useIsClient();
  const now = useNow(updateInterval);

  return useMemo(() => {
    if (!isClient) {
      return formatDate(dateString, { month: "short", day: "numeric" });
    }

    return calculateTimeAgo(dateString, shortFormat, now);
  }, [dateString, isClient, now, shortFormat]);
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
  const isClient = useIsClient();

  return useMemo(() => {
    if (!isClient) {
      return "";
    }

    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [isClient]);
}
