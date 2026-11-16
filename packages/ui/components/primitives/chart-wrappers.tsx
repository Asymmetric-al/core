"use client";

import { TrendingUp, TrendingDown, AlertCircle, Inbox } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from "../shadcn/card";
import { Skeleton } from "../shadcn/skeleton";

// --- ChartCard ---

interface ChartCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  description?: string;
  /**
   * A sentence or two that says what the chart shows, for people who cannot
   * see it. Read out with the chart; visually hidden.
   */
  summary?: React.ReactNode;
  /**
   * A visible caveat when the chart does not show the whole picture, such as
   * a capped or partial data set. Never chart partial data without one.
   */
  note?: React.ReactNode;
  /** Makes the title a heading at this level; omit to keep it plain text. */
  headingLevel?: 2 | 3 | 4;
  /** Shows a "Try again" button in the error state. */
  onRetry?: () => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  emptyMessage?: string;
  emptyCTA?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  summary,
  note,
  headingLevel,
  onRetry,
  actions,
  footer,
  isLoading,
  isEmpty,
  isError,
  errorTitle = "The chart could not load",
  errorMessage = "Check your connection and try again.",
  emptyMessage = "No data to show yet.",
  emptyCTA,
  children,
  className,
  ...props
}: ChartCardProps) {
  const titleId = React.useId();
  const summaryId = React.useId();
  const noteId = React.useId();
  const describedBy =
    [summary ? summaryId : null, note ? noteId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader
        className={
          actions
            ? "has-data-[slot=card-action]:grid-cols-[1fr_auto]"
            : undefined
        }
      >
        <div className="space-y-1">
          <CardTitle
            id={titleId}
            role={headingLevel ? "heading" : undefined}
            aria-level={headingLevel}
          >
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent className="min-h-50 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-2" role="status" aria-atomic="true">
            <span className="sr-only">Loading {title}</span>
            <Skeleton className="h-50 w-full rounded-lg" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="bg-destructive/10 p-3 rounded-full mb-3">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {errorTitle}
            </h3>
            <p className="text-xs text-muted-foreground max-w-50">
              {errorMessage}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRetry}
              >
                Try again
              </Button>
            )}
          </div>
        ) : isEmpty ? (
          <div
            role="status"
            aria-atomic="true"
            className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="bg-muted p-3 rounded-full mb-3">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">{emptyMessage}</p>
            {emptyCTA}
          </div>
        ) : (
          <figure
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            className="flex size-full flex-col gap-3 animate-in fade-in duration-300"
          >
            {children}
            {summary && (
              <figcaption id={summaryId} className="sr-only">
                {summary}
              </figcaption>
            )}
            {note && (
              <p id={noteId} className="text-xs text-muted-foreground">
                {note}
              </p>
            )}
          </figure>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="border-t bg-muted/5 py-3">{footer}</CardFooter>
      )}
    </Card>
  );
}

// --- ChartLegend ---

interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
}

interface ChartTooltipItem {
  color?: string;
  fill?: string;
  name?: string;
  value?: string | number | null;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  /** Formats numeric values; defaults to whole dollars for older charts. */
  formatValue?: (value: number) => string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-2", className)}
    >
      {items.map((item) => (
        <div
          key={`${item.label}-${item.color}-${item.value ?? "novalue"}`}
          className="flex items-center gap-2 group"
        >
          <div
            className="size-2 rounded-full shrink-0 bg-(--legend-color)"
            style={{ "--legend-color": item.color } as React.CSSProperties}
          />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
            {item.value !== undefined && (
              <span className="text-xs font-semibold">{item.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- ChartTooltip ---

function formatDollars(value: number) {
  return `$${value.toLocaleString()}`;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue = formatDollars,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover text-popover-foreground border-border/70 min-w-30 rounded-lg border p-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <p className="text-muted-foreground border-border/50 mb-2 border-b pb-1.5 text-xs font-semibold uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={`${item.name ?? "item"}-${item.color ?? item.fill ?? "nofill"}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="size-1.5 rounded-full bg-(--legend-color)"
                style={
                  {
                    "--legend-color": item.color || item.fill,
                  } as React.CSSProperties
                }
              />
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-tight">
                {item.name}
              </span>
            </div>
            <span className="text-foreground tabular-nums text-xs font-semibold">
              {typeof item.value === "number"
                ? formatValue(item.value)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- KpiTile ---

interface KpiTileProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  delta?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  className?: string;
}

type KpiDeltaTrend = NonNullable<KpiTileProps["delta"]>["trend"];

function kpiDeltaBadgeClass(trend: KpiDeltaTrend): string {
  switch (trend) {
    case "up":
      return "bg-success/10 text-success";
    case "down":
      return "bg-destructive/10 text-destructive";
    case "neutral":
      return "bg-muted text-muted-foreground";
    default: {
      const _exhaustive: never = trend;
      return _exhaustive;
    }
  }
}

function KpiTileLoading({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-40" />
    </Card>
  );
}

function KpiTileDeltaBadge({
  delta,
}: {
  delta: NonNullable<KpiTileProps["delta"]>;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-5 px-1.5 text-xs font-semibold border-none",
        kpiDeltaBadgeClass(delta.trend),
      )}
    >
      {delta.trend === "up" && <TrendingUp className="mr-1 size-3" />}
      {delta.trend === "down" && <TrendingDown className="mr-1 size-3" />}
      {delta.value}
    </Badge>
  );
}

export function KpiTile({
  label,
  value,
  subtitle,
  icon: Icon,
  delta,
  isLoading,
  isError,
  isEmpty,
  className,
}: KpiTileProps) {
  if (isLoading) {
    return <KpiTileLoading className={className} />;
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-colors hover:border-border",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {isEmpty ? "--" : value}
              </h3>
              {delta && !isEmpty && <KpiTileDeltaBadge delta={delta} />}
            </div>
            {(subtitle || (delta?.label && !isEmpty)) && (
              <p className="text-xs text-muted-foreground font-medium">
                {subtitle}{" "}
                {delta?.label && (
                  <span className="opacity-70">{delta.label}</span>
                )}
              </p>
            )}
          </div>
          {Icon && (
            <div className="bg-muted border-border/60 rounded-xl border p-2 transition-colors group-hover:bg-accent">
              <Icon className="text-muted-foreground size-5" />
            </div>
          )}
        </div>
        {isError && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center p-4 text-center backdrop-blur-[1px]">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span className="text-xs font-semibold">Error loading data</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
