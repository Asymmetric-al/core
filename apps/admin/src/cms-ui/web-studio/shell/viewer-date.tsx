"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards (and straight
 * away on client navigation), so a value can differ between the two without
 * a hydration mismatch.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

const FULL_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "full",
  timeStyle: "short",
};

function format(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  utc: boolean,
): string {
  if (!utc) return new Intl.DateTimeFormat("en-US", options).format(date);
  const withTime = "hour" in options || "timeStyle" in options;
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
    // A time says which zone it is in; a date alone needs no suffix.
    ...(withTime && !("timeStyle" in options) ? { timeZoneName: "short" } : {}),
  }).format(date);
}

/**
 * A date in the viewer's time zone. The server does not know that zone, so
 * it renders the value in UTC, labelled as such, and the browser swaps in
 * the local time once hydrated. `dateTime` holds the exact value and the
 * hover title the full local date.
 */
export function ViewerDate({
  value,
  options,
  className,
}: {
  value: string;
  options: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const hydrated = useIsHydrated();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <time
      dateTime={value}
      title={format(date, FULL_OPTIONS, !hydrated)}
      className={className}
    >
      {format(date, options, !hydrated)}
    </time>
  );
}
