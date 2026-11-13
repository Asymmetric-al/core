"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import { useMediaQuery } from "@asym/lib/hooks/use-mobile";
import {
  DataGridPanel,
  DataGridResetFilters,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridSortSelect,
  DataGridToolbarSpacer,
  DataGridViewOptions,
  DataGridViewToggle,
  DATA_GRID_ROW_PRIMARY_ATTRIBUTE,
  dataGridFeatures,
  useTable,
  type ColumnFiltersState,
  type DataGridColumnDef,
  type DataGridRow,
  type DataGridView,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@asym/ui/components/data-grid-panel";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import { DataGridColumnFilter } from "@asym/ui/components/reui/data-grid/data-grid-column-filter";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Item, ItemContent } from "@asym/ui/components/shadcn/item";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  HandCoins,
  ListFilter,
  Receipt,
  RotateCw,
  SearchX,
} from "lucide-react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  continueContributionBatch,
  readContributionBatchResponse,
  type ContributionBatchNextAction,
  type ContributionBatchResponse,
} from "./batch-continuation";
import {
  CONTRIBUTION_DEFAULT_COLUMNS_WIDTH,
  CONTRIBUTION_DEFAULT_HIDDEN_COLUMNS,
  CONTRIBUTION_PINNED_COLUMNS,
  ContributionDonorAvatar,
  ContributionStatusBadge,
  getContributionColumns,
  getVisibleContributionColumnsWidth,
  useContributionDateLabel,
} from "./columns";
import { ContributionReceiptStatus } from "./contribution-status";
import {
  contributionStatusOptions,
  contributionTypeOptions,
  formatPaymentMethod,
  paymentMethodOptions,
  sourceOptions,
} from "./data";
import { ContributionFreshnessIndicator } from "./freshness-indicator";
import {
  bulkReceiptRowsToSend,
  contributionDonorLabel,
  effectiveContributionStatus,
  formatCurrencyAmounts,
  isContributionLoadCapped,
  planBulkReceipt,
  summarizeContributions,
  type ContributionHubSummary,
} from "./hub-model";
import {
  ContributionNeedsAttentionPanel,
  needsAttentionGroupLabel,
} from "./needs-attention-panel";
import { OfflineGiftEntryDialog } from "./offline-gift/offline-gift-entry-dialog";
import {
  hubSharedContributionFilterChips,
  hubSharedFilterColumnVisibility,
} from "./shared-filters";
import {
  ADMIN_CONTRIBUTIONS_QUERY_KEY,
  type ContributionsLoadIssue,
} from "./use-admin-contributions";

import type { Contribution } from "./types";
import type { MissionControlNeedsAttentionGroup } from "@asym/database/hooks";
import type { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";

/** Where the gifts search box is wide enough for its scoped placeholder. */
const XL_MEDIA_QUERY = "(min-width: 1280px)";

/** The sidebar leaves only enough toolbar room for the Status facet here. */
const COMPACT_TOOLBAR_MEDIA_QUERY =
  "(min-width: 1024px) and (max-width: 1279px)";

/** The gifts grid's box: the "Skip to gifts" link's target. */
const CONTRIBUTION_GIFTS_ID = "contribution-gifts";

function formatSelectedContributionCount(count: number): string {
  return `${count} selected contribution${count === 1 ? "" : "s"}`;
}

function formatGiftCount(count: number): string {
  return `${count.toLocaleString("en-US")} gift${count === 1 ? "" : "s"}`;
}

function formatExcludedSelectionNote(count: number): string {
  return count === 1
    ? "1 selected contribution hidden by the current filters is not included."
    : `${count} selected contributions hidden by the current filters are not included.`;
}

const OFFLINE_GIFT_ENTRY_PERSISTENCE_ENABLED = false;

const EMPTY_NEEDS_ATTENTION_GROUPS: MissionControlNeedsAttentionGroup[] = [];

/** The search box filters through the donor column's multi-field matcher. */
const SEARCH_COLUMN_ID = "donorName";

const PRIMARY_FILTERS = [
  { id: "status", title: "Status", options: contributionStatusOptions },
  { id: "type", title: "Type", options: contributionTypeOptions },
  { id: "paymentMethod", title: "Payment", options: paymentMethodOptions },
] as const;

/**
 * Source sits behind More filters: its column starts hidden, so a primary
 * facet for it would filter on something the grid does not show.
 */
const SOURCE_FILTER_ID = "source";

/** Hidden filter-only column behind the Needs attention filter chip. */
const NEEDS_ATTENTION_FILTER_ID = "needsAttention";

/**
 * Wrapper around the Needs attention filter chip, where focus lands when
 * Needs attention sends staff to the grid.
 */
const NEEDS_ATTENTION_FILTER_SLOT = "contribution-needs-attention-filter";

/** Filters behind the More filters toggle (its count badge counts these). */
const MORE_FILTER_IDS: ReadonlySet<string> = new Set([
  NEEDS_ATTENTION_FILTER_ID,
  SOURCE_FILTER_ID,
  ...hubSharedContributionFilterChips.map((chip) => chip.id),
]);

const INITIAL_COLUMN_VISIBILITY: VisibilityState = {
  ...Object.fromEntries(
    CONTRIBUTION_DEFAULT_HIDDEN_COLUMNS.map((id) => [id, false]),
  ),
  // Filter-only columns behind the shared filter chips stay hidden; they
  // exist purely to evaluate shared filters.
  ...hubSharedFilterColumnVisibility,
  [NEEDS_ATTENTION_FILTER_ID]: false,
};

const INITIAL_SORTING: SortingState = [{ id: "date", desc: true }];

/** Sorts offered where gifts show as cards (phones and the card view). */
const CONTRIBUTION_SORT_LABELS: Record<string, string> = {
  "date:desc": "Newest first",
  "date:asc": "Oldest first",
  "amount:desc": "Amount: high to low",
  "amount:asc": "Amount: low to high",
};

/** Header sorts chosen in the table, named when the cards show them. */
const CONTRIBUTION_EXTRA_SORT_LABELS: Record<string, string> = {
  "status:asc": "Status: A–Z",
  "status:desc": "Status: Z–A",
  "type:asc": "Type: A–Z",
  "type:desc": "Type: Z–A",
  "paymentMethod:asc": "Payment method: A–Z",
  "paymentMethod:desc": "Payment method: Z–A",
  "source:asc": "Source: A–Z",
  "source:desc": "Source: Z–A",
};

const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

/** The grid panel's Card border (1px each side) around the table. */
const PANEL_BORDER_PX = 2;

const NO_PINNED_COLUMNS: typeof CONTRIBUTION_PINNED_COLUMNS = {
  start: [],
  end: [],
};

type Updater<T> = T | ((previous: T) => T);

/**
 * Search, filters, sort and page of the gifts grid. Owned above the grid so
 * the Needs attention panel can filter it. A new search, filter or sort
 * returns to the first page on purpose; gifts arriving or refreshing keep
 * staff on their page (the table's own page auto-reset is off).
 */
interface ContributionGridState {
  columnFilters: ColumnFiltersState;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  sorting: SortingState;
  setSorting: (updater: Updater<SortingState>) => void;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  moreFiltersOpen: boolean;
  setMoreFiltersOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * `initialNeedsAttentionKeys` opens the grid filtered to those
 * needs-attention kinds (Home's links), with More filters open so the
 * applied chip shows and can be removed.
 */
function useContributionGridState(
  initialNeedsAttentionKeys: readonly string[] = [],
): ContributionGridState {
  const [columnFilters, setColumnFilterState] = useState<ColumnFiltersState>(
    () =>
      initialNeedsAttentionKeys.length > 0
        ? [
            {
              id: NEEDS_ATTENTION_FILTER_ID,
              value: [...initialNeedsAttentionKeys],
            },
          ]
        : [],
  );
  const [sorting, setSortingState] = useState<SortingState>(INITIAL_SORTING);
  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(
    initialNeedsAttentionKeys.length > 0,
  );

  const toFirstPage = useCallback(() => {
    setPagination((previous) =>
      previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 },
    );
  }, []);
  const setColumnFilters = useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      setColumnFilterState(updater);
      toFirstPage();
    },
    [toFirstPage],
  );
  const setSorting = useCallback(
    (updater: Updater<SortingState>) => {
      setSortingState(updater);
      toFirstPage();
    },
    [toFirstPage],
  );

  return {
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    moreFiltersOpen,
    setMoreFiltersOpen,
  };
}

/** Gift id to the keys of the needs-attention groups that list it. */
function indexNeedsAttentionGroups(
  groups: readonly MissionControlNeedsAttentionGroup[],
): ReadonlyMap<string, string[]> {
  const index = new Map<string, string[]>();
  for (const group of groups) {
    for (const item of group.items) {
      if (!item.contributionId) {
        continue;
      }
      const keys = index.get(item.contributionId) ?? [];
      if (!keys.includes(group.key)) {
        keys.push(group.key);
      }
      index.set(item.contributionId, keys);
    }
  }
  return index;
}

/**
 * Hidden filter-only column behind the Needs attention chip: a gift matches
 * when a selected group lists it. Facets count gifts per group.
 */
function needsAttentionFilterColumn(
  index: ReadonlyMap<string, string[]>,
): DataGridColumnDef<Contribution> {
  return {
    id: NEEDS_ATTENTION_FILTER_ID,
    accessorFn: (row) => (index.has(row.id) ? "needs_attention" : null),
    getUniqueValues: (row) => index.get(row.id) ?? [],
    header: "Needs attention",
    enableHiding: false,
    enableSorting: false,
    enablePinning: false,
    filterFn: (row, _columnId, filterValue) => {
      if (!Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      const keys = index.get(row.original.id) ?? [];
      return keys.some((key) => filterValue.includes(key));
    },
  };
}

/**
 * Rendered width of an element, kept current with a ResizeObserver. Null
 * until the element has been laid out (and in environments without layout),
 * so callers keep their wide-panel defaults until a real width is known.
 */
function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = (next: number) => {
      if (next > 0) {
        setWidth(Math.round(next));
      }
    };
    // Measure before the first paint so a narrow panel never flashes the
    // wide column set.
    update(element.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === element);
      if (entry) {
        update(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

/** What the resend checkbox does, for one donor or several. */
function describeResendChoice({
  alreadySentCount,
  includeResends,
  resendLocked,
}: {
  alreadySentCount: number;
  includeResends: boolean;
  resendLocked: boolean;
}): string {
  const donors = alreadySentCount === 1 ? "this donor" : "these donors";
  const getsCopy = `${donors} will get a second copy.`;
  if (resendLocked) {
    return includeResends
      ? `This batch is saved with this choice, so ${getsCopy}`
      : `This batch is saved with this choice, so ${donors} ${alreadySentCount === 1 ? "is" : "are"} not sent another copy.`;
  }
  return includeResends
    ? `${getsCopy.charAt(0).toUpperCase()}${getsCopy.slice(1)}`
    : `Not sent unless ticked. If ticked, ${getsCopy}`;
}

/** The bulk dialog's description when every sendable gift has a receipt. */
function describeResendOnly({
  alreadySentCount,
  selectedCount,
  skippedCount,
  includeResends,
  resendLocked,
}: {
  alreadySentCount: number;
  selectedCount: number;
  /**
   * Gifts the batch cannot receipt (no processed gift record, payment not
   * completed, receipts suppressed). They have no receipt, so the dialog
   * must not say none of the selection needs a first one.
   */
  skippedCount: number;
  includeResends: boolean;
  resendLocked: boolean;
}): string {
  const one = alreadySentCount === 1;
  if (includeResends) {
    return one
      ? "Sends another copy of the receipt for the 1 gift that already has one."
      : `Sends another copy of the receipt for each of the ${alreadySentCount} gifts that already have one.`;
  }
  const rest =
    skippedCount > 0
      ? "none of the others can be sent a first receipt"
      : "none need a first one";
  const state = `${alreadySentCount} of ${formatSelectedContributionCount(selectedCount)} already ${one ? "has" : "have"} a receipt, and ${rest}.`;
  return resendLocked
    ? state
    : `${state} Tick the box below to send another copy.`;
}

function formatReceiptCount(count: number): string {
  return `${count.toLocaleString("en-US")} receipt${count === 1 ? "" : "s"}`;
}

/** The toast after a bulk receipt batch ends, in staff terms. */
function describeBulkReceiptOutcome(
  status: ContributionBatchResponse["batch"]["status"],
  { succeeded, failed, skipped }: ContributionBatchResponse["batch"]["summary"],
): string {
  if (status === "failed" || status === "cancelled") {
    return `The receipt batch ${status === "failed" ? "failed" : "was cancelled"}: ${succeeded} sent, ${failed} failed.`;
  }
  const problems = [
    failed > 0 ? `${failed} failed` : null,
    skipped > 0 ? `${skipped} skipped` : null,
  ].filter(Boolean);
  return problems.length > 0
    ? `Sent ${formatReceiptCount(succeeded)}; ${problems.join(" and ")}.`
    : `Sent ${formatReceiptCount(succeeded)}.`;
}

function BulkReceiptConfirmDialog({
  excludedCount,
  includeResends,
  onConfirm,
  onIncludeResendsChange,
  onOpenChange,
  open,
  processedCount,
  resendLocked,
  rows,
  submitting,
}: {
  /** Selected gifts the current filters hide; never sent. */
  excludedCount: number;
  /** Whether gifts that already have a receipt get another copy. */
  includeResends: boolean;
  onConfirm: () => void;
  onIncludeResendsChange: (includeResends: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  processedCount: number | null;
  /**
   * The batch is saved with its records, so the resend choice is fixed: a
   * retry continues that batch and must send what the dialog shows.
   */
  resendLocked: boolean;
  rows: Contribution[];
  submitting: boolean;
}) {
  const pendingActionLabelId = useId();
  const resendId = useId();
  const skippedListId = useId();

  const selectedCount = rows.length;
  const plan = useMemo(() => planBulkReceipt(rows), [rows]);
  const alreadySentCount = plan.alreadySent.length;
  const eligibleCount = bulkReceiptRowsToSend(plan, includeResends).length;
  const hasEligibleReceipts = eligibleCount > 0;
  const onlyResends = plan.ready.length === 0 && alreadySentCount > 0;
  // Only the gifts the batch sends count toward progress.
  const actionLabel = submitting
    ? processedCount === null
      ? "Starting batch..."
      : `Processing batch... ${Math.min(processedCount, eligibleCount)} of ${eligibleCount}`
    : hasEligibleReceipts
      ? onlyResends
        ? "Resend receipts"
        : "Send receipts"
      : onlyResends
        ? "No new receipts to send"
        : "No eligible receipts";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* With nothing ready, the only send left is another copy for
              gifts that already have a receipt, so the dialog asks about a
              resend instead of promising first receipts. */}
          <AlertDialogTitle>
            {onlyResends ? "Resend receipts?" : "Send receipts?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {onlyResends
              ? describeResendOnly({
                  alreadySentCount,
                  selectedCount,
                  skippedCount: plan.skippedCount,
                  includeResends,
                  resendLocked,
                })
              : `Sends a receipt for each ready gift among ${formatSelectedContributionCount(selectedCount)}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Two by two on phones, one row from sm. The 1px gap over the
            border colour draws the dividers in either layout. */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">
              Selected contributions
            </dt>
            <dd className="text-lg font-semibold text-foreground tabular-nums">
              {selectedCount}
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Ready to send</dt>
            <dd className="text-lg font-semibold text-foreground tabular-nums">
              {plan.ready.length}
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Already sent</dt>
            <dd className="text-lg font-semibold text-foreground tabular-nums">
              {alreadySentCount}
            </dd>
          </div>
          <div className="flex flex-col gap-1 bg-background p-3">
            <dt className="text-xs text-muted-foreground">Will be skipped</dt>
            <dd className="text-lg font-semibold text-foreground tabular-nums">
              {plan.skippedCount}
            </dd>
          </div>
        </dl>
        {/* A bulk send must not quietly give donors a duplicate receipt, so
            already-sent gifts are left out unless the admin opts in, as the
            single-gift "Resend receipt?" confirmation asks. */}
        {alreadySentCount > 0 ? (
          <Field orientation="horizontal">
            <Checkbox
              id={resendId}
              aria-describedby={`${resendId}-description`}
              checked={includeResends}
              disabled={submitting || resendLocked}
              onCheckedChange={(checked) =>
                onIncludeResendsChange(checked === true)
              }
            />
            <FieldContent>
              <FieldLabel htmlFor={resendId}>
                Send another copy for {alreadySentCount}{" "}
                {alreadySentCount === 1
                  ? "gift that already has a receipt"
                  : "gifts that already have a receipt"}
              </FieldLabel>
              <FieldDescription id={`${resendId}-description`}>
                {describeResendChoice({
                  alreadySentCount,
                  includeResends,
                  resendLocked,
                })}
              </FieldDescription>
            </FieldContent>
          </Field>
        ) : null}
        {/* "Ready" uses the server's resend_receipt rule, so skipped gifts
            are never sent and each skip names the server's reason. */}
        {plan.skipped.length > 0 ? (
          <div className="flex flex-col gap-1 text-sm">
            <p id={skippedListId} className="font-medium text-foreground">
              Skipped, and why
            </p>
            <ul
              aria-labelledby={skippedListId}
              className="flex flex-col gap-1 text-muted-foreground"
            >
              {plan.skipped.map(({ reason, count }) => (
                <li
                  className="flex items-baseline justify-between gap-3"
                  key={reason}
                >
                  <span>{reason}</span>
                  <span className="shrink-0 font-medium text-foreground tabular-nums">
                    {formatGiftCount(count)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Skipped gifts are not sent. You&apos;ll see how many sent and failed
          once the batch starts.
        </p>
        {excludedCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            {formatExcludedSelectionNote(excludedCount)}
          </p>
        ) : null}
        {!hasEligibleReceipts && !onlyResends ? (
          <p className="text-sm font-medium text-destructive">
            None of the selected gifts can be sent a receipt yet.
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button
            aria-labelledby={`${pendingActionLabelId}-1`}
            focusableWhenDisabled={submitting}
            disabled={submitting || !hasEligibleReceipts}
            onClick={() => {
              if (!submitting && hasEligibleReceipts) {
                onConfirm();
              }
            }}
          >
            <span id={`${pendingActionLabelId}-1`}>{actionLabel}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Which gifts the totals cover: all of them, or the most recent ones when the
 * load ceiling was reached or older pages failed. While older pages are on
 * their way the totals are held back, so this says how far the load has got.
 */
function describeSummaryScope(
  totalCount: number,
  isLoadingOlder: boolean,
  loadIssue: ContributionsLoadIssue | null,
): string {
  if (isLoadingOlder) {
    return `Loading all gifts · ${totalCount.toLocaleString("en-US")} so far`;
  }
  return isContributionLoadCapped(totalCount) || loadIssue?.kind === "older"
    ? `Most recent ${formatGiftCount(totalCount)}`
    : `All ${formatGiftCount(totalCount)}`;
}

/**
 * Inline note for a load problem after gifts are on screen: the rows stay
 * and Retry reloads only what failed.
 */
function ContributionLoadIssueNote({
  issue,
}: {
  issue: ContributionsLoadIssue;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
    >
      <AlertCircle aria-hidden="true" className="size-4 text-destructive" />
      <span>
        {issue.kind === "older"
          ? "Couldn't load older gifts."
          : "Couldn't refresh gifts; showing the last loaded list."}
      </span>
      <Button type="button" variant="outline" size="xs" onClick={issue.onRetry}>
        <RotateCw aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}

function ContributionSummarySection({
  summary,
  showFreshness,
  isLoadingOlder,
  loadIssue,
}: {
  summary: ContributionHubSummary;
  showFreshness: boolean;
  isLoadingOlder: boolean;
  loadIssue: ContributionsLoadIssue | null;
}) {
  const headingId = useId();
  const scope = describeSummaryScope(
    summary.totalCount,
    isLoadingOlder,
    loadIssue,
  );
  // Totals climb as older pages land; showing them mid-load would pass a
  // partial sum off as the total.
  const metricState = isLoadingOlder ? "loading" : "ready";

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isLoadingOlder || undefined}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2
            id={headingId}
            className="text-base font-semibold text-foreground"
          >
            Summary
          </h2>
          <p className="text-sm text-muted-foreground">{scope}</p>
        </div>
        <ContributionFreshnessIndicator show={showFreshness} />
      </div>
      {loadIssue ? <ContributionLoadIssueNote issue={loadIssue} /> : null}
      <MetricGrid className="lg:grid-cols-4">
        <MetricCard
          compactUntil="xl"
          state={metricState}
          label="Received"
          value={formatCurrencyAmounts(summary.received)}
          detail={
            summary.refundedCount > 0
              ? `${summary.receivedCount.toLocaleString("en-US")} completed · net of ${formatCurrencyAmounts(summary.refunded)} refunds`
              : `${summary.receivedCount.toLocaleString("en-US")} completed`
          }
        />
        <MetricCard
          compactUntil="xl"
          state={metricState}
          label="Pending"
          value={formatCurrencyAmounts(summary.pending)}
          detail={`${formatGiftCount(summary.pendingCount)} pending or processing`}
        />
        <MetricCard
          compactUntil="xl"
          state={
            metricState === "ready" && summary.average.length === 0
              ? "unavailable"
              : metricState
          }
          unavailableReason="No completed gifts to average yet."
          label="Average gift"
          value={formatCurrencyAmounts(summary.average)}
          detail="Per completed gift"
        />
        <MetricCard
          compactUntil="xl"
          state={metricState}
          label="Recurring"
          value={summary.recurringCount.toLocaleString("en-US")}
          detail={`Of ${formatGiftCount(summary.totalCount)}`}
        />
      </MetricGrid>
    </section>
  );
}

export function ContributionsMainBody({
  data,
  isLoading,
  isLoadingOlder = false,
  loadIssue = null,
  onSelectContribution,
  needsAttentionGroups = EMPTY_NEEDS_ATTENTION_GROUPS,
  needsAttentionFailed = false,
  onRetryNeedsAttention,
  onOpenContributionById,
  onBulkReceiptSuccess,
  showFreshness = false,
  onRefresh,
  initialNeedsAttentionKeys,
}: {
  data: Contribution[];
  isLoading: boolean;
  /**
   * Older pages are still loading behind the rows shown, so the summary
   * labels its totals as covering the gifts loaded so far.
   */
  isLoadingOlder?: boolean;
  /**
   * An older page or a refresh failed after gifts were shown. The rows stay
   * and the summary offers a retry of what failed.
   */
  loadIssue?: ContributionsLoadIssue | null;
  onSelectContribution: (c: Contribution) => void;
  needsAttentionGroups?: MissionControlNeedsAttentionGroup[];
  /**
   * The needs-attention check failed while gifts loaded, so its empty groups
   * must not read as "nothing needs attention".
   */
  needsAttentionFailed?: boolean;
  onRetryNeedsAttention?: () => void;
  onOpenContributionById?: (contributionId: string) => void;
  /**
   * Fired after a bulk receipt batch is accepted so the page can refresh the
   * shared contribution queries (ADR-CD-032), mirroring the detail overlay's
   * onActionSuccess contract.
   */
  onBulkReceiptSuccess?: () => void;
  /** Quiet "Updated just now" after shared data refreshes (ADR-CD-022). */
  showFreshness?: boolean;
  /** Reloads the list from the empty state. */
  onRefresh?: () => void;
  /** Needs-attention kinds to filter to on arrival (`?attention=`). */
  initialNeedsAttentionKeys?: readonly string[];
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const gridState = useContributionGridState(initialNeedsAttentionKeys);
  const { setColumnFilters, setMoreFiltersOpen } = gridState;
  const gridFrameRef = useRef<HTMLDivElement>(null);
  const [pendingBulkReceiptRows, setPendingBulkReceiptRows] = useState<
    Contribution[]
  >([]);
  const [pendingExcludedCount, setPendingExcludedCount] = useState(0);
  const [bulkReceiptProcessedCount, setBulkReceiptProcessedCount] = useState<
    number | null
  >(null);
  const [isBulkReceiptSubmitting, setIsBulkReceiptSubmitting] = useState(false);
  // Gifts that already have a receipt are resent only on explicit opt-in.
  const [includeBulkReceiptResends, setIncludeBulkReceiptResends] =
    useState(false);
  // Set once the batch is saved: its records, and so the resend choice,
  // are fixed for any retry.
  const [isBulkReceiptBatchSaved, setIsBulkReceiptBatchSaved] = useState(false);
  const isBulkReceiptSubmittingRef = useRef(false);
  // One token per selection, kept across retries: the server uses it as the
  // batch's id, so a retry after a lost response gets the batch it already
  // made instead of sending the receipts again.
  const bulkReceiptBatchTokenRef = useRef<string | null>(null);
  const bulkReceiptContinuationRef = useRef<ContributionBatchResponse | null>(
    null,
  );

  const summary = useMemo(() => summarizeContributions(data), [data]);

  const handleBulkReceipt = useCallback(
    (rows: Contribution[], excludedCount: number) => {
      if (rows.length === 0) {
        return;
      }
      bulkReceiptContinuationRef.current = null;
      setBulkReceiptProcessedCount(null);
      setIncludeBulkReceiptResends(false);
      setIsBulkReceiptBatchSaved(false);
      setPendingExcludedCount(excludedCount);
      setPendingBulkReceiptRows(rows);
    },
    [],
  );

  /**
   * Needs attention to grid: filter the gifts to the chosen groups, open
   * More filters so the applied chip shows, bring the grid into view and
   * move focus to that chip: a visible control that names the filter just
   * applied and removes it (the search box if the chip is not offered).
   */
  const showNeedsAttentionInGrid = useCallback(
    (groupKeys: string[]) => {
      setColumnFilters((previous) => [
        ...previous.filter((filter) => filter.id !== NEEDS_ATTENTION_FILTER_ID),
        { id: NEEDS_ATTENTION_FILTER_ID, value: groupKeys },
      ]);
      setMoreFiltersOpen(true);
      window.requestAnimationFrame(() => {
        const frame = gridFrameRef.current;
        frame?.scrollIntoView?.({ block: "start" });
        const target =
          frame?.querySelector<HTMLElement>(
            `[data-slot="${NEEDS_ATTENTION_FILTER_SLOT}"] button`,
          ) ?? frame?.querySelector<HTMLElement>('input[type="search"]');
        target?.focus({ preventScroll: true });
      });
    },
    [setColumnFilters, setMoreFiltersOpen],
  );

  // Skip link target: the first gift's open control, else the search box,
  // else the grid box itself (an empty workspace has nothing focusable).
  const skipToGifts = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const frame = gridFrameRef.current;
    if (!frame) {
      return;
    }
    event.preventDefault();
    const target =
      frame.querySelector<HTMLElement>(
        `[${DATA_GRID_ROW_PRIMARY_ATTRIBUTE}]`,
      ) ??
      frame.querySelector<HTMLElement>('input[type="search"]') ??
      frame;
    frame.scrollIntoView?.({ block: "start" });
    target.focus({ preventScroll: true });
  }, []);

  const handleBulkReceiptDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isBulkReceiptSubmitting) {
        bulkReceiptContinuationRef.current = null;
        bulkReceiptBatchTokenRef.current = null;
        setBulkReceiptProcessedCount(null);
        setIncludeBulkReceiptResends(false);
        setIsBulkReceiptBatchSaved(false);
        setPendingBulkReceiptRows([]);
      }
    },
    [isBulkReceiptSubmitting],
  );

  const submitBulkReceipt = useCallback(async () => {
    // Send only gifts the server would receipt; the dialog listed the rest
    // as skipped, and sending them would only fail and open follow-up tasks.
    // Gifts that already have a receipt go only when the admin opted in.
    const selectedRows = pendingBulkReceiptRows;
    const rows = bulkReceiptRowsToSend(
      planBulkReceipt(selectedRows),
      includeBulkReceiptResends,
    );
    // A saved batch continues with its own records, whatever the rows say.
    if (
      (rows.length === 0 && !bulkReceiptContinuationRef.current) ||
      isBulkReceiptSubmittingRef.current
    ) {
      return;
    }

    isBulkReceiptSubmittingRef.current = true;
    setIsBulkReceiptSubmitting(true);
    try {
      let batchResponse = bulkReceiptContinuationRef.current;
      if (!batchResponse) {
        bulkReceiptBatchTokenRef.current ??= crypto.randomUUID();
        const response = await fetch("/api/admin/contribution-batches", {
          body: JSON.stringify({
            actionType: "resend_receipt",
            confirmationToken: bulkReceiptBatchTokenRef.current,
            reason: "Bulk receipt resend requested from Contribution Hub.",
            records: rows.map((row) => ({
              id: row.id,
              receiptStatus: row.receiptStatus,
              stagedGiftId: row.stagedGiftId,
            })),
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });
        batchResponse = await readContributionBatchResponse(
          response,
          "Bulk receipt send failed.",
        );
        bulkReceiptContinuationRef.current = batchResponse;
        setIsBulkReceiptBatchSaved(true);
      }

      const rememberContinuationAction = (
        action: ContributionBatchNextAction,
      ) => {
        const currentBatch = bulkReceiptContinuationRef.current?.batch;
        if (currentBatch) {
          bulkReceiptContinuationRef.current = {
            batch: currentBatch,
            nextAction: action,
          };
        }
      };
      const body = await continueContributionBatch({
        fetcher: fetch,
        initialResponse: batchResponse,
        onContinuationAction: rememberContinuationAction,
        onProgress: (batch) => {
          setBulkReceiptProcessedCount(batch.summary.processed);
          bulkReceiptContinuationRef.current = {
            batch,
            nextAction: bulkReceiptContinuationRef.current?.nextAction,
          };
        },
      });
      const batchStatus = body.batch.status;
      bulkReceiptContinuationRef.current = null;
      bulkReceiptBatchTokenRef.current = null;

      const outcome = describeBulkReceiptOutcome(
        batchStatus,
        body.batch.summary,
      );
      if (batchStatus === "failed" || batchStatus === "cancelled") {
        toast.error(outcome);
      } else if (batchStatus === "complete_with_issues") {
        toast.warning(outcome);
      } else {
        toast.success(outcome);
      }
      setBulkReceiptProcessedCount(null);
      setIsBulkReceiptBatchSaved(false);
      setPendingBulkReceiptRows([]);
      setRowSelection({});
      onBulkReceiptSuccess?.();
    } catch (error) {
      // AlertDialog may request closure after its action event. Reopen it on
      // failure so the operator can retry the saved process action instead of
      // creating a second persisted batch.
      setPendingBulkReceiptRows(selectedRows);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send receipts in bulk.",
      );
    } finally {
      isBulkReceiptSubmittingRef.current = false;
      setIsBulkReceiptSubmitting(false);
    }
  }, [pendingBulkReceiptRows, includeBulkReceiptResends, onBulkReceiptSuccess]);

  return (
    <div className="relative flex flex-col gap-4 sm:gap-6">
      {/* Needs attention, the summary and the grid toolbar put dozens of
          Tab stops before the first gift; this link jumps straight to it.
          Hidden until focused, so it never moves the layout. Below md the
          visible link below replaces it. */}
      <a
        href={`#${CONTRIBUTION_GIFTS_ID}`}
        onClick={skipToGifts}
        className="pointer-events-none absolute top-0 left-0 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground opacity-0 shadow-md outline-none focus:pointer-events-auto focus:opacity-100 focus:ring-2 focus:ring-ring max-md:hidden"
      >
        Skip to gifts
      </a>
      {summary.totalCount > 0 ? (
        // Below md (phones and small tablets, where gifts show as cards)
        // Needs attention and the summary stack above the gifts and push the
        // first one below the fold; touch users get a visible way to them.
        <ButtonLink
          variant="outline"
          size="sm"
          className="self-start md:hidden"
          render={<a href={`#${CONTRIBUTION_GIFTS_ID}`} />}
          onClick={skipToGifts}
        >
          <ArrowDown aria-hidden="true" />
          Jump to gifts
        </ButtonLink>
      ) : null}
      <BulkReceiptConfirmDialog
        excludedCount={pendingExcludedCount}
        includeResends={includeBulkReceiptResends}
        onConfirm={submitBulkReceipt}
        onIncludeResendsChange={setIncludeBulkReceiptResends}
        onOpenChange={handleBulkReceiptDialogOpenChange}
        open={pendingBulkReceiptRows.length > 0}
        processedCount={bulkReceiptProcessedCount}
        resendLocked={isBulkReceiptBatchSaved}
        rows={pendingBulkReceiptRows}
        submitting={isBulkReceiptSubmitting}
      />

      <ContributionNeedsAttentionPanel
        groups={needsAttentionGroups}
        failed={needsAttentionFailed}
        onRetry={onRetryNeedsAttention}
        onOpenContribution={(contributionId) => {
          const contribution = data.find((row) => row.id === contributionId);
          if (contribution) {
            onSelectContribution(contribution);
            return;
          }
          onOpenContributionById?.(contributionId);
        }}
        onShowInGrid={showNeedsAttentionInGrid}
      />

      {/* With no gifts at all the grid's empty state says so once; a
          Summary over nothing would repeat it. Freshness after an action
          (e.g. on a deep-linked gift) still shows on its own. */}
      {summary.totalCount > 0 ? (
        <ContributionSummarySection
          summary={summary}
          showFreshness={showFreshness}
          isLoadingOlder={isLoadingOlder}
          loadIssue={loadIssue}
        />
      ) : showFreshness ? (
        <div className="flex justify-end">
          <ContributionFreshnessIndicator show />
        </div>
      ) : null}

      <ContributionResultsGrid
        data={data}
        isLoading={isLoading}
        gridState={gridState}
        frameRef={gridFrameRef}
        needsAttentionGroups={needsAttentionGroups}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onSelectContribution={onSelectContribution}
        onBulkReceipt={handleBulkReceipt}
        onRefresh={onRefresh}
      />
    </div>
  );
}

/**
 * Whether the header has any action, so the page passes none at all (and
 * the header keeps no empty action row) when there is nothing to show.
 * Offline gift entry stays behind its persistence flag until its database
 * dependencies are bound.
 */
export function hasContributionsPageActions(canManageContributions = false) {
  return OFFLINE_GIFT_ENTRY_PERSISTENCE_ENABLED && canManageContributions;
}

export function ContributionsPageActions({
  canManageContributions = false,
}: {
  canManageContributions?: boolean;
} = {}) {
  const queryClient = useQueryClient();
  const [offlineEntryOpen, setOfflineEntryOpen] = useState(false);

  if (!hasContributionsPageActions(canManageContributions)) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setOfflineEntryOpen(true)}>
        <HandCoins aria-hidden="true" />
        Enter offline gift
      </Button>
      <OfflineGiftEntryDialog
        open={offlineEntryOpen}
        onOpenChange={setOfflineEntryOpen}
        onRecorded={() => {
          toast.success("Offline gift recorded.");
          void queryClient.invalidateQueries({
            queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
          });
        }}
      />
    </>
  );
}

function ContributionMobileRow({
  row,
  selected,
  onOpen,
}: {
  row: DataGridRow<Contribution>;
  selected: boolean;
  onOpen: (contribution: Contribution) => void;
}) {
  const contribution = row.original;
  const donorLabel = contributionDonorLabel(contribution);
  const dateLabel = useContributionDateLabel(contribution.date);

  // Checkbox and avatar form the card's leading edge; the donor, amount and
  // status rows share one content column, so the status row starts exactly
  // under the donor name.
  return (
    <Item variant="outline" size="sm" render={<div />}>
      <label className="mt-1 flex size-6 shrink-0 cursor-pointer items-center justify-center self-start">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        />
        <span className="sr-only">
          Select contribution {contribution.id} from {donorLabel}
        </span>
      </label>
      {/* Decorative initials; phones spend the width on the gift details. */}
      <span className="hidden shrink-0 self-start sm:flex">
        <ContributionDonorAvatar contribution={contribution} />
      </span>
      {/* Top-aligned: cards in one row share a height, and a donor name
          that wraps must not shift its neighbours' content down. */}
      <ItemContent className="min-w-0 gap-2 self-start">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <DataGridRowPrimary
            className="grow"
            onClick={() => onOpen(contribution)}
          >
            <span className="min-w-0">
              {/* Long organisation names wrap to a second line rather than
                  lose the part that tells similar donors apart. */}
              <span className="line-clamp-2 block text-sm font-medium break-words text-foreground">
                {donorLabel}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {contribution.shared.designationSummary.fundName}
              </span>
            </span>
          </DataGridRowPrimary>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-sm font-medium whitespace-nowrap text-foreground tabular-nums">
              {formatSharedContributionAmount(
                contribution.shared.amountCents,
                contribution.shared.currencyCode,
              )}
            </span>
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {dateLabel}
            </span>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <ContributionStatusBadge
            status={effectiveContributionStatus(contribution)}
          />
          {/* Receipt state, as in the grid's Receipt column. */}
          <ContributionReceiptStatus
            status={contribution.shared.receiptStatus}
          />
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {contribution.type} ·{" "}
          {formatPaymentMethod(contribution.paymentMethod)}
        </span>
      </ItemContent>
    </Item>
  );
}

function ContributionsEmptyState({
  isFiltered,
  onClearFilters,
  onRefresh,
}: {
  isFiltered: boolean;
  onClearFilters: () => void;
  onRefresh?: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isFiltered ? <SearchX /> : <HandCoins />}
        </EmptyMedia>
        {/* A filtered miss and a brand-new account read differently. */}
        <EmptyTitle>
          {isFiltered ? "No contributions found" : "No contributions yet"}
        </EmptyTitle>
        <EmptyDescription>
          {isFiltered
            ? "No gifts match the current search or filters."
            : // Staff can record gifts here only once offline entry is on.
              // No single channel is named: card, bank-transfer and phone
              // gifts all arrive here.
              OFFLINE_GIFT_ENTRY_PERSISTENCE_ENABLED
              ? "Gifts appear here as soon as they're received or staff record them."
              : "Gifts appear here as soon as they're received."}
        </EmptyDescription>
      </EmptyHeader>
      {isFiltered ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        </EmptyContent>
      ) : onRefresh ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RotateCw aria-hidden="true" />
            Refresh
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

/**
 * The gifts grid. Below the md breakpoint rows always render as cards; from
 * md up staff switch between table rows and a grid of the same cards with
 * the Table view / Card view toggle (the column menu applies to the table
 * only, so it steps aside in card view).
 *
 * Column fit ranks fields as the mobile card does (donor, amount, date,
 * status, fund, then receipt). When the panel is too narrow for the full
 * default set (a 1024px window with the sidebar open), the Fund column moves
 * into View and the fund becomes the donor's second line, and the
 * decorative avatar gives its width to the donor name. If the visible
 * columns still overflow (narrow tablets, or extra columns from View), the
 * checkbox and donor pin to the start and the row actions to the end, so
 * every row stays identifiable and actionable while the middle scrolls.
 *
 * Bulk actions act on the selected gifts the current search and filters
 * show; selected gifts the filters hide are
 * named in the bar and never sent.
 */
function ContributionResultsGrid({
  data,
  isLoading,
  gridState,
  frameRef,
  needsAttentionGroups,
  rowSelection,
  onRowSelectionChange,
  onSelectContribution,
  onBulkReceipt,
  onRefresh,
}: {
  data: Contribution[];
  isLoading: boolean;
  gridState: ContributionGridState;
  /** The grid's outer box: measured for column fit, scrolled to from Needs attention. */
  frameRef: RefObject<HTMLDivElement | null>;
  needsAttentionGroups: MissionControlNeedsAttentionGroup[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
  onSelectContribution: (c: Contribution) => void;
  onBulkReceipt: (rows: Contribution[], excludedCount: number) => void;
  onRefresh?: () => void;
}) {
  const moreFiltersId = useId();
  const {
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    moreFiltersOpen,
    setMoreFiltersOpen,
  } = gridState;
  const frameWidth = useElementWidth(frameRef);
  const [view, setView] = useState<DataGridView>("table");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    INITIAL_COLUMN_VISIBILITY,
  );
  // Null until staff show or hide Fund / designation themselves in View.
  const [fundColumnChoice, setFundColumnChoice] = useState<boolean | null>(
    null,
  );
  const [columnPinning, setColumnPinning] = useState(
    CONTRIBUTION_PINNED_COLUMNS,
  );

  const gridWidth = frameWidth == null ? null : frameWidth - PANEL_BORDER_PX;
  const fundColumnFits =
    gridWidth == null || gridWidth >= CONTRIBUTION_DEFAULT_COLUMNS_WIDTH;
  const visibleColumns = useMemo<VisibilityState>(
    () => ({
      ...columnVisibility,
      fundName: fundColumnChoice ?? fundColumnFits,
    }),
    [columnVisibility, fundColumnChoice, fundColumnFits],
  );
  const columnsOverflow =
    gridWidth != null &&
    getVisibleContributionColumnsWidth(visibleColumns) > gridWidth;

  const handleColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
    const next =
      typeof updater === "function" ? updater(visibleColumns) : updater;
    const nextFundVisible = next.fundName !== false;
    if (nextFundVisible !== visibleColumns.fundName) {
      setFundColumnChoice(nextFundVisible);
    }
    setColumnVisibility(next);
  };

  const showAvatar = fundColumnFits;
  const fundInDonorLine = visibleColumns.fundName === false;
  const needsAttentionIndex = useMemo(
    () => indexNeedsAttentionGroups(needsAttentionGroups),
    [needsAttentionGroups],
  );
  const columns = useMemo(
    () => [
      ...getContributionColumns({
        onViewContribution: onSelectContribution,
        donorCellLayout: { showAvatar, fundInDonorLine },
      }),
      needsAttentionFilterColumn(needsAttentionIndex),
    ],
    [fundInDonorLine, needsAttentionIndex, onSelectContribution, showAvatar],
  );

  const table = useTable({
    features: dataGridFeatures,
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    // Gifts arriving page by page, and refreshes after an action, must not
    // bounce staff back to page 1; search, filter and sort changes reset the
    // page through the grid state instead.
    autoResetPageIndex: false,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination,
      columnVisibility: visibleColumns,
      // Pinning only while the columns overflow; otherwise the table reads
      // as one surface with no sticky seams.
      columnPinning: columnsOverflow ? columnPinning : NO_PINNED_COLUMNS,
    },
    onRowSelectionChange,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnPinningChange: setColumnPinning,
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  // When the list shrinks under staff (a refresh, or a filter matching
  // fewer gifts), stay on the last page that still has gifts. Runs before
  // paint, so an empty page never shows.
  const lastPageIndex = Math.max(
    0,
    Math.ceil(filteredCount / pagination.pageSize) - 1,
  );
  useLayoutEffect(() => {
    if (pagination.pageIndex > lastPageIndex) {
      setPagination((previous) => ({ ...previous, pageIndex: lastPageIndex }));
    }
  }, [lastPageIndex, pagination.pageIndex, setPagination]);

  // Selection is keyed by the stable gift id, so it survives sorting,
  // filtering and refreshed data. Bulk actions act on the selected gifts
  // the filters show; the rest are counted so the bar can say so.
  const selectedRows = filteredRows
    .filter((row) => rowSelection[row.id])
    .map((row) => row.original);
  const selectedTotal = data.reduce(
    (count, row) => (rowSelection[row.id] ? count + 1 : count),
    0,
  );
  const hiddenSelectedCount = selectedTotal - selectedRows.length;
  const searchValue =
    (columnFilters.find((filter) => filter.id === SEARCH_COLUMN_ID)?.value as
      string | undefined) ?? "";
  const isCompactToolbar = useMediaQuery(COMPACT_TOOLBAR_MEDIA_QUERY);
  const primaryFilters = isCompactToolbar
    ? PRIMARY_FILTERS.filter((filter) => filter.id === "status")
    : PRIMARY_FILTERS;
  const overflowFilters = isCompactToolbar
    ? PRIMARY_FILTERS.filter((filter) => filter.id !== "status")
    : [];
  const moreFilterCount = columnFilters.filter(
    (filter) =>
      MORE_FILTER_IDS.has(filter.id) ||
      overflowFilters.some((overflow) => overflow.id === filter.id),
  ).length;
  const isFiltered = columnFilters.length > 0;
  const isWideSearch = useMediaQuery(XL_MEDIA_QUERY);
  // Before the first gift arrives there is nothing to search, filter, sort
  // or page: the workspace is one empty state, not an empty table.
  const isEmptyWorkspace = !isLoading && data.length === 0 && !isFiltered;
  const hasNeedsAttentionFilter = columnFilters.some(
    (filter) => filter.id === NEEDS_ATTENTION_FILTER_ID,
  );
  const needsAttentionOptions = needsAttentionGroups.map((group) => ({
    label: needsAttentionGroupLabel(group),
    value: group.key,
  }));

  const resetFilters = () => setColumnFilters([]);

  const toolbar = (
    <>
      <DataGridSearch
        // At lg, secondary facets move into More filters and search narrows
        // to leave room for the view controls beside the open sidebar.
        className="w-full min-w-0 sm:w-64 lg:w-40 xl:w-64"
        label="Search contributions"
        placeholder={isWideSearch ? "Search donor, fund, ID…" : "Search gifts…"}
        value={searchValue}
        debounceMs={150}
        onValueChange={(value) =>
          table.getColumn(SEARCH_COLUMN_ID)?.setFilterValue(value || undefined)
        }
      />
      {primaryFilters.map((filter) => (
        <DataGridColumnFilter
          key={filter.id}
          column={table.getColumn(filter.id)}
          title={filter.title}
          options={[...filter.options]}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        aria-expanded={moreFiltersOpen}
        aria-controls={moreFiltersId}
        onClick={() => setMoreFiltersOpen((open) => !open)}
      >
        <ListFilter aria-hidden="true" />
        More filters · Source
        {moreFilterCount > 0 ? (
          <Badge variant="secondary">{moreFilterCount}</Badge>
        ) : null}
      </Button>
      <DataGridResetFilters visible={isFiltered} onReset={resetFilters} />
      <DataGridToolbarSpacer />
      {/* One group, so when the toolbar wraps on smaller screens
          the view controls stay together at the right edge. */}
      <div className="flex items-center gap-2 sm:ml-auto">
        {/* Cards have no sortable headers: phones always show cards, and
            the card view can be chosen on wider screens. */}
        <div className={view === "list" ? "flex" : "flex md:hidden"}>
          <DataGridSortSelect
            label="Sort contributions"
            options={CONTRIBUTION_SORT_LABELS}
            extraOptions={CONTRIBUTION_EXTRA_SORT_LABELS}
            fallback="date:desc"
            sorting={sorting}
            onSortingChange={setSorting}
          />
        </div>
        {view === "table" ? (
          <div className="hidden md:flex">
            <DataGridViewOptions table={table} />
          </div>
        ) : null}
        <DataGridViewToggle value={view} onValueChange={setView} />
      </div>
      {/* Staff may collapse the group while its filters stay applied; the
          count badge on the toggle keeps them visible. */}
      {moreFiltersOpen ? (
        <div
          id={moreFiltersId}
          role="group"
          aria-label="More filters"
          className="flex basis-full flex-wrap items-center gap-2"
        >
          {overflowFilters.map((filter) => (
            <DataGridColumnFilter
              key={filter.id}
              column={table.getColumn(filter.id)}
              title={filter.title}
              options={[...filter.options]}
            />
          ))}
          {needsAttentionOptions.length > 0 || hasNeedsAttentionFilter ? (
            <div data-slot={NEEDS_ATTENTION_FILTER_SLOT} className="flex">
              <DataGridColumnFilter
                column={table.getColumn(NEEDS_ATTENTION_FILTER_ID)}
                title="Needs attention"
                options={needsAttentionOptions}
              />
            </div>
          ) : null}
          <DataGridColumnFilter
            column={table.getColumn(SOURCE_FILTER_ID)}
            title="Source"
            options={[...sourceOptions]}
          />
          {hubSharedContributionFilterChips.map((chip) => (
            <DataGridColumnFilter
              key={chip.id}
              column={table.getColumn(chip.id)}
              title={chip.label}
              options={chip.options}
            />
          ))}
        </div>
      ) : null}
    </>
  );

  // The panel is the grid's one landmark (its own region labelled "Gifts");
  // the visually hidden heading keeps the page's heading outline intact.
  return (
    <div
      ref={frameRef}
      id={CONTRIBUTION_GIFTS_ID}
      tabIndex={-1}
      className="flex min-w-0 scroll-mt-4 flex-col outline-none"
    >
      <h2 className="sr-only">Gifts</h2>
      {isEmptyWorkspace ? (
        <Card>
          <section aria-label="Gifts">
            <ContributionsEmptyState
              isFiltered={false}
              onClearFilters={resetFilters}
              onRefresh={onRefresh}
            />
          </section>
        </Card>
      ) : (
        <DataGridPanel
          table={table}
          recordCount={filteredCount}
          label="Gifts"
          isLoading={isLoading}
          onRowClick={onSelectContribution}
          // "0 – 0 of 0" with a page-size picker says nothing; the empty state
          // speaks for itself.
          pagination={filteredCount > 0 ? { sizes: [10, 25, 50, 100] } : false}
          tableLayout={{ columnsPinnable: columnsOverflow }}
          view={view}
          cardLayout="balanced"
          toolbar={toolbar}
          selectionBar={
            <DataGridSelectionBar
              count={selectedRows.length}
              noun="contribution"
              onClear={() => onRowSelectionChange({})}
            >
              {hiddenSelectedCount > 0 ? (
                <p className="me-auto text-xs text-muted-foreground">
                  {hiddenSelectedCount} hidden by filters won&apos;t be included
                </p>
              ) : null}
              <Button
                size="sm"
                onClick={() => onBulkReceipt(selectedRows, hiddenSelectedCount)}
              >
                <Receipt aria-hidden="true" />
                Send receipts…
              </Button>
            </DataGridSelectionBar>
          }
          renderMobileRow={(row) => (
            <ContributionMobileRow
              row={row}
              selected={Boolean(rowSelection[row.id])}
              onOpen={onSelectContribution}
            />
          )}
          empty={
            <ContributionsEmptyState
              isFiltered={isFiltered}
              onClearFilters={resetFilters}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </div>
  );
}
