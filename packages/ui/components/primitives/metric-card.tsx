import { CircleAlert, type LucideIcon } from "lucide-react";
import { Children, type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";

/**
 * "attention" and "critical" flag a count someone should act on (failed
 * runs, rules needing repair, overdue follow-ups). The value gains an icon
 * and a named status, so the signal never relies on color alone.
 */
export type MetricTone = "default" | "attention" | "critical";

/**
 * Whether the figure is known. "loading" and "unavailable" never show
 * `value`, so a stand-in zero can never read as a real total, and they drop
 * the tone, so a count we do not have is never flagged.
 */
export type MetricState = "ready" | "loading" | "unavailable";

export type MetricCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  /** Optional icon in the top corner (hidden on phones). */
  icon?: LucideIcon;
  tone?: MetricTone;
  /**
   * Tighter padding and a smaller value below sm (phones), for pages where
   * several summary cards come before the work itself. Every line stays;
   * from sm up the card is the same as the default.
   */
  compactOnPhone?: boolean;
  /**
   * Stay compact below this breakpoint. "sm" is `compactOnPhone`; "xl" keeps
   * the compact card through tablet and laptop widths, for a summary row that
   * should not push the work down before wide screens. Wins over
   * `compactOnPhone` when both are set.
   */
  compactUntil?: "sm" | "xl";
  state?: MetricState;
  /**
   * Shown in place of `detail` when `state` is "unavailable", e.g.
   * "Couldn't load the inbox totals."
   */
  unavailableReason?: ReactNode;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone: requestedTone = "default",
  compactOnPhone = false,
  compactUntil,
  state = "ready",
  unavailableReason = "Couldn't load this figure.",
  className,
}: MetricCardProps) {
  const tone = state === "ready" ? requestedTone : "default";
  const shownDetail = state === "unavailable" ? unavailableReason : detail;
  const compact = compactUntil ?? (compactOnPhone ? "sm" : undefined);
  return (
    <Card
      data-slot="metric-card"
      data-state={state}
      data-tone={tone}
      data-compact={
        compact === "sm" ? "phone" : compact === "xl" ? "until-xl" : undefined
      }
      className={cn(
        "min-w-0",
        !compact && "gap-1 py-3 sm:gap-2 sm:py-4",
        compact === "sm" && "gap-0.5 py-2 sm:gap-2 sm:py-4",
        compact === "xl" && "gap-0.5 py-2 xl:gap-2 xl:py-4",
        className,
      )}
    >
      <CardHeader className="gap-1">
        {/* The icon shares the label's row. A CardAction would switch the
            header to two columns even while hidden on phones, squeezing the
            value beside the label. */}
        <div className="flex min-w-0 items-start justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          {Icon ? (
            <Icon
              aria-hidden="true"
              className="hidden size-4 shrink-0 text-muted-foreground sm:block"
            />
          ) : null}
        </div>
        <CardTitle
          className={cn(
            "font-semibold tracking-tight tabular-nums",
            !compact && "text-lg sm:text-2xl",
            compact === "sm" && "text-base sm:text-2xl",
            compact === "xl" && "text-base xl:text-2xl",
          )}
        >
          <span
            className={cn(
              "flex items-center gap-1.5",
              tone === "critical" && "text-destructive",
            )}
          >
            {state === "loading" ? (
              <>
                <Skeleton
                  className={cn(
                    "w-16",
                    !compact && "h-6 sm:h-7",
                    compact === "sm" && "h-5 sm:h-7",
                    compact === "xl" && "h-5 xl:h-7",
                  )}
                />
                <span className="sr-only">Loading</span>
              </>
            ) : state === "unavailable" ? (
              <span className="text-muted-foreground">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not available</span>
              </span>
            ) : (
              value
            )}
            {tone === "default" ? null : (
              <>
                <CircleAlert
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    compact === "xl" ? "xl:size-5" : "sm:size-5",
                    tone === "attention" && "text-warning",
                  )}
                />
                <span className="sr-only">Needs attention</span>
              </>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      {shownDetail ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{shownDetail}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

/**
 * Column layout by card count, so no card sits alone on a row: three cards
 * share one row from small screens (the first spans the phone row), four
 * sit two to a row until extra-large screens.
 */
const GRID_LAYOUT: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1",
};
const DEFAULT_GRID_LAYOUT = "grid-cols-2 xl:grid-cols-4";

export function MetricGrid({
  children,
  className,
  label,
  busy = false,
}: {
  children: ReactNode;
  className?: string;
  /** Names the group for assistive technology, e.g. "Member Care summary". */
  label?: string;
  /** The values are still loading (aria-busy on the group). */
  busy?: boolean;
}) {
  const count = Children.toArray(children).length;
  return (
    <section
      aria-label={label}
      aria-busy={busy || undefined}
      data-count={count}
      className={cn(
        "grid gap-2 sm:gap-4",
        GRID_LAYOUT[count] ?? DEFAULT_GRID_LAYOUT,
        className,
      )}
    >
      {children}
    </section>
  );
}
