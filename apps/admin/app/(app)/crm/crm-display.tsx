import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import { DATA_GRID_ROW_PRIMARY_ATTRIBUTE } from "@asym/ui/components/data-grid-panel";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { format, isValid, parseISO } from "date-fns";
import { RefreshCw } from "lucide-react";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

/**
 * Display helpers shared by the CRM records grid, kanban board, record
 * drawer, notes and relationships.
 *
 * Money: `donors.total_given` (`lifetimeGiving`, `lifetimeGivingCents`) and
 * relationship commitments are BIGINT integer cents, so they go through the
 * shared contribution formatter (cents / 100), never `formatCurrency`, which
 * expects dollars.
 */
export function formatCrmMoneyCents(
  amountCents: number | null | undefined,
  currencyCode?: string | null,
): string {
  return formatSharedContributionAmount(
    amountCents ?? 0,
    currencyCode || "USD",
  );
}

/** Copy for a failed read whose cause is unknown (a 500, a failed query). */
export const CRM_LOAD_ERROR_NEXT_STEP =
  "Something went wrong while loading. Retry, or try again in a few minutes.";

/** Messages browsers use when a request never reached the server. */
const NETWORK_FAILURE_MESSAGE =
  /^(failed to fetch|load failed|network ?error( when attempting to fetch resource)?|network request failed)\.?$/i;

/**
 * Inline error copy for a failed CRM read. The data hooks fall back to
 * "Failed to load … (status)" when the server sends no reason; that only
 * repeats the error title and says nothing about the cause, so it becomes a
 * cause-neutral next step. Only the browser's own network failure is called a
 * connection problem. A server-provided reason is shown as is.
 */
export function crmLoadErrorMessage(error: Error): string {
  const message = error.message.trim();
  if (NETWORK_FAILURE_MESSAGE.test(message)) {
    return "Check your connection, then retry.";
  }
  return !message || /^failed to load\b/i.test(message)
    ? CRM_LOAD_ERROR_NEXT_STEP
    : message;
}

/** A read the server refused for lack of staff CRM access. */
export function isCrmPermissionError(error: Error | null | undefined) {
  const message = error?.message.toLowerCase() ?? "";
  return message.includes("forbidden") || message.includes("unauthorized");
}

/**
 * The grid panel's inline error for a failed CRM read. An access denial is
 * one message with no Retry (retrying cannot grant access); any other
 * failure keeps a working Retry.
 */
export function crmPanelError(
  error: Error | null | undefined,
  { resource, onRetry }: { resource: string; onRetry: () => void },
): { title: string; message: string; onRetry?: () => void } | null {
  if (!error) return null;
  if (isCrmPermissionError(error)) {
    return {
      title: "Access required",
      message:
        "Your account doesn't have staff access to this organization's CRM. Ask an administrator for access.",
    };
  }
  return {
    title: `Couldn't load ${resource}`,
    message: crmLoadErrorMessage(error),
    onRetry,
  };
}

/** "Oct 31, 2026", or null for a missing or unparseable value. */
export function formatCrmDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : null;
}

/** "individual" -> "Individual", "at_risk" -> "At risk". */
export function toCrmLabel(value: string): string {
  const spaced = value.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Two-letter initials for avatar fallbacks. */
export function crmInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]![0]}${parts[parts.length - 1]![0]}`
      : (parts[0]?.slice(0, 2) ?? "");
  return letters.toUpperCase() || "?";
}

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

/**
 * One key per stored CRM value. Writers stored types and statuses in several
 * spellings (`at_risk` from the seed, `At Risk` from the missionary portal,
 * `Church` and `church`), so labels, badges and board lanes compare this key,
 * and the records API matches every spelling of a filter value.
 */
export function normalizeCrmVocabulary(
  value: string | null | undefined,
): string | null {
  const key = (value ?? "")
    .trim()
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .join("_");
  return key || null;
}

/** Record types records carry; values are canonical keys. */
export const CRM_RECORD_TYPE_OPTIONS = [
  { label: "Individual", value: "individual" },
  { label: "Church", value: "church" },
  { label: "Foundation", value: "foundation" },
  { label: "Organization", value: "organization" },
];

/** Statuses records carry; values are canonical keys. */
export const CRM_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "New", value: "new" },
  { label: "At risk", value: "at_risk" },
  { label: "Lapsed", value: "lapsed" },
  { label: "Inactive", value: "inactive" },
];

const LIFECYCLE_BADGE_VARIANT: Record<string, BadgeVariant> = {
  active: "success",
  new: "info",
  prospect: "info",
  lapsed: "warning",
  at_risk: "warning",
  inactive: "outline",
  archived: "outline",
};

/** Lifecycle order for board columns; unknown statuses follow, A-Z. */
export const CRM_LIFECYCLE_ORDER = [
  "active",
  "new",
  "prospect",
  "at_risk",
  "lapsed",
  "inactive",
  "archived",
];

/** The one state badge a CRM row carries. */
export function CrmStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const key = normalizeCrmVocabulary(status);
  if (!key) return <CrmEmptyValue />;
  return (
    <Badge variant={LIFECYCLE_BADGE_VARIANT[key] ?? "outline"}>
      {toCrmLabel(key)}
    </Badge>
  );
}

/**
 * Where a CRM list's rows come from, shown once below the list on Notes and
 * Relationships: the store (Mission Control's own database, Asym Postgres)
 * and optional source-system copy.
 *
 * The notes and relationships APIs also return `rollback.existingCrmPath`
 * ("/crm"), a contract field naming the records page to fall back to. It is
 * not a data source, staff cannot act on it, and "Rollback" reads like a
 * retired-vendor path, so it stays in the data and out of the UI.
 */
export function CrmDataSources({
  mode,
  configured = true,
  children,
}: {
  mode: string;
  configured?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label="Data sources"
        className="flex flex-wrap items-center gap-2"
      >
        <span
          aria-hidden="true"
          className="text-xs font-medium text-muted-foreground"
        >
          Data sources
        </span>
        <Badge variant={configured ? "outline" : "warning"}>
          {mode === "local" ? "Mission Control" : "CRM"}
        </Badge>
      </div>
      {children}
    </div>
  );
}

/**
 * A CRM list's Refresh. `compact` (phones) keeps the name on an icon button
 * beside the search, so the toolbar spends one row fewer before the list.
 */
export function CrmRefreshButton({
  compact = false,
  refreshing,
  onRefresh,
}: {
  compact?: boolean;
  refreshing: boolean;
  onRefresh: () => unknown;
}) {
  return (
    <Button
      variant="outline"
      size={compact ? "icon-sm" : "sm"}
      aria-label={compact ? "Refresh" : undefined}
      disabled={refreshing}
      onClick={() => void onRefresh()}
    >
      {refreshing ? <Spinner /> : <RefreshCw aria-hidden="true" />}
      {compact ? null : "Refresh"}
    </Button>
  );
}

/** Placeholder for a missing value: a muted dash read as "Not set". */
export function CrmEmptyValue() {
  return (
    // relative: keeps the sr-only label inside horizontally scrolling grids.
    <span className="relative text-muted-foreground">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not set</span>
    </span>
  );
}

/**
 * Marks a CRM record's open control outside a data grid (a board card), so
 * CrmSkipLink can land on it the way it lands on a grid row's primary.
 */
export const CRM_RECORD_OPEN_ATTRIBUTE = "data-crm-record-open";

/**
 * "Skip to …" for a CRM list: the page actions and the list toolbar put
 * dozens of Tab stops before the first row. Hidden until focused, so it
 * never moves the layout (sr-only would drop its padding when shown). It
 * lands on the first row's or board card's open control, else the list's
 * search, else the list box itself (`targetId`, focusable with tabIndex
 * -1). Its parent must be positioned (`relative`).
 */
export function CrmSkipLink({
  targetId,
  children,
}: {
  targetId: string;
  children: ReactNode;
}) {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const frame = document.getElementById(targetId);
    if (!frame) return;
    event.preventDefault();
    const target =
      frame.querySelector<HTMLElement>(
        `[${DATA_GRID_ROW_PRIMARY_ATTRIBUTE}], [${CRM_RECORD_OPEN_ATTRIBUTE}]`,
      ) ??
      frame.querySelector<HTMLElement>('input[role="searchbox"]') ??
      frame;
    frame.scrollIntoView?.({ block: "start" });
    target.focus({ preventScroll: true });
  };
  return (
    <a
      href={`#${targetId}`}
      onClick={skip}
      className="pointer-events-none absolute top-0 left-0 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground opacity-0 shadow-md outline-none focus:pointer-events-auto focus:opacity-100 focus:ring-2 focus:ring-ring"
    >
      {children}
    </a>
  );
}
