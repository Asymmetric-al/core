"use client";
import { cn } from "@asym/ui/lib/utils";

import { useSupportNow } from "../lib/now";
import { formatRelative } from "../lib/time";
export function RelativeTime({
  value,
  compact = false,
  className,
}: {
  value: string;
  compact?: boolean;
  className?: string;
}) {
  const now = useSupportNow();
  const relative = formatRelative(value, now);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    return (
      <span className={cn("font-sans tabular-nums", className)}>
        Time unavailable
      </span>
    );
  const exact = date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  });
  const label =
    compact || relative === "just now"
      ? relative
      : date.getTime() > new Date(now).getTime()
        ? `in ${relative}`
        : `${relative} ago`;
  return (
    <time
      dateTime={value}
      title={exact}
      className={cn("font-sans tabular-nums", className)}
    >
      {label}
    </time>
  );
}
