"use client";

import { Badge } from "@asym/ui/components/shadcn/badge-component";
import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  CircleAlert,
  CircleSlash,
  ExternalLink as ExternalIcon,
} from "lucide-react";
import { createContext, useContext, useId } from "react";

import { safeHref } from "../lib/contracts";

import type { Availability, Snapshot } from "../lib/factory";

/** Shared view context: identity scope, clock, freshness and navigation. */
export type ConsoleContextValue = {
  scope: string;
  now: number;
  paused: boolean;
  snapshot: Snapshot | null;
  /** True when the latest snapshot is current enough to authorize controls. */
  authority: boolean;
  /** Why controls are disabled, when they are. */
  authorityReason: string | null;
  openIssue: (issue: number) => void;
  openRun: (run: string) => void;
  openReport: (run: string) => void;
  selectTab: (tab: string) => void;
};

export const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function useConsole() {
  const value = useContext(ConsoleContext);
  if (!value) throw new Error("ConsoleContext is missing");
  return value;
}

export function Panel({
  title,
  description,
  action,
  children,
  level = 2,
  id,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  level?: 2 | 3;
  id?: string;
}) {
  const generated = useId();
  const headingId = id ?? `panel-${generated}`;
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            <Heading id={headingId} className="text-base">
              {title}
            </Heading>
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

export function When({
  value,
  fallback = "Not recorded",
}: {
  value: string | null | undefined;
  fallback?: string;
}) {
  if (!value) return <>{fallback}</>;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return <>{value}</>;
  return (
    <time
      dateTime={new Date(parsed).toISOString()}
      title={new Date(parsed).toISOString()}
    >
      {new Date(parsed).toLocaleString()}
    </time>
  );
}

/** "3m ago" relative to the shared clock, with the absolute time as a tooltip. */
export function Ago({ value }: { value: string | null | undefined }) {
  const { now } = useConsole();
  if (!value) return <>never</>;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || !now) return <When value={value} />;
  const seconds = Math.max(0, Math.round((now - parsed) / 1000));
  const text =
    seconds < 60
      ? `${seconds}s ago`
      : seconds < 3600
        ? `${Math.floor(seconds / 60)}m ago`
        : seconds < 86_400
          ? `${Math.floor(seconds / 3600)}h ago`
          : `${Math.floor(seconds / 86_400)}d ago`;
  return (
    <time
      dateTime={new Date(parsed).toISOString()}
      title={new Date(parsed).toLocaleString()}
    >
      {text}
    </time>
  );
}

const STATUS_VARIANT: Record<
  string,
  | "outline"
  | "info"
  | "warning"
  | "success"
  | "destructive-subtle"
  | "secondary"
  | "accent"
> = {
  running: "info",
  active: "info",
  pending: "outline",
  queued: "outline",
  waiting: "warning",
  paused: "warning",
  hold: "warning",
  held: "warning",
  parked: "warning",
  reconciled: "secondary",
  external: "secondary",
  drain: "warning",
  completed: "success",
  PR_READY: "success",
  MERGED: "success",
  CLEAR: "success",
  PASS: "success",
  open: "success",
  run: "secondary",
  failed: "destructive-subtle",
  BLOCKED: "destructive-subtle",
  FINDINGS: "warning",
  INCONCLUSIVE: "warning",
  FAIL: "destructive-subtle",
  stop: "destructive-subtle",
  stopped: "destructive-subtle",
  cancelled: "secondary",
  skipped: "secondary",
  "not-planned": "secondary",
  unobserved: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  PR_READY: "PR ready",
  MERGED: "merged",
  BLOCKED: "blocked",
  "not-planned": "not in this route",
  unobserved: "not observed",
  queued: "not admitted",
};

export function StatusBadge({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  return (
    <Badge variant={STATUS_VARIANT[value] ?? "outline"}>
      {label ??
        STATUS_LABEL[value] ??
        value.replaceAll("_", " ").replaceAll("-", " ")}
    </Badge>
  );
}

/** A capability or fact that is not available; never rendered as healthy. */
export function Unavailable({
  title = "Unavailable",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <CircleSlash aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <div className="mt-1 break-words">{children}</div>
      </div>
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive p-4 text-sm"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-destructive"
      />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

export function LoadingRows({
  label,
  rows = 3,
}: {
  label: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

/**
 * Says, inside a view that acts on its own read (the issue sheet, the run
 * dialog), that the read has gone stale. Those views are modal, so the page's
 * connection status is out of reach behind them. The region stays mounted and
 * empty while the read is fresh, so the change itself is announced politely.
 */
export function StaleNotice({
  stale,
  children,
}: {
  stale: boolean;
  children: React.ReactNode;
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-sm text-muted-foreground"
    >
      {stale ? children : null}
    </p>
  );
}

/**
 * Render one snapshot section: loading, unavailable (with its reason and the
 * time the failure was observed) or the data.
 */
export function Section<T>({
  value,
  loading,
  label,
  children,
}: {
  value: Availability<T> | null | undefined;
  loading: boolean;
  label: string;
  children: (data: T, observedAt: string) => React.ReactNode;
}) {
  if (!value)
    return loading ? (
      <LoadingRows label={`Loading ${label}…`} />
    ) : (
      <Unavailable>No {label} has been read yet.</Unavailable>
    );
  if (value.state === "unavailable")
    return (
      <Unavailable
        title={`${label[0].toUpperCase()}${label.slice(1)} unavailable`}
      >
        <p>{value.reason}</p>
        <p className="mt-1 text-xs">
          Observed <When value={value.observedAt} />. Nothing is inferred while
          it is unavailable.
        </p>
      </Unavailable>
    );
  return <>{children(value.data, value.observedAt)}</>;
}

export function Facts({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
      {children}
    </dl>
  );
}

export function Fact({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="font-medium text-muted-foreground">{term}</dt>
      <dd className="min-w-0 break-words sm:col-span-2">{children}</dd>
    </>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="break-all font-mono text-xs">{children}</span>;
}

export function LongText({ children }: { children: React.ReactNode }) {
  return <p className="whitespace-pre-wrap break-words text-sm">{children}</p>;
}

export function IssueButton({
  issue,
  children,
}: {
  issue: number;
  children?: React.ReactNode;
}) {
  const { openIssue } = useConsole();
  return (
    <Button
      variant="link"
      size="sm"
      className="max-w-full"
      onClick={() => openIssue(issue)}
    >
      <span className="truncate">{children ?? `#${issue}`}</span>
    </Button>
  );
}

export function RunButton({
  run,
  children,
}: {
  run: string;
  children?: React.ReactNode;
}) {
  const { openRun } = useConsole();
  return (
    <Button
      variant="link"
      size="sm"
      className="max-w-full"
      onClick={() => openRun(run)}
    >
      <span className="truncate font-mono text-xs">{children ?? run}</span>
    </Button>
  );
}

/** Only https links to an allowed host are rendered as anchors. */
export function ExternalLink({
  href,
  children,
  hosts,
}: {
  href: string | null | undefined;
  children: React.ReactNode;
  hosts?: readonly string[];
}) {
  const safe = safeHref(href, hosts);
  if (!safe) return <span className="break-words">{children}</span>;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex max-w-full items-center gap-1 break-all text-primary underline underline-offset-4"
    >
      {children}
      <ExternalIcon aria-hidden="true" className="size-3 shrink-0" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function TextList({
  items,
  empty = "None recorded",
}: {
  items: readonly string[] | null | undefined;
  empty?: string;
}) {
  if (!items?.length) return <EmptyNote>{empty}</EmptyNote>;
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} className="break-words">
          {item}
        </li>
      ))}
    </ul>
  );
}
