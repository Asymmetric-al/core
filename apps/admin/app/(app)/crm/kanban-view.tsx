"use client";

import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import { DataGridSearch } from "@asym/ui/components/data-grid-panel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Users,
} from "lucide-react";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  CRM_LIFECYCLE_ORDER,
  CRM_RECORD_OPEN_ATTRIBUTE,
  crmInitials,
  crmLoadErrorMessage,
  formatCrmMoneyCents,
  normalizeCrmVocabulary,
  toCrmLabel,
} from "./crm-display";
import { crmRecordsCountLabel } from "./records-grid";

import type { CrmGridRow } from "./types";
import type { ReactNode } from "react";

const UNKNOWN_STATUS = "unknown";

function statusKey(row: CrmGridRow) {
  return normalizeCrmVocabulary(row.lifecycleStatus) ?? UNKNOWN_STATUS;
}

function statusLabel(status: string) {
  return status === UNKNOWN_STATUS ? "No status" : toCrmLabel(status);
}

/** "Prospect", "Prospect and Inactive", "Prospect, Inactive and No status". */
function joinLabels(labels: string[]) {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

/** Where a lane sits inside the board's horizontal scroller. */
export interface CrmKanbanLanePosition {
  label: string;
  left: number;
  width: number;
}

/** The phone board's sideways cue: which way to scroll, and for what. */
export interface CrmKanbanLaneCue {
  direction: "after" | "before";
  text: string;
}

/**
 * The cue for the lanes not fully in view: those to the right first ("Scroll
 * sideways for …"), else those already passed ("Scroll back for …"), else
 * none, once every lane fits. A lane counts as off screen while any part of
 * it is (a peeking lane is mostly hidden).
 */
export function crmKanbanLaneCue(
  lanes: readonly CrmKanbanLanePosition[],
  { scrollLeft, clientWidth }: { scrollLeft: number; clientWidth: number },
): CrmKanbanLaneCue | null {
  const viewEnd = scrollLeft + clientWidth;
  const after = lanes.filter((lane) => lane.left + lane.width > viewEnd + 1);
  if (after.length > 0) {
    return {
      direction: "after",
      text: `Scroll sideways for ${joinLabels(after.map((lane) => lane.label))}`,
    };
  }
  const before = lanes.filter((lane) => lane.left < scrollLeft - 1);
  if (before.length > 0) {
    return {
      direction: "before",
      text: `Scroll back for ${joinLabels(before.map((lane) => lane.label))}`,
    };
  }
  return null;
}

/**
 * The status lanes in a sideways scroller. Below md one lane fills the width
 * and the next only peeks, so a cue names the lanes off to either side and
 * follows the scroll. Until the scroller is measured (server render, no
 * layout) it names every lane after the first.
 */
function KanbanLanes({
  labels,
  children,
}: {
  labels: string[];
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<{
    cue: CrmKanbanLaneCue | null;
  } | null>(null);
  const labelsKey = labels.join("\n");

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const laneLabels = labelsKey.split("\n");
    const measure = () => {
      if (scroller.clientWidth === 0) {
        setMeasured(null);
        return;
      }
      const lanes = Array.from(scroller.children, (lane, index) => ({
        label: laneLabels[index] ?? "",
        left: (lane as HTMLElement).offsetLeft,
        width: (lane as HTMLElement).offsetWidth,
      }));
      const cue = crmKanbanLaneCue(lanes, {
        scrollLeft: scroller.scrollLeft,
        clientWidth: scroller.clientWidth,
      });
      // Re-render only when the cue's words change, not on every scroll.
      setMeasured((current) =>
        current && current.cue?.text === cue?.text ? current : { cue },
      );
    };
    measure();
    scroller.addEventListener("scroll", measure, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [labelsKey]);

  const unmeasured = labels.slice(1);
  const cue = measured
    ? measured.cue
    : unmeasured.length > 0
      ? {
          direction: "after" as const,
          text: `Scroll sideways for ${joinLabels(unmeasured)}`,
        }
      : null;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {cue ? (
        <p className="flex items-center gap-1.5 px-4 text-xs text-muted-foreground md:hidden">
          {cue.direction === "before" ? (
            <ArrowLeft aria-hidden="true" className="size-3.5 shrink-0" />
          ) : null}
          <span>{cue.text}</span>
          {cue.direction === "after" ? (
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
          ) : null}
        </p>
      ) : null}
      <div
        ref={scrollerRef}
        className="relative flex gap-4 overflow-x-auto px-4 pb-1"
      >
        {children}
      </div>
    </div>
  );
}

function orderStatuses(statuses: Iterable<string>) {
  return Array.from(new Set(statuses)).sort((a, b) => {
    const rankA = CRM_LIFECYCLE_ORDER.indexOf(a);
    const rankB = CRM_LIFECYCLE_ORDER.indexOf(b);
    if (rankA !== -1 || rankB !== -1) {
      return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB);
    }
    return a.localeCompare(b);
  });
}

function KanbanCard({
  record,
  onSelect,
}: {
  record: CrmGridRow;
  onSelect: (row: CrmGridRow) => void;
}) {
  const name = record.displayName || "Unnamed record";
  const organization =
    record.primaryOrganization && record.primaryOrganization !== name
      ? record.primaryOrganization
      : null;
  const subline =
    organization ??
    record.title ??
    (record.recordType ? toCrmLabel(record.recordType) : null);
  return (
    // The name button stretches over the card, so the whole card opens it.
    <li className="relative flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs transition-colors hover:bg-accent/40">
      <div className="flex min-w-0 items-start gap-3">
        <SharedNamedViewTransition
          name={crmRecordAvatarTransitionName(record.id)}
        >
          <Avatar size="sm" aria-hidden="true">
            <AvatarImage src={record.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{crmInitials(name)}</AvatarFallback>
          </Avatar>
        </SharedNamedViewTransition>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <button
            type="button"
            {...{ [CRM_RECORD_OPEN_ATTRIBUTE]: "" }}
            onClick={() => onSelect(record)}
            className="w-full text-start after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            <SharedNamedViewTransition
              name={crmRecordTitleTransitionName(record.id)}
            >
              <span className="block truncate text-sm font-medium text-foreground">
                {name}
              </span>
            </SharedNamedViewTransition>
          </button>
          {subline ? (
            <p className="truncate text-xs text-muted-foreground">{subline}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <span className="truncate text-xs text-muted-foreground">
          {record.assignedMissionaryName ?? "No owner"}
        </span>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {formatCrmMoneyCents(record.lifetimeGiving)}
        </span>
      </div>
    </li>
  );
}

function KanbanColumn({
  status,
  records,
  onSelectRow,
  partial,
}: {
  status: string;
  records: CrmGridRow[];
  onSelectRow: (row: CrmGridRow) => void;
  /** More pages exist, so the count covers loaded records only. */
  partial: boolean;
}) {
  const headingId = useId();
  const label = statusLabel(status);
  const countLabel = `${records.length} ${partial ? "loaded " : ""}${
    records.length === 1 ? "record" : "records"
  }`;
  return (
    <section
      aria-labelledby={headingId}
      // relative: the visually hidden count stays inside the scrolling board.
      className="relative flex w-72 shrink-0 grow basis-0 flex-col gap-2 rounded-lg bg-muted/50 p-2"
    >
      <div className="flex items-center justify-between gap-2 px-1 py-0.5">
        <h3 id={headingId} className="text-sm font-medium">
          {label}
          <span className="sr-only">, {countLabel}</span>
        </h3>
        {/* While more pages exist the count covers loaded records only, so
            the visible badge says so too, not just the screen reader text. */}
        <Badge variant="outline" aria-hidden="true" title={countLabel}>
          {partial ? `${records.length} loaded` : records.length}
        </Badge>
      </div>
      <ul className="flex max-h-160 flex-col gap-2 overflow-y-auto">
        {records.map((record) => (
          <KanbanCard key={record.id} record={record} onSelect={onSelectRow} />
        ))}
      </ul>
    </section>
  );
}

/**
 * Loaded CRM records grouped by lifecycle status. The board shows the same
 * server search, filters and loaded pages as the table; it has no drag and
 * drop because status changes are not editable here.
 */
export function KanbanView({
  rows,
  onSelectRow,
  search,
  onSearchChange,
  filters,
  filtersActive = false,
  onClearFilters,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  isLoading = false,
  error = null,
  onRetry,
  actions,
}: {
  rows: CrmGridRow[];
  onSelectRow: (row: CrmGridRow) => void;
  search: string;
  onSearchChange: (value: string) => void;
  /** The table's faceted filter controls; they narrow both views. */
  filters?: ReactNode;
  filtersActive?: boolean;
  onClearFilters?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  /** Refresh and export, as the table's toolbar has them. */
  actions?: ReactNode;
}) {
  const columns = useMemo(() => {
    const grouped = new Map<string, CrmGridRow[]>();
    for (const row of rows) {
      const key = statusKey(row);
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }
    return orderStatuses(grouped.keys()).map((status) => ({
      status,
      records: grouped.get(status) ?? [],
    }));
  }, [rows]);
  const headingId = useId();

  let body;
  if (error) {
    body = (
      <div role="alert" className="mx-4 rounded-lg border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load CRM records</EmptyTitle>
            <EmptyDescription>{crmLoadErrorMessage(error)}</EmptyDescription>
          </EmptyHeader>
          {onRetry ? (
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCw aria-hidden="true" />
                Retry
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      </div>
    );
  } else if (isLoading && rows.length === 0) {
    body = (
      <div aria-busy="true" className="flex gap-4 overflow-hidden px-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex w-72 shrink-0 grow basis-0 flex-col gap-2 rounded-lg bg-muted/50 p-2"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {filtersActive ? "No matching records" : "No CRM records"}
          </EmptyTitle>
          <EmptyDescription>
            {filtersActive
              ? "No donors match this search or these filters."
              : "Donors appear here after their first gift or import."}
          </EmptyDescription>
        </EmptyHeader>
        {filtersActive && onClearFilters ? (
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear search and filters
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  } else {
    body = (
      <KanbanLanes labels={columns.map((column) => statusLabel(column.status))}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            records={column.records}
            onSelectRow={onSelectRow}
            partial={hasMore}
          />
        ))}
      </KanbanLanes>
    );
  }

  return (
    <Card className="min-w-0">
      <section
        aria-labelledby={headingId}
        className="flex min-w-0 flex-col gap-4"
      >
        {/* The board's section heading: the page has the h1, each status
            column an h3. The view toggle already says it is the board. */}
        <h2 id={headingId} className="sr-only">
          CRM board
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2 px-4">
          {/* The table's search width, so both views' toolbars line up. */}
          <DataGridSearch
            label="Search CRM records"
            placeholder="Search records…"
            value={search}
            onValueChange={onSearchChange}
            className="w-full min-w-0 sm:w-60"
          />
          {filters}
          {filtersActive && onClearFilters ? (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear search and filters
            </Button>
          ) : null}
          {/* One group at the row's end, as the table has it, with the
              table's short count: on a desktop it fits beside the filters,
              and when the row does run out the group moves down whole. */}
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground tabular-nums">
              {crmRecordsCountLabel(rows.length, hasMore)}
            </p>
            {hasMore && onLoadMore ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isFetchingMore}
                onClick={onLoadMore}
              >
                {isFetchingMore ? <Spinner /> : null}
                {isFetchingMore ? "Loading more" : "Load more"}
              </Button>
            ) : null}
            {actions}
          </div>
        </div>
        {body}
      </section>
    </Card>
  );
}
